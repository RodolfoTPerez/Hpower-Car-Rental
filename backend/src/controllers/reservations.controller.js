const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

// Cache simple en memoria para consultas frecuentes
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

const getCachedData = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() })
  // Limitar cache a 50 entradas para evitar saturación
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
}

const getAll = async (req, res) => {
  try {
    const cacheKey = `reservations_${req.user.role}_${req.user.id}_${JSON.stringify(req.query)}`
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      return success(res, cachedData)
    }

    let query = supabase
      .from('reservations')
      .select(`
        *,
        customers!inner(first_name, last_name, email, phone),
        vehicles!inner(brand, model, year, license_plate, image, vehicle_categories!inner(name))
      `)
      .order('created_at', { ascending: false })
      .limit(100) // Limitar resultados para evitar sobrecarga

    if (req.user.role === 'CUSTOMER')
      query = query.eq('customer_id', req.user.id)

    const { status, from, to } = req.query
    if (status) query = query.eq('status', status)
    if (from)   query = query.gte('pickup_date', from)
    if (to)     query = query.lte('return_date', to)

    const { data, error: err } = await query
    if (err) return error(res, 'Error al obtener reservaciones', 500, err)
    
    // Cachear resultados
    setCachedData(cacheKey, data)
    
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getOne = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('reservations')
      .select(`
        *,
        customers!inner(first_name, last_name, email, phone),
        vehicles!inner(brand, model, year, license_plate, image, vehicle_categories!inner(name))
      `)
      .eq('id', req.params.id)
      .single()

    if (err || !data) return error(res, 'Reservación no encontrada', 404)

    if (req.user.role === 'CUSTOMER' && data.customer_id !== req.user.id)
      return error(res, 'No autorizado', 403)

    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const create = async (req, res) => {
  try {
    const {
      vehicle_id, pickup_date, return_date,
      pickup_location, return_location,
      notes, payment_method,
      selected_charges
    } = req.body

    if (!vehicle_id || !pickup_date || !return_date || !pickup_location || !return_location)
      return error(res, 'Faltan campos requeridos', 400)

    // Ejecutar verificación de disponibilidad y cálculo de precio en paralelo
    const [availabilityResult, pricingResult] = await Promise.all([
      supabase.rpc('is_vehicle_available', {
        p_vehicle_id: vehicle_id,
        p_start_date: pickup_date,
        p_end_date:   return_date
      }),
      supabase.rpc('calculate_reservation_price', {
        p_vehicle_id: vehicle_id,
        p_start_date: pickup_date,
        p_end_date:   return_date
      })
    ])

    const { data: available } = availabilityResult
    if (!available)
      return error(res, 'El vehículo no está disponible en esas fechas', 400)

    const { data: pricing } = pricingResult
    const price = pricing[0]

    const { data, error: err } = await supabase
      .from('reservations')
      .insert([{
        customer_id:     req.user.id,
        vehicle_id,
        agent_id:        req.user.role !== 'CUSTOMER' ? req.user.id : null,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        total_days:      price.total_days,
        base_price:      price.base_price,
        discount_amount: price.discount_amount,
        tax_amount:      price.tax_amount,
        total_amount:    price.total_amount,
        reservation_code: 'RES-' + Date.now(),
        status:          'PENDING',
        payment_status:  'PENDING',
        payment_method:  payment_method || null,
        notes:           notes || null
      }])
      .select()
      .single()

    if (err) return error(res, 'Error al crear reservación', 500, err)
    
    // GUARDAR CARGOS EXTRA EN reservation_charges
    if (selected_charges && Array.isArray(selected_charges)) {
      const chargesToInsert = selected_charges.map(charge => ({
        reservation_id: data.id,
        charge_id: charge.id,
        name: charge.name,
        amount: charge.amount || charge.calculated_amount || 0,
        charge_type: charge.charge_type || 'fixed'
      }));
      
      const { error: chargesError } = await supabase
        .from('reservation_charges')
        .insert(chargesToInsert);
      
      if (chargesError) {
        console.error('Error guardando cargos extra:', chargesError);
        // No fallar la reserva si los cargos fallan
      }
    }
    
    // Invalidar cache relevante
    cache.clear()
    
    return success(res, data, 'Reservación creada correctamente', 201)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const update = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('reservations')
      .select('id, customer_id, status')
      .eq('id', req.params.id)
      .single()

    if (!existing) return error(res, 'Reservación no encontrada', 404)

    if (req.user.role === 'CUSTOMER' && existing.customer_id !== req.user.id)
      return error(res, 'No autorizado', 403)

    if (['COMPLETED', 'CANCELLED'].includes(existing.status))
      return error(res, 'No se puede modificar una reservación completada o cancelada', 400)

    const { data, error: err } = await supabase
      .from('reservations')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (err) return error(res, 'Error al actualizar reservación', 500, err)
    return success(res, data, 'Reservación actualizada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const remove = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('reservations')
      .select('id, customer_id, status')
      .eq('id', req.params.id)
      .single()

    if (!existing) return error(res, 'Reservación no encontrada', 404)

    if (req.user.role === 'CUSTOMER' && existing.customer_id !== req.user.id)
      return error(res, 'No autorizado', 403)

    if (['ACTIVE', 'COMPLETED'].includes(existing.status))
      return error(res, 'No se puede eliminar una reservación activa o completada', 400)

    const { error: err } = await supabase
      .from('reservations')
      .update({
        status:        'CANCELLED',
        cancelled_at:  new Date().toISOString(),
        cancel_reason: req.body.cancel_reason || 'Cancelada por el usuario'
      })
      .eq('id', req.params.id)

    if (err) return error(res, 'Error al cancelar reservación', 500, err)
    return success(res, null, 'Reservación cancelada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const changeStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']

    if (!status || !validStatuses.includes(status))
      return error(res, `Estado inválido. Permitidos: ${validStatuses.join(', ')}`, 400)

    const { data, error: err } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single()

    if (err) return error(res, 'Error al cambiar estado', 500, err)
    return success(res, data, `Estado cambiado a ${status}`)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getActiveHQReservations = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let query = supabase
      .from('reservations_open')
      .select('*')
      .order('pick_up_date', { ascending: true });

    if (from) query = query.gte('pick_up_date', from);
    if (to)   query = query.lte('pick_up_date', to);

    const { data, error: err } = await query;
    if (err) return error(res, 'Error al obtener reservas activas de HQ', 500, err);
    
    return success(res, data);
  } catch (err) {
    return error(res, 'Error interno', 500, err);
  }
}

module.exports = { getAll, getOne, create, update, remove, changeStatus, getActiveHQReservations }