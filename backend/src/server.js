require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

const app = express()
const PORT = process.env.PORT || 3000

/* ── Supabase client ── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

/* ── HQ Rentals config — desde .env ── */
const HQ_API_URL           = process.env.HQ_API_URL
const HQ_API_LOCATIONS_URL = process.env.HQ_API_LOCATIONS_URL
const HQ_API_CLASSES_URL   = process.env.HQ_API_CLASSES_URL
const HQ_HEADERS = {
  'Authorization': process.env.HQ_API_TOKEN,
  'Content-Type':  'application/json'
}

/* ── Middleware ── */
app.use(cors())
app.use(express.json())

/* ── Router con prefijo /api/v1 ── */
const router = express.Router()

/* ══════════════════════════════════════════
   AUTH MIDDLEWARE
══════════════════════════════════════════ */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

const adminMiddleware = (req, res, next) => {
  if (!['admin', 'agent'].includes(req.user?.role?.toLowerCase())) {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}

/* ══════════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════════ */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const mapStatus = (hqStatus) => {
  const map = {
    'available':      'AVAILABLE',
    'rented':         'RENTED',
    'maintenance':    'MAINTENANCE',
    'unavailable':    'UNAVAILABLE',
    'out_of_service': 'UNAVAILABLE',
  }
  return map[hqStatus?.toLowerCase()] || 'AVAILABLE'
}

const mapTransmission = (hqValue) => {
  const val = hqValue?.toLowerCase() || ''
  if (val.includes('manual')) return 'MANUAL'
  return 'AUTO'
}

const mapFuelType = (hqValue) => {
  const val = hqValue?.toLowerCase() || ''
  if (val.includes('diesel'))   return 'DIESEL'
  if (val.includes('electric')) return 'ELECTRIC'
  if (val.includes('hybrid'))   return 'HYBRID'
  return 'GAS'
}

const parseBrandModel = (label) => {
  const parts = label?.split(' - ')[0]?.split(' ') || []
  const brand = parts[0] || 'Unknown'
  const model = parts.slice(1).join(' ') || 'Unknown'
  return { brand, model }
}

/* ══════════════════════════════════════════
   SYNC FUNCTIONS
══════════════════════════════════════════ */
const syncLocations = async (hqLocations) => {
  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  for (const loc of hqLocations) {
    if (!loc.active) { results.skipped++; continue }
    const locationData = {
      id:              loc.id,
      name:            loc.label_for_website_translated || loc.label_for_website?.en || loc.name,
      city:            loc.city    || null,
      state:           loc.state   || null,
      address:         loc.address || null,
      phone:           loc.phone_number || null,
      active:          loc.active,
      pick_up_allowed: loc.pick_up_allowed ?? true,
      return_allowed:  loc.return_allowed  ?? true,
    }
    console.log(`  📍 location id=${loc.id} name="${locationData.name}"`)
    const { error } = await supabase
      .from('locations')
      .upsert([locationData], { onConflict: 'id' })
    if (error) results.errors.push({ id: loc.id, error: error.message })
    else results.inserted++
  }
  return results
}

const syncCategories = async (hqClasses) => {
  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  for (const cls of hqClasses) {
    if (!cls.active) { results.skipped++; continue }
    const categoryData = {
      name:        cls.label_for_website?.en || cls.name,
      description: cls.description_for_website?.en || cls.short_description_for_website?.en || null,
      icon:        cls.public_image_link || null,
      is_active:   cls.active && cls.available_on_website,
    }
    console.log(`  📂 clase id=${cls.id} name="${categoryData.name}"`)
    const { data: existing } = await supabase
      .from('vehicle_categories')
      .select('id')
      .eq('name', categoryData.name)
      .single()
    if (existing) {
      const { error } = await supabase.from('vehicle_categories').update(categoryData).eq('id', existing.id)
      if (error) results.errors.push({ name: categoryData.name, error: error.message })
      else results.updated++
    } else {
      const { error } = await supabase.from('vehicle_categories').insert([categoryData])
      if (error) results.errors.push({ name: categoryData.name, error: error.message })
      else results.inserted++
    }
  }
  return results
}

const syncVehicles = async (hqVehicles) => {
  const results = { inserted: 0, updated: 0, errors: [] }
  const { data: supabaseCategories } = await supabase.from('vehicle_categories').select('id, name')
  const categoryByName = {}
  for (const c of supabaseCategories || []) categoryByName[c.name] = c.id

  for (const hqV of hqVehicles) {
    try {
      const { brand, model } = parseBrandModel(hqV.label)
      const categoryId = categoryByName[hqV.vehicle_class_label]
      if (!categoryId) {
        results.errors.push({ plate: hqV.plate, error: `Categoría no encontrada: "${hqV.vehicle_class_label}"` })
        continue
      }
      const vehicleData = {
        category_id:        categoryId,
        brand,
        model,
        year:               hqV.year || new Date().getFullYear(),
        license_plate:      hqV.plate || hqV.vehicle_key,
        color:              hqV.color || null,
        seats:              hqV.seats || 5,
        transmission:       mapTransmission(hqV.transmission),
        fuel_type:          mapFuelType(hqV.fuel_type),
        mileage:            hqV.odometer || 0,
        features:           hqV.features || [],
        images:             hqV.images   || [],
        main_image:         hqV.main_image || hqV.image_url || null,
        status:             mapStatus(hqV.status),
        base_price_per_day: hqV.daily_rate || hqV.base_price || 0,
        notes:              hqV.notes || null,
        location_id:        hqV.current_location_id || null,
      }
      const { error } = await supabase.from('vehicles').upsert([vehicleData], { onConflict: 'license_plate' })
      if (error) results.errors.push({ plate: vehicleData.license_plate, error: error.message })
      else results.inserted++
    } catch (err) {
      results.errors.push({ plate: hqV.plate, error: err.message })
    }
  }
  return results
}

/* ══════════════════════════════════════════
   SYNC ENDPOINTS — sin prefijo /v1
══════════════════════════════════════════ */
app.get('/api/sync/all', async (req, res) => {
  try {
    console.log('\n🔄 ═══ SYNC COMPLETO ═══')

    console.log('\n📍 PASO 1: Locations...')
    const locRes = await fetch(HQ_API_LOCATIONS_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!locRes.ok) throw new Error(`HQ Locations: status ${locRes.status}`)
    const locJson = await locRes.json()
    const hqLocations = locJson.fleets_locations || []
    console.log(`  ✅ ${hqLocations.length} locations`)
    const locResults = await syncLocations(hqLocations)
    console.log('  📍 Resultado:', locResults)

    console.log('\n📂 PASO 2: Categorías...')
    const clsRes = await fetch(HQ_API_CLASSES_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!clsRes.ok) throw new Error(`HQ Classes: status ${clsRes.status}`)
    const clsJson = await clsRes.json()
    const hqClasses = clsJson.fleets_vehicle_classes || []
    console.log(`  ✅ ${hqClasses.length} clases`)
    const catResults = await syncCategories(hqClasses)
    console.log('  📂 Resultado:', catResults)

    console.log('\n🚗 PASO 3: Vehículos...')
    const vehRes = await fetch(HQ_API_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!vehRes.ok) throw new Error(`HQ Vehicles: status ${vehRes.status}`)
    const vehJson = await vehRes.json()
    if (!vehJson.success || !Array.isArray(vehJson.data))
      throw new Error(`Respuesta inesperada: ${JSON.stringify(vehJson)}`)
    const hqVehicles = vehJson.data
    console.log(`  ✅ ${hqVehicles.length} vehículos`)
    const vehResults = await syncVehicles(hqVehicles)
    console.log('  🚗 Resultado:', vehResults)

    console.log('\n✅ ═══ SYNC FINALIZADO ═══\n')
    res.json({ success: true, locations: locResults, categories: catResults, vehicles: vehResults, synced_at: new Date().toISOString() })
  } catch (err) {
    console.error('❌ Error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/sync/locations', async (req, res) => {
  try {
    const response = await fetch(HQ_API_LOCATIONS_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const json = await response.json()
    const hqLocations = json.fleets_locations || []
    const results = await syncLocations(hqLocations)
    res.json({ success: true, total_from_hq: hqLocations.length, ...results, synced_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/sync/categories', async (req, res) => {
  try {
    const response = await fetch(HQ_API_CLASSES_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const json = await response.json()
    const hqClasses = json.fleets_vehicle_classes || []
    const results = await syncCategories(hqClasses)
    res.json({ success: true, total_from_hq: hqClasses.length, ...results, synced_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/sync/vehicles', async (req, res) => {
  try {
    const response = await fetch(HQ_API_URL, { method: 'GET', headers: HQ_HEADERS })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const json = await response.json()
    if (!json.success || !Array.isArray(json.data)) throw new Error(`Respuesta inesperada`)
    const results = await syncVehicles(json.data)
    res.json({ success: true, total_from_hq: json.data.length, ...results, synced_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ══════════════════════════════════════════
   API v1 ENDPOINTS — con prefijo /api/v1
══════════════════════════════════════════ */

/* GET /api/v1/locations */
router.get('/locations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, city, state, address, pick_up_allowed')
      .eq('active', true)
      .eq('pick_up_allowed', true)
      .order('name', { ascending: true })
    if (error) throw error
    res.json({ success: true, total: data.length, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /api/v1/categories?location_id=1 */
router.get('/categories', async (req, res) => {
  try {
    const { location_id } = req.query

    if (location_id) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('category_id, vehicle_categories(id, name, icon, description, is_active)')
        .eq('location_id', parseInt(location_id))
        .eq('status', 'AVAILABLE')
      if (error) throw error

      const seen = new Set()
      const categories = []
      for (const v of data || []) {
        const cat = v.vehicle_categories
        if (cat && cat.is_active && !seen.has(cat.id)) {
          seen.add(cat.id)
          categories.push(cat)
        }
      }
      return res.json({ success: true, total: categories.length, data: categories })
    }

    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw error
    res.json({ success: true, total: data.length, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /api/v1/vehicles */
router.get('/vehicles', async (req, res) => {
  try {
    const { category_id, status, transmission, fuel_type, location_id } = req.query

    let query = supabase
      .from('vehicles')
      .select(`*, vehicle_categories(id, name, icon, description), locations(id, name, city, state, address)`)
      .order('brand', { ascending: true })

    if (location_id)  query = query.eq('location_id', parseInt(location_id))
    if (category_id)  query = query.eq('category_id', category_id)
    if (status)       query = query.eq('status', status)
    if (transmission) query = query.eq('transmission', transmission)
    if (fuel_type)    query = query.eq('fuel_type', fuel_type)

    const { data, error } = await query
    if (error) throw error
    res.json({ success: true, total: data.length, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /api/v1/vehicles/:id */
router.get('/vehicles/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`*, vehicle_categories(id, name, icon, description), locations(id, name, city, state, address)`)
      .eq('id', req.params.id)
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Vehículo no encontrado' })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── CRUD Categorías ── */
router.post('/categories',
  authMiddleware, adminMiddleware,
  [body('name').notEmpty().withMessage('El nombre es requerido')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const { name, description, icon } = req.body
      const { data, error } = await supabase.from('vehicle_categories').insert([{ name, description, icon }]).select().single()
      if (error) throw error
      res.status(201).json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

router.put('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, icon, is_active } = req.body
    const { data, error } = await supabase.from('vehicle_categories').update({ name, description, icon, is_active }).eq('id', req.params.id).select().single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('vehicle_categories').update({ is_active: false }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ message: 'Categoría desactivada', data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ── Monta el router en /api/v1 ── */
app.use('/api/v1', router)

/* ══════════════════════════════════════════
   START SERVER
══════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n🚀 Server corriendo en puerto ${PORT}`)
  console.log(`📡 Supabase:      ${process.env.SUPABASE_URL}`)
  console.log(`🚗 HQ Vehicles:   ${HQ_API_URL}`)
  console.log(`📍 HQ Locations:  ${HQ_API_LOCATIONS_URL}`)
  console.log(`📂 HQ Classes:    ${HQ_API_CLASSES_URL}`)
  console.log(`\n📋 Endpoints disponibles:`)
  console.log(`   GET /health`)
  console.log(`   GET /api/sync/all`)
  console.log(`   GET /api/sync/locations`)
  console.log(`   GET /api/sync/categories`)
  console.log(`   GET /api/sync/vehicles`)
  console.log(`   GET /api/v1/locations`)
  console.log(`   GET /api/v1/categories`)
  console.log(`   GET /api/v1/vehicles\n`)
})
