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

/* ── HQ Rentals config ── */
const HQ_API_URL           = process.env.HQ_API_URL
const HQ_API_LOCATIONS_URL = process.env.HQ_API_LOCATIONS_URL
const HQ_API_CLASSES_URL   = process.env.HQ_API_CLASSES_URL
const HQ_API_RATES_URL     = 'https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/rates'
const HQ_HEADERS = {
  'Authorization': process.env.HQ_API_TOKEN,
  'Content-Type':  'application/json'
}

/* ── Middleware ── */
app.use(cors())
app.use(express.json())

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
   HELPERS / MAPPERS
══════════════════════════════════════════ */
const mapStatus = (hqStatus) => {
  const map = {
    'available':      'AVAILABLE',
    'rental':         'RENTED',
    'rented':         'RENTED',
    'maintenance':    'MAINTENANCE',
    'unavailable':    'UNAVAILABLE',
    'out_of_service': 'UNAVAILABLE',
  }
  return map[hqStatus?.toLowerCase()] || 'UNAVAILABLE'
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
   SYNC LOGIC (LOCATIONS, CATEGORIES, VEHICLES)
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
    const { error } = await supabase.from('locations').upsert([locationData], { onConflict: 'id' })
    if (error) results.errors.push({ id: loc.id, error: error.message })
    else results.inserted++
  }
  return results
}

const syncCategories = async (hqClasses) => {
  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  const groupedByName = {}
  for (const cls of hqClasses) {
    if (!cls.active) { results.skipped++; continue }
    const name = cls.label_for_website?.en?.trim() || cls.name
    if (!groupedByName[name]) {
      groupedByName[name] = {
        name,
        description:  cls.name,
        icon:         cls.public_image_link || null,
        is_active:    cls.active && cls.available_on_website,
        hq_class_ids: []
      }
    }
    groupedByName[name].hq_class_ids.push(cls.id)
  }

  for (const [name, catData] of Object.entries(groupedByName)) {
    const { data: existing } = await supabase.from('vehicle_categories').select('id').eq('name', name).single()
    if (existing) {
      const { error } = await supabase.from('vehicle_categories').update({
        description: catData.description,
        icon: catData.icon,
        is_active: catData.is_active,
        hq_class_ids: catData.hq_class_ids,
      }).eq('id', existing.id)
      if (error) results.errors.push({ name, error: error.message })
      else results.updated++
    } else {
      const { error } = await supabase.from('vehicle_categories').insert([catData])
      if (error) results.errors.push({ name, error: error.message })
      else results.inserted++
    }
  }
  return results
}

const syncVehicles = async (hqVehicles) => {
  const results = { inserted: 0, updated: 0, errors: [] }
  const { data: supabaseCategories } = await supabase.from('vehicle_categories').select('id, hq_class_ids')
  
  const categoryByHqId = {}
  for (const cat of supabaseCategories || []) {
    for (const hqId of (cat.hq_class_ids || [])) {
      categoryByHqId[hqId] = cat.id
    }
  }

  for (const hqV of hqVehicles) {
    try {
      const { brand, model } = parseBrandModel(hqV.label)
      const categoryId = categoryByHqId[hqV.vehicle_class_id]
      if (!categoryId) {
        results.errors.push({ plate: hqV.plate, error: `Categoría no vinculada para HQ ID ${hqV.vehicle_class_id}` })
        continue
      }
      const vehicleData = {
        category_id: categoryId,
        brand, model,
        year: hqV.year || new Date().getFullYear(),
        license_plate: hqV.plate || hqV.vehicle_key,
        color: hqV.color || null,
        seats: hqV.seats || 5,
        transmission: mapTransmission(hqV.transmission),
        fuel_type: mapFuelType(hqV.fuel_type),
        mileage: hqV.odometer || 0,
        features: hqV.features || [],
        images: hqV.images || [],
        main_image: hqV.main_image || hqV.image_url || null,
        status: mapStatus(hqV.status),
        base_price_per_day: hqV.daily_rate || hqV.base_price || 0,
        location_id: hqV.current_location_id || null,
      }
      const { error } = await supabase.from('vehicles').upsert([vehicleData], { onConflict: 'license_plate' })
      if (error) results.errors.push({ plate: hqV.plate, error: error.message })
      else results.inserted++
    } catch (err) {
      results.errors.push({ plate: hqV.plate, error: err.message })
    }
  }
  return results
}

