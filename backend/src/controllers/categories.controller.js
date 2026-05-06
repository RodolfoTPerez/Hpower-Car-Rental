const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

const getAll = async (req, res) => {
  try {
    const { location_id } = req.query

    // Si hay location_id, solo devuelve categorías que tengan vehículos en esa ubicación
    if (location_id) {
      const { data: vehicles, error: vErr } = await supabase
        .from('vehicles')
        .select('category_id')
        .eq('location_id', parseInt(location_id))
        .eq('status', 'AVAILABLE')

      if (vErr) return error(res, 'Error al filtrar por ubicación', 500, vErr)

      const uniqueCatIds = [...new Set(vehicles.map(v => v.category_id).filter(Boolean))]
      if (uniqueCatIds.length === 0) return success(res, [])

      const { data, error: err } = await supabase
        .from('vehicle_categories')
        .select('*')
        .in('id', uniqueCatIds)
        .eq('is_active', true)
        .order('name')

      if (err) return error(res, 'Error al obtener categorías', 500, err)
      return success(res, data)
    }

    // Sin filtro: devuelve todas las categorías desde vehicle_categories
    console.log('=== LEYENDO vehicle_categories ===');
    const { data, error: err } = await supabase
      .from('vehicle_categories')
      .select('*')
      .order('name')

    console.log('Error vehicle_categories:', err);
    console.log('Data vehicle_categories:', data);

    if (err) {
      console.log('Error en vehicle_categories:', err.message);
      return error(res, 'Error al obtener categorías', 500, err)
    }

    console.log(' vehicle_categories data count:', data?.length || 0);
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const getOne = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (err || !data) return error(res, 'Categoría no encontrada', 404)
    return success(res, data)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const create = async (req, res) => {
  try {
    const { name, description, icon } = req.body
    if (!name) return error(res, 'El nombre es requerido', 400)

    const { data, error: err } = await supabase
      .from('fleets_categories')
      .insert([{ name, description, icon }])
      .select()
      .single()
    if (err) return error(res, 'Error al crear categoría', 500, err)
    return success(res, data, 'Categoría creada correctamente', 201)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const update = async (req, res) => {
  console.log("✅ RESPUESTA DE SUPABASE RECIBIDA");
  try {
    const { data, error: err } = await supabase
      .from('fleets_categories')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()
    if (err) return error(res, 'Error al actualizar categoría', 500, err)
    return success(res, data, 'Categoría actualizada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const remove = async (req, res) => {
  try {
    const { error: err } = await supabase
      .from('fleets_categories')
      .update({ is_active: false })
      .eq('id', req.params.id)
    if (err) return error(res, 'Error al eliminar categoría', 500, err)
    return success(res, null, 'Categoría eliminada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

module.exports = { getAll, getOne, create, update, remove }