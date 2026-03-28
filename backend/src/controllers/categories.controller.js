const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

const getAll = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (err) return error(res, 'Error al obtener categorías', 500, err)
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
      .from('vehicle_categories')
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
      .from('vehicle_categories')
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
      .from('vehicle_categories')
      .update({ is_active: false })
      .eq('id', req.params.id)
    if (err) return error(res, 'Error al eliminar categoría', 500, err)
    return success(res, null, 'Categoría eliminada correctamente')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

module.exports = { getAll, getOne, create, update, remove }