/* ══════════════════════════════════════════
   NUEVA PARTE: SYNC RATES
══════════════════════════════════════════ */
const syncVehicleRates = async (hqRates) => {
  const results = { inserted: 0, skipped: 0, errors: [] }
  // const hoy = new Date() // Ya no lo necesitamos si quitamos el filtro estricto

  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids')
  const categoryByHqId = {}
  for (const cat of categories || []) {
    for (const hqId of (cat.hq_class_ids || [])) {
      categoryByHqId[hqId] = cat.id
    }
  }

  for (const rate of hqRates) {
    try {
      // 1. Vínculo técnico (UUID)
      const uuid = categoryByHqId[rate.vehicle_class_id]
      
      if (!uuid) {
        // Si no tenemos la categoría en nuestra DB, no podemos guardarlo
        results.skipped++ 
        continue
      }

      // 2. Preparamos la data (Quitamos el filtro de fecha para cargar todo)
      const rateData = {
        vehicle_class_id: uuid,
        daily_rate:   parseFloat(rate.daily_rate) || 0,
        weekly_rate:  parseFloat(rate.weekly_rate) || 0,
        monthly_rate: parseFloat(rate.monthly_rate) || 0,
        season_id:    rate.season_id
      }

      const { error } = await supabase.from('vehicle_rates').insert([rateData])
      if (error) results.errors.push({ hq_id: rate.id, error: error.message })
      else results.inserted++

    } catch (err) {
      results.errors.push({ hq_id: rate.id, error: err.message })
    }
  }
  return results
}

/* ══════════════════════════════════════════
   SYNC ENDPOINTS
══════════════════════════════════════════ */
app.get('/api/sync/all', async (req, res) => {
  try {
    console.log('\n🔄 SYNC INICIADO')
    
    // 1. Locations
    const locRes = await fetch(HQ_API_LOCATIONS_URL, { headers: HQ_HEADERS })
    const locJson = await locRes.json()
    const locResults = await syncLocations(locJson.fleets_locations || [])

    // 2. Categories
    const clsRes = await fetch(HQ_API_CLASSES_URL, { headers: HQ_HEADERS })
    const clsJson = await clsRes.json()
    const catResults = await syncCategories(clsJson.fleets_vehicle_classes || [])

    // 3. Vehicles
    const vehRes = await fetch(HQ_API_URL, { headers: HQ_HEADERS })
    const vehJson = await vehRes.json()
    const vehResults = await syncVehicles(vehJson.data || [])

    // 4. Rates (Nueva Parte)
    const ratesRes = await fetch(HQ_API_RATES_URL, { headers: HQ_HEADERS })
    const ratesJson = await ratesRes.json()
    const ratesResults = await syncVehicleRates(ratesJson.data || [])

    res.json({ success: true, locations: locResults, categories: catResults, vehicles: vehResults, rates: ratesResults })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/sync/rates', async (req, res) => {
  try {
    const response = await fetch(HQ_API_RATES_URL, { headers: HQ_HEADERS });
    
    // 1. Usamos un nombre de variable único (ratesRaw) para evitar el SyntaxError
    const ratesRaw = await response.json(); 

    // 2. LOG de diagnóstico para que veas en la consola qué llega
    console.log("Muestra de HQ:", JSON.stringify(ratesRaw).substring(0, 100));

    // 3. VALIDACIÓN SENIOR: 
    // Si ratesRaw es un array, úsalo directamente. Si no, busca la propiedad .data
    const ratesData = Array.isArray(ratesRaw) ? ratesRaw : (ratesRaw.data || []);

    // 4. Procesamos
    const results = await syncVehicleRates(ratesData);

    res.json({ success: true, ...results });
  } catch (err) {
    console.error("Error en sync/rates:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Conservamos tus otros endpoints de sync (locations, categories, vehicles)...
app.get('/api/sync/locations', async (req, res) => { /* ... código original ... */ })
app.get('/api/sync/categories', async (req, res) => { /* ... código original ... */ })
app.get('/api/sync/vehicles', async (req, res) => { /* ... código original ... */ })

/* ══════════════════════════════════════════
   API V1 ENDPOINTS (CONTENIDO ORIGINAL)
══════════════════════════════════════════ */
app.use('/api/v1', router)

router.get('/locations', async (req, res) => {
  const { data, error } = await supabase.from('locations').select('*').eq('active', true)
  res.json({ success: !error, data })
})

router.get('/categories', async (req, res) => {
  const { data, error } = await supabase.from('vehicle_categories').select('*').eq('is_active', true)
  res.json({ success: !error, data })
})

router.get('/vehicles', async (req, res) => {
  const { data, error } = await supabase.from('vehicles').select('*, vehicle_categories(*)').eq('status', 'AVAILABLE')
  res.json({ success: !error, data })
})

app.listen(PORT, () => {
  console.log(`🚀 Server en puerto ${PORT}`)
  console.log(`💰 Sync Rates disponible en: /api/sync/rates`)
})