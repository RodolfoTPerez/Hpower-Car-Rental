const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

const getAll = async (req, res) => {
  try {
    const { category, status, brand } = req.query

    let query = supabase
      .from('vehicles')
      .select(`*, vehicle_categories(id, name, icon)`)
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category_id', category)
    if (status)   query = query.eq('status', status)
    if (brand)    query = query.ilike('brand', `%${brand}%`)

    const { data, error: err } = await query
    if (err) return error(res, 'Error al obtener vehículos', 500, err)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getAvailable = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query
    if (!startDate || !endDate)
      return error(res, 'startDate y endDate son requeridos', 400)

    const { data: reserved } = await supabase
      .from('reservations')
      .select('vehicle_id')
      .not('status', 'in', '("CANCELLED","COMPLETED")')
      .lt('pickup_date', endDate)
      .gt('return_date', startDate)

    const reservedIds = reserved ? reserved.map(r => r.vehicle_id) : []

    let query = supabase
      .from('vehicles')
      .select(`*, vehicle_categories(id, name, icon)`)
      .eq('status', 'AVAILABLE')

    if (reservedIds.length > 0)
      query = query.not('id', 'in', `(${reservedIds.map(id => `"${id}"`).join(',')})`)

    if (category) query = query.eq('category_id', category)

    const { data, error: err } = await query
    if (err) return error(res, 'Error al obtener disponibilidad', 500, err)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getOne = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('vehicles')
      .select(`*, vehicle_categories(id, name, icon)`)
      .eq('id', req.params.id)
      .single()

    if (err || !data) return error(res, 'Vehículo no encontrado', 404)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const create = async (req, res) => {
  try {
    const {
      category_id, brand, model, year, license_plate,
      color, seats, transmission, fuel_type,
      mileage, base_price_per_day, features, notes
    } = req.body

    if (!category_id || !brand || !model || !year || !license_plate || !base_price_per_day)
      return error(res, 'Faltan campos requeridos: categoría, marca, modelo, año, placa y tarifa diaria', 400)

    // Verificar si la placa ya existe
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('license_plate', license_plate)
      .single()

    if (existing) return error(res, `Ya existe un vehículo con la placa ${license_plate}`, 400)

    const { data, error: err } = await supabase
      .from('vehicles')
      .insert([{
        category_id, brand, model, year, license_plate,
        color, seats: seats || 5,
        transmission: transmission || 'AUTO',
        fuel_type: fuel_type || 'GAS',
        mileage: mileage || 0,
        base_price_per_day,
        features: features || [],
        notes,
        status: 'AVAILABLE'
      }])
      .select(`*, vehicle_categories(id, name, icon)`)
      .single()

    if (err) return error(res, 'Error al crear vehículo', 500, err)
    return success(res, data, 'Vehículo creado correctamente', 201)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const update = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('vehicles').select('id').eq('id', req.params.id).single()
    if (!existing) return error(res, 'Vehículo no encontrado', 404)

    const { data, error: err } = await supabase
      .from('vehicles')
      .update(req.body)
      .eq('id', req.params.id)
      .select(`*, vehicle_categories(id, name, icon)`)
      .single()

    if (err) return error(res, 'Error al actualizar vehículo', 500, err)
    return success(res, data, 'Vehículo actualizado correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const remove = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('vehicles').select('id, status').eq('id', req.params.id).single()
    if (!existing) return error(res, 'Vehículo no encontrado', 404)
    if (existing.status === 'RENTED')
      return error(res, 'No se puede eliminar un vehículo rentado', 400)

    const { error: err } = await supabase
      .from('vehicles').delete().eq('id', req.params.id)
    if (err) return error(res, 'Error al eliminar vehículo', 500, err)
    return success(res, null, 'Vehículo eliminado correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params
    const files = req.files
    if (!files || files.length === 0)
      return error(res, 'No se enviaron imágenes', 400)

    const urls = []
    for (const file of files) {
      const fileName = `${id}/${Date.now()}-${file.originalname}`
      const { error: uploadErr } = await supabase.storage
        .from('cars')
        .upload(fileName, file.buffer, { contentType: file.mimetype })
      if (uploadErr) continue

      const { data: urlData } = supabase.storage
        .from('cars').getPublicUrl(fileName)
      urls.push(urlData.publicUrl)
    }

    const { data: vehicle } = await supabase
      .from('vehicles').select('images, main_image').eq('id', id).single()

    const allImages = [...(vehicle?.images || []), ...urls]

    const { data, error: err } = await supabase
      .from('vehicles')
      .update({ images: allImages, main_image: vehicle?.main_image || urls[0] })
      .eq('id', id).select().single()

    if (err) return error(res, 'Error al guardar imágenes', 500, err)
    return success(res, { images: allImages, vehicle: data }, 'Imágenes subidas correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

module.exports = { getAll, getAvailable, getOne, create, update, remove, uploadImages }