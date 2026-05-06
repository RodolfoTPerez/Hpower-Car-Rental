const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')
const getAll = async (req, res) => {
  try {
    const { location_id, category_id } = req.query;

    console.log("--- INICIO DE PETICIÓN VEHÍCULOS ---");
    console.log("location_id:", location_id, "| category_id:", category_id);

    // 1. Construir query con filtros dinámicos
    let query = supabase
      .from('vehicles')
      .select('*, vehicle_categories(id, name, icon)')
      .eq('status', 'AVAILABLE');

    if (location_id && location_id !== 'undefined') {
      query = query.eq('location_id', parseInt(location_id));
    }
    if (category_id && category_id !== 'undefined') {
      query = query.eq('category_id', category_id);
    }

    const { data: vehicles, error: err } = await query;

    if (err) {
      console.error("❌ ERROR:", err.message);
      return error(res, 'Error al obtener vehículos', 500, err);
    }

    // 2. Obtener tarifas vigentes por categoría desde vehicle_rates
    const today = new Date().toISOString().split('T')[0];
    const { data: rates } = await supabase
      .from('vehicle_rates')
      .select('vehicle_class_id, daily_rate, location_id')
      .lte('start_date', today)
      .gte('end_date', today);

    // Mapear: category_id + location_id → daily_rate
    const rateMap = {};
    for (const r of (rates || [])) {
      const key = `${r.vehicle_class_id}__${r.location_id}`;
      const keyGeneral = `${r.vehicle_class_id}__general`;
      if (!rateMap[key]) rateMap[key] = r.daily_rate;
      if (!rateMap[keyGeneral]) rateMap[keyGeneral] = r.daily_rate;
    }

    // 3. Agrupar por brand + model (1 card por modelo, con conteo y tarifa)
    const grouped = {};
    for (const v of (vehicles || [])) {
      const key = `${v.brand}__${v.model}__${v.category_id}`;
      if (!grouped[key]) {
        // Buscar tarifa: primero por categoría+location, luego solo categoría
        const rateKey = `${v.category_id}__${v.location_id}`;
        const rateKeyGeneral = `${v.category_id}__general`;
        const daily_rate = rateMap[rateKey] || rateMap[rateKeyGeneral] || v.base_price_per_day || 0;

        grouped[key] = {
          ...v,
          total_units_available: 0,
          current_rate: { daily_rate },
          base_price_per_day: daily_rate
        };
      }
      grouped[key].total_units_available++;
    }

    const result = Object.values(grouped);

    console.log("✅ Vehículos encontrados:", vehicles?.length || 0);
    console.log("✅ Modelos agrupados:", result.length);
    console.log("✅ Tarifas vigentes encontradas:", rates?.length || 0);
    console.log("--- FIN DE PETICIÓN VEHÍCULOS ---");

    // 4. Obtener nombre de la ubicación si fue proporcionada
    let selected_location_name = null;
    if (location_id && location_id !== 'undefined') {
      const { data: loc } = await supabase
        .from('locations')
        .select('name')
        .eq('id', parseInt(location_id))
        .single();
      selected_location_name = loc?.name || null;
    }

    // 5. Responder con formato que el frontend espera
    return res.json({
      success: true,
      message: 'OK',
      data: result,
      selected_location_name
    });

  } catch (err) {
    console.error("🔥 FALLO CRÍTICO EN EL CONTROLADOR:", err);
    return error(res, 'Error interno', 500, err);
  }
};


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