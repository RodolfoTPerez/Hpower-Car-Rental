const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

const getAll = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('pricing_rules')
      .select(`*, vehicles(brand, model), vehicle_categories(name)`)
      .order('created_at', { ascending: false })
    if (err) return error(res, 'Error al obtener precios', 500, err)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getByVehicle = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('vehicle_id', req.params.id)
      .eq('is_active', true)
      .order('priority', { ascending: false })
    if (err) return error(res, 'Error al obtener precios', 500, err)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const calculate = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query
    if (!vehicleId || !startDate || !endDate)
      return error(res, 'vehicleId, startDate y endDate son requeridos', 400)

    const { data, error: err } = await supabase
      .rpc('calculate_reservation_price', {
        p_vehicle_id: vehicleId,
        p_start_date: startDate,
        p_end_date:   endDate
      })
    if (err) return error(res, 'Error al calcular precio', 500, err)
    return success(res, data[0])
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const create = async (req, res) => {
  try {
    const {
      vehicle_id, category_id, rule_name,
      start_date, end_date, price_per_day,
      price_per_week, price_per_month,
      discount_7_days, discount_14_days, discount_30_days,
      tax_percentage, priority
    } = req.body

    if (!rule_name || !start_date || !end_date || !price_per_day)
      return error(res, 'rule_name, start_date, end_date y price_per_day son requeridos', 400)

    const { data, error: err } = await supabase
      .from('pricing_rules')
      .insert([{
        vehicle_id,
        category_id,
        rule_name,
        start_date,
        end_date,
        price_per_day,
        price_per_week:   price_per_week  || null,
        price_per_month:  price_per_month || null,
        discount_7_days:  discount_7_days  || 5.00,
        discount_14_days: discount_14_days || 10.00,
        discount_30_days: discount_30_days || 15.00,
        tax_percentage:   tax_percentage   || 0.00,
        priority:         priority         || 1
      }])
      .select()
      .single()

    if (err) return error(res, 'Error al crear regla de precio', 500, err)
    return success(res, data, 'Regla de precio creada correctamente', 201)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const update = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('pricing_rules')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()
    if (err) return error(res, 'Error al actualizar precio', 500, err)
    return success(res, data, 'Precio actualizado correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const remove = async (req, res) => {
  try {
    const { error: err } = await supabase
      .from('pricing_rules')
      .update({ is_active: false })
      .eq('id', req.params.id)
    if (err) return error(res, 'Error al eliminar precio', 500, err)
    return success(res, null, 'Regla de precio eliminada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const importCSV = async (req, res) => {
  try {
    return success(res, null, 'Importación recibida — módulo en construcción')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

module.exports = { getAll, getByVehicle, calculate, create, update, remove, importCSV }