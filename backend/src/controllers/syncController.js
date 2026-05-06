const hqService = require('../services/hqService');
const supabase = require('../config/supabase');

// Helper para enviar logs al stream SSE o guardarlos en el request
const sendSSELog = (req, type, message, data = null) => {
  const logEntry = { type, message, data, timestamp: new Date().toISOString() };

  // Guardar logs en el request para devolverlos en la respuesta
  if (req) {
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push(logEntry);
  }

  // También intentar enviar al stream SSE si está disponible
  if (req && req.app && req.app.locals.sseClient) {
    req.app.locals.sseClient.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  }
};

/* ── HELPERS / MAPPERS ── */
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

/* ── SYNC FUNCTIONS ── */
const syncLocations = async (hqLocations, req = null) => {
  console.log(`\n--- [LOCATIONS] Iniciando guardado de ${hqLocations.length} registros ---`);
  if (req) {
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push({ type: 'info', message: `--- [LOCATIONS] Iniciando guardado de ${hqLocations.length} registros ---` });
  }

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  for (const loc of hqLocations) {
    if (!loc.active) { results.skipped++; continue }
    const addressStr = typeof loc.address === 'object' && loc.address !== null
      ? (loc.address.address1 || JSON.stringify(loc.address))
      : (loc.address || null);

    const locationData = {
      id:              loc.id,
      name:            loc.label_for_website_translated || loc.label_for_website?.en || loc.name,
      city:            loc.city    || (typeof loc.address === 'object' ? loc.address.city : null),
      state:           loc.state   || (typeof loc.address === 'object' ? loc.address.state : null),
      address:         addressStr,
      phone:           loc.phone_number || (typeof loc.address === 'object' ? loc.address.phone : null),
      active:          loc.active,
      pick_up_allowed: loc.pick_up_allowed ?? true,
      return_allowed:  loc.return_allowed  ?? true,
    }
    const { error } = await supabase.from('locations').upsert([locationData], { onConflict: 'id' })
    if (error) {
      console.log(`❌ Error Location ID ${loc.id}: ${error.message}`);
      sendSSELog(req, 'error', `❌ Error Location ID ${loc.id}: ${error.message}`);
      results.errors.push({ id: loc.id, error: error.message });
    } else {
      console.log(`✅ Location guardada: ${locationData.name}`);
      sendSSELog(req, 'success', `✅ Location guardada: ${locationData.name}`);
      results.inserted++;
    }
  }
  sendSSELog(req, 'complete', `Proceso LOCATIONS finalizado ✅`, results);
  return results
}

const syncCategories = async (hqClasses, req = null) => {
  console.log(`\n--- [CATEGORIES] Iniciando guardado de ${hqClasses.length} clases ---`);
  if (req) {
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push({ type: 'info', message: `--- [CATEGORIES] Iniciando guardado de ${hqClasses.length} clases ---` });
  }

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  const groupedByName = {}
  for (const cls of hqClasses) {
    if (!cls.active) { results.skipped++; continue }
    const name = cls.label_for_website?.en?.trim() || cls.name
    if (!groupedByName[name]) {
      groupedByName[name] = {
        name,
        description:  cls.name,
        icon:          cls.public_image_link || null,
        is_active:     cls.active && cls.available_on_website,
        hq_class_ids: []
      }
    }
    groupedByName[name].hq_class_ids.push(cls.id)
  }

  for (const [name, catData] of Object.entries(groupedByName)) {
    const { data: existing } = await supabase.from('vehicle_categories').select('id').eq('name', name).maybeSingle()
    if (existing) {
      const { error } = await supabase.from('vehicle_categories').update({
        description: catData.description,
        icon: catData.icon,
        is_active: catData.is_active,
        hq_class_ids: catData.hq_class_ids,
      }).eq('id', existing.id)
      if (error) {
        console.log(`❌ Error Categoría ${name}: ${error.message}`);
        sendSSELog(req, 'error', `❌ Error Categoría ${name}: ${error.message}`);
        results.errors.push({ name, error: error.message });
      } else {
        console.log(`✅ Categoría actualizada: ${name}`);
        sendSSELog(req, 'success', `✅ Categoría actualizada: ${name}`);
        results.updated++;
      }
    } else {
      const { error } = await supabase.from('vehicle_categories').insert([catData])
      if (error) {
        console.log(`❌ Error Categoría ${name}: ${error.message}`);
        sendSSELog(req, 'error', `❌ Error Categoría ${name}: ${error.message}`);
        results.errors.push({ name, error: error.message });
      } else {
        console.log(`✅ Categoría insertada: ${name}`);
        sendSSELog(req, 'success', `✅ Categoría insertada: ${name}`);
        results.inserted++;
      }
    }
  }
  sendSSELog(req, 'complete', `Proceso CATEGORIES finalizado ✅`, results);
  return results
}

const syncVehicles = async (hqVehicles, req = null) => {
  console.log(`\n--- [VEHICLES] Iniciando guardado de ${hqVehicles.length} vehículos ---`);
  if (req) {
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push({ type: 'info', message: `--- [VEHICLES] Iniciando guardado de ${hqVehicles.length} vehículos ---` });
  }
  const results = { inserted: 0, updated: 0, errors: [] };
  const { data: supabaseCategories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  
  const categoryByHqId = {};
  for (const cat of supabaseCategories || []) {
    for (const hqId of (cat.hq_class_ids || [])) {
      categoryByHqId[hqId] = cat.id;
    }
  }

  const SUPABASE_STORAGE_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/cars`;
  let batchCount = 0;
  for (const hqV of hqVehicles) {
    try {
      const { brand, model } = parseBrandModel(hqV.label);
      const categoryId = categoryByHqId[hqV.vehicle_class_id];
      if (!categoryId) {
        console.log(`⚠️ Saltando auto ${hqV.plate}: No se encontró categoría Supabase para Class ID ${hqV.vehicle_class_id}`);
        continue;
      }

      const imageName = model.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); 
      const customImage = `${SUPABASE_STORAGE_URL}/${imageName}.jpg`;

      const vehicleData = {
        category_id: categoryId,
        brand, 
        model,
        year: hqV.year || new Date().getFullYear(),
        license_plate: hqV.plate || hqV.vehicle_key,
        color: hqV.color || null,
        seats: hqV.seats || 5,
        transmission: mapTransmission(hqV.transmission),
        fuel_type: mapFuelType(hqV.fuel_type),
        mileage: hqV.odometer || 0,
        features: hqV.features || [],
        images: hqV.images || [],
        main_image: customImage, 
        status: mapStatus(hqV.status),
        base_price_per_day: hqV.daily_rate || hqV.base_price || 0,
        location_id: hqV.current_location_id || null,
      };

      const { error } = await supabase.from('vehicles').upsert([vehicleData], { onConflict: 'license_plate' });
      if (error) {
        console.log(`❌ Error Auto ${hqV.plate}: ${error.message}`);
        sendSSELog(req, 'error', `❌ Error Auto ${hqV.plate}: ${error.message}`);
        results.errors.push({ plate: hqV.plate, error: error.message });
      } else {
        results.inserted++;
        batchCount++;
        // Batching logs para vehículos (ajustado a 30 por petición del usuario)
        if (batchCount % 30 === 0) {
          sendSSELog(req, 'success', `✅ Actualizando flota: ${batchCount} vehículos procesados...`);
        }
      }
    } catch (vErr) {
      console.log(`❌ Error procesando auto individual: ${vErr.message}`);
    }
  }
  sendSSELog(req, 'complete', `Proceso VEHICLES finalizado ✅ (${results.inserted} procesados)`, results);
  return results;
};

const syncVehicleRates = async (hqRates, req = null) => {
  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  const catMap = {};
  categories?.forEach(c => c.hq_class_ids?.forEach(id => catMap[id] = c.id));
  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const rate of hqRates) {
    const categoryUuid = catMap[rate.vehicle_class_id];
    const s = rate.season;
    if (!categoryUuid || !s) { results.skipped++; continue; }
    const year = s.date_start ? new Date(s.date_start).getUTCFullYear() : 0;
    if (year < 2025) { results.skipped++; continue; }

    const locIds = Array.isArray(rate.locations) ? rate.locations : [];
    if (locIds.length === 0) { results.skipped++; continue; }

    for (const locId of locIds) {
      const { error } = await supabase.from('vehicle_rates').upsert({
        vehicle_class_id: categoryUuid,
        season_id: rate.season_id,
        location_id: parseInt(locId),
        daily_rate: parseFloat(rate.daily_rate) || 0,
        start_date: s.date_start?.split('T')[0],
        end_date: s.date_end?.split('T')[0]
      }, { onConflict: 'vehicle_class_id, season_id, location_id' });
      if (error) {
        results.errors.push(`Clase ${rate.vehicle_class_id} (Loc ${locId}): ${error.message}`);
        sendSSELog(req, 'error', `Error Rate: ${error.message}`);
      } else {
        results.inserted++;
      }
    }
  }
  sendSSELog(req, 'complete', `Proceso RATES finalizado ✅`, results);
  return results;
};

const syncSeasons = async (rawData, req = null) => {
  try {
    const results = { inserted: 0, skipped: 0, errors: [] };
    const items = Array.isArray(rawData) ? rawData : (rawData.data || []);
    console.log(`\n--- [SEASONS] Datos recibidos: ${items.length} temporadas ---`);
    if (req) {
      if (!req.syncLogs) req.syncLogs = [];
      req.syncLogs.push({ type: 'info', message: `--- [SEASONS] Datos recibidos: ${items.length} temporadas ---` });
    }

    for (const s of items) {
      if (!s || !s.id) { results.skipped++; continue; }
      const year = s.date_start ? new Date(s.date_start).getUTCFullYear() : 0;
      console.log(`Temporada: ${s.name} | Año: ${year} | ID: ${s.id}`);

      if (year < 2025) {
        console.log(`⚠️ Saltada (año < 2025): ${s.name}`);
        results.skipped++;
        continue;
      }

      const { error } = await supabase.from('seasons').upsert({
        id: s.id,
        brand_id: s.brand_id,
        name: s.name,
        date_start: s.date_start ? s.date_start.split('T')[0] : null,
        date_end: s.date_end ? s.date_end.split('T')[0] : null,
        created_at: new Date()
      }, { onConflict: 'id' });

      if (error) {
        console.log(`❌ Error ${s.name}: ${error.message}`);
        sendSSELog(req, 'error', `❌ Error ${s.name}: ${error.message}`);
        results.errors.push(`ID ${s.id}: ${error.message}`);
      } else {
        console.log(`✅ Guardada: ${s.name}`);
        sendSSELog(req, 'success', `✅ Guardada: ${s.name}`);
        results.inserted++;
      }
    }

    console.log(`--- [SEASONS] Resumen: Insertados: ${results.inserted} | Saltados: ${results.skipped} | Errores: ${results.errors.length} ---`);
    sendSSELog(req, 'complete', `Proceso SEASONS finalizado ✅`, results);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: results.inserted > 0 ? 'success' : 'warning',
        title: 'Sync Seasons',
        message: `Sync Seasons: ${results.inserted} insertadas, ${results.skipped} saltadas, ${results.errors.length} errores`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    return results;
  } catch (err) {
    console.log(`❌ Error syncSeasons: ${err.message}`);
    return { inserted: 0, error: err.message };
  }
};

const syncCharges = async (hqCharges, req = null) => {
  try {
    const results = { inserted: 0, skipped: 0, errors: [] };
    sendSSELog(req, 'info', `--- [CHARGES] Iniciando guardado de ${hqCharges.length} cargos ---`);
    const validCat1 = [136, 135, 131, 130, 52];
    const validCat3 = [155, 154, 153, 152, 151, 120, 108, 69, 68, 65, 64, 63, 62, 61, 60, 53, 38, 37, 7];
    const validCat4 = [139, 138, 88, 2];

    for (const charge of hqCharges) {
      const catId = charge.additional_charge_category_id;
      const chargeId = charge.id;
      if (catId === 1 && !validCat1.includes(chargeId)) { results.skipped++; continue; }
      if (catId === 3 && !validCat3.includes(chargeId)) { results.skipped++; continue; }
      if (catId === 4 && !validCat4.includes(chargeId)) { results.skipped++; continue; }
      if (catId !== 1 && catId !== 3 && catId !== 4) { results.skipped++; continue; }

      const exBrands = charge.excluded_brands || [];
      if (exBrands.includes("1") && exBrands.includes("2") && exBrands.includes("3")) { results.skipped++; continue; }

      const chargeData = {
        id: chargeId,
        additional_charge_category_id: catId,
        name: charge.label_for_website?.en || charge.name,
        charge_type: charge.charge_type, // 'amount', 'daily', 'percent'
        percent_amount: charge.percent_amount || {},
        excluded_brands: exBrands,
        source: 'hq'
      };

      const { error } = await supabase.from('charges').upsert(chargeData, { onConflict: 'id' });
      if (error) {
        results.errors.push(`ID ${chargeId}: ${error.message}`);
        sendSSELog(req, 'error', `Error Charge ID ${chargeId}: ${error.message}`);
      } else {
        results.inserted++;
      }
    }

    sendSSELog(req, 'complete', `Proceso CHARGES finalizado ✅`, results);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: results.inserted > 0 ? 'success' : 'warning',
        title: 'Sync Charges',
        message: `Sync Charges: ${results.inserted} insertados, ${results.skipped} saltados, ${results.errors.length} errores`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    sendSSELog(req, 'complete', `Proceso CHARGES finalizado ✅`, results);
    return results;
  } catch (e) {
    return { inserted: 0, error: e.message };
  }
};

const syncReservations = async (hqReservations, req = null) => {
  console.log(`\n--- [RESERVATIONS] Iniciando guardado de ${hqReservations.length} reservas ---`);
  if (req) {
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push({ type: 'info', message: `--- [RESERVATIONS] Iniciando guardado de ${hqReservations.length} reservas ---` });
  }

  const results = { inserted: 0, updated: 0, errors: [] };
  
  let batchCount = 0;
  for (const res of hqReservations) {
    const reservationData = {
      id: res.id,
      prefixed_id: res.prefixed_id,
      pick_up_date: res.pick_up_date,
      return_date: res.return_date,
      brand_id: res.brand_id,
      vehicle_class_id: res.vehicle_class_id,
      customer_id: res.customer_id,
      total_paid: parseFloat(res.total_paid) || 0,
      total_days: res.total_days,
      status: res.status,
      total_price: parseFloat(res.total_price) || 0,
      synced_at: new Date()
    };

    const { error } = await supabase.from('reservations_open').upsert([reservationData], { onConflict: 'id' });
    if (error) {
      console.log(`❌ Error Reserva ID ${res.id}: ${error.message}`);
      sendSSELog(req, 'error', `❌ Error Reserva ID ${res.id}: ${error.message}`);
      results.errors.push({ id: res.id, error: error.message });
    } else {
      results.inserted++;
      batchCount++;
      // Enviar log cada 100 reservas para máxima fluidez (ajustado a 100 por petición del usuario)
      if (batchCount % 100 === 0) {
        sendSSELog(req, 'success', `✅ Sincronizando reservas: ${batchCount} procesadas...`);
      }
    }
  }
  sendSSELog(req, 'complete', `Proceso RESERVATIONS finalizado ✅ (${results.inserted} procesadas)`, results);
  return results;
}

/* ── CONTROLLER EXPORTS ── */
exports.syncAll = async (req, res) => {
  try {
    console.log("\n🚀 INICIANDO SINCRONIZACIÓN TOTAL");

    // 0. LIMPIEZA GLOBAL DE TODAS LAS TABLAS
    console.log("\n🧹 PASO 0: LIMPIEZA GLOBAL DE BASE DE DATOS");
    if (!req.syncLogs) req.syncLogs = [];
    req.syncLogs.push({ type: 'info', message: '🧹 PASO 0: LIMPIEZA GLOBAL DE BASE DE DATOS', timestamp: new Date().toISOString() });

    // Orden crítico: tablas hijas primero, luego padres (respetando foreign keys)
    const tables = [
      'reservations',           // Hija de vehicles
      'reservations_open',      // Independiente (sincronización HQ)
      'vehicle_rates',          // Hija de vehicles
      'vehicles',               // Hija de vehicle_categories y locations
      'notifications',          // Independiente
      'charges',                // Independiente
      'seasons',                // Independiente
      'vehicle_categories',     // Padre de vehicles
      'locations'              // Padre de vehicles
    ];

    for (const table of tables) {
      console.log(`> Limpiando tabla: ${table}...`);
      sendSSELog(req, 'info', `Limpiando tabla: ${table}...`);

      // Usar filtro que siempre sea verdadero para cumplir con requerimiento de WHERE
      const { error } = await supabase.from(table).delete().not('id', 'is', null);

      if (error && error.code !== 'PGRST116') { // Ignorar error si la tabla ya está vacía
        console.log(`❌ Error limpiando ${table}: ${error.message}`);
        sendSSELog(req, 'error', `❌ Error limpiando ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table} limpiada correctamente`);
        sendSSELog(req, 'success', `✅ ${table} limpiada correctamente`);
      }
    }

    console.log("\n📥 PASO 1: SINCRONIZACIÓN DE DATOS DESDE HQ RENTALS");
    sendSSELog(req, 'info', '📥 PASO 1: SINCRONIZACIÓN DE DATOS DESDE HQ RENTALS');

    // LOCATIONS
    console.log("\n--- CONSULTANDO HQ RENTALS (LOCATIONS) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (LOCATIONS) ---');
    const locRes = await hqService.fetchHQ(hqService.hqUrls.locations);
    const resL = await syncLocations(locRes.fleets_locations || [], req);

    // CATEGORIES
    console.log("\n--- CONSULTANDO HQ RENTALS (CATEGORIES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (CATEGORIES) ---');
    const clsRes = await hqService.fetchHQ(hqService.hqUrls.classes);
    const resC = await syncCategories(clsRes.fleets_vehicle_classes || [], req);

    // VEHICLES
    console.log("\n--- CONSULTANDO HQ RENTALS (VEHICLES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (VEHICLES) ---');
    const vehRes = await hqService.fetchHQ(hqService.hqUrls.vehicles);
    const resV = await syncVehicles(vehRes.data || [], req);

    // RATES
    console.log("\n--- CONSULTANDO HQ RENTALS (RATES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (RATES) ---');
    const ratesRes = await hqService.fetchHQ(hqService.hqUrls.rates);
    const ratesData = Array.isArray(ratesRes) ? ratesRes : (ratesRes.data || []);
    const resR = await syncVehicleRates(ratesData, req);

    // SEASONS
    console.log("\n--- CONSULTANDO HQ RENTALS (SEASONS) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (SEASONS) ---');
    const seasonsRes = await hqService.fetchHQ(hqService.hqUrls.seasons);
    const resS = await syncSeasons(seasonsRes, req);

    // CHARGES
    console.log("\n--- CONSULTANDO HQ RENTALS (CHARGES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (CHARGES) ---');
    const chargesRes = await hqService.fetchHQ(hqService.hqUrls.charges);
    const chargesItems = chargesRes.charges || chargesRes.fleets_additional_charges || [];
    const resCh = await syncCharges(chargesItems, req);

    // RESERVATIONS
    console.log("\n--- CONSULTANDO HQ RENTALS (RESERVATIONS) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (RESERVATIONS) ---');

    // BUG FIX 2: brands/totalInserted/allErrors no estaban declaradas en syncAll → ReferenceError
    const brands = ["1", "2", "3"];
    let totalInserted = 0;
    const allErrors = [];

    for (const bId of brands) {
        let brandItems = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const filters = [
                {"type":"string","column":"brand_id","operator":"equals","value": bId},
                {"type":"string","column":"status","operator":"equals","value":["open"]}
            ];
            const resUrl = `${hqService.hqUrls.reservations || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/reservations'}?filters=${JSON.stringify(filters)}&limit=100&page=${page}`;

            try {
                const hqData = await hqService.fetchHQ(resUrl);
                const items = hqData.data || [];
                if (items.length === 0) { hasMore = false; break; }
                brandItems = brandItems.concat(items);
                if (items.length < 100) hasMore = false;
                else page++;
            } catch (err) {
                allErrors.push(`Brand ${bId} Page ${page}: ${err.message}`);
                hasMore = false;
            }
        }

        if (brandItems.length >= 0) {
            const resResults = await syncReservations(brandItems, req);
            totalInserted += resResults.inserted;
            if (resResults.errors.length > 0) allErrors.push(...resResults.errors);
        }
    }

    res.json({
      success: true,
      summary: {
        locations: resL,
        categories: resC,
        vehicles: resV,
        rates: resR,
        seasons: resS,
        charges: resCh,
        reservations: { inserted: totalInserted, errors: allErrors }
      },
      logs: req.syncLogs || []
    });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN SYNC ALL:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncLocations = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (LOCATIONS) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (LOCATIONS) ---');
    const r = await hqService.fetchHQ(hqService.hqUrls.locations);
    const results = await syncLocations(r.fleets_locations || [], req);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: 'success',
        title: 'Sync Locations',
        message: `Sync Locations: ${results.inserted} ubicaciones actualizadas`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    res.json({ success: true, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    sendSSELog(req, 'error', `Error en syncLocations: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.syncCategories = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (CATEGORIES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (CATEGORIES) ---');
    const r = await hqService.fetchHQ(hqService.hqUrls.classes);
    const results = await syncCategories(r.fleets_vehicle_classes || [], req);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: 'success',
        title: 'Sync Categories',
        message: `Sync Categories: ${results.inserted + results.updated} procesadas`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    res.json({ success: true, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.syncRates = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (RATES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (RATES) ---');

    const r = await hqService.fetchHQ(hqService.hqUrls.rates);
    const rates = Array.isArray(r) ? r : (r.data || []);
    const results = await syncVehicleRates(rates, req);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: 'success',
        title: 'Sync Rates',
        message: `Sync Rates: ${results.inserted} procesadas, ${results.skipped} saltadas`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    res.json({ success: true, count: rates.length, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.syncCharges = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (CHARGES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (CHARGES) ---');
    const r = await hqService.fetchHQ(hqService.hqUrls.charges);
    const items = r.charges || r.fleets_additional_charges || [];
    const results = await syncCharges(items, req);
    res.json({ success: true, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.syncReservations = async (req, res) => {
  try {
    console.log(`\n--- CONSULTANDO HQ RENTALS (RESERVATIONS - GLOBAL OPEN) ---`);
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (RESERVATIONS - GLOBAL OPEN) ---');

    const brands = ["1", "2", "3"];
    let totalInserted = 0;
    const allErrors = [];

    // Sincronizar todas las reservaciones abiertas sin filtro de fecha
    for (const bId of brands) {
        console.log(`> Procesando Brand ID: ${bId} (Objetivo: todas las reservas abiertas)`);
        sendSSELog(req, 'info', `Procesando Brand ID: ${bId}`);
        let brandItems = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const filters = [
                {"type":"string","column":"brand_id","operator":"equals","value": bId},
                {"type":"string","column":"status","operator":"equals","value":["open"]}
            ];
            const resUrl = `${hqService.hqUrls.reservations || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/reservations'}?filters=${JSON.stringify(filters)}&limit=100&page=${page}`;

            try {
                const hqData = await hqService.fetchHQ(resUrl);
                const items = hqData.data || [];
                if (items.length === 0) { hasMore = false; break; }
                brandItems = brandItems.concat(items);
                if (items.length < 100) hasMore = false;
                else page++;
            } catch (err) {
                console.error(`Error fetching page ${page} for brand ${bId}:`, err.message);
                allErrors.push(`Brand ${bId} Page ${page}: ${err.message}`);
                hasMore = false;
            }
        }

        console.log(`> Brand ${bId}: ${brandItems.length} reservaciones encontradas`);
        sendSSELog(req, 'info', `Brand ${bId}: ${brandItems.length} reservaciones encontradas`);

        for (const res of brandItems) {
            try {
                const reservationData = {
                    id: res.id,
                    prefixed_id: res.prefixed_id,
                    pick_up_date: res.pick_up_date,
                    return_date: res.return_date,
                    brand_id: res.brand_id,
                    vehicle_class_id: res.vehicle_class_id,
                    customer_id: res.customer_id,
                    total_paid: parseFloat(res.total_paid) || 0,
                    total_days: res.total_days,
                    status: res.status,
                    total_price: parseFloat(res.total_price) || 0,
                    synced_at: new Date()
                };

                const { error } = await supabase.from('reservations_open').upsert([reservationData], { onConflict: 'id' });
                if (error) {
                    console.error(`Error upsert ID ${res.id}:`, error.message);
                    allErrors.push(`ID ${res.id}: ${error.message}`);
                } else {
                    console.log(`✅ Reserva guardada: #${res.prefixed_id || res.id}`);
                    totalInserted++;
                }
            } catch (err) {
                console.error(`Error procesando reserva ID ${res.id}:`, err.message);
                allErrors.push(`ID ${res.id}: ${err.message}`);
            }
        }
    }

    console.log(`> ✅ Sincronización completada: ${totalInserted} reservaciones insertadas/actualizadas`);
    if (allErrors.length > 0) {
        console.log(`> ⚠️ Errores: ${allErrors.length}`);
    }

    res.json({ success: true, inserted: totalInserted, errors: allErrors, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.getSyncStatus = async (req, res) => {
  try {
    // Obtener información de las tablas para determinar el estado de sincronización
    const [locations, categories, vehicles, seasons, charges] = await Promise.all([
      supabase.from('locations').select('id, created_at').order('created_at', { ascending: false }).limit(1),
      supabase.from('vehicle_categories').select('id, created_at').order('created_at', { ascending: false }).limit(1),
      supabase.from('vehicles').select('id, created_at').order('created_at', { ascending: false }).limit(1),
      supabase.from('seasons').select('id, created_at').order('created_at', { ascending: false }).limit(1),
      supabase.from('charges').select('id, created_at').order('created_at', { ascending: false }).limit(1)
    ]);

    const formatLastSync = (data) => {
      if (!data || data.length === 0) return 'Never';
      const lastSync = new Date(data[0].created_at);
      const now = new Date();
      const diffMs = now - lastSync;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    };

    const syncModules = [
      {
        id: 'locations',
        module: 'Fleet & Vehicles',
        source: 'HQ Rentals API',
        lastSync: formatLastSync(locations.data),
        status: locations.data && locations.data.length > 0 ? 'success' : 'pending'
      },
      {
        id: 'categories',
        module: 'Rates & Pricing',
        source: 'HQ Rentals API',
        lastSync: formatLastSync(categories.data),
        status: categories.data && categories.data.length > 0 ? 'success' : 'pending'
      },
      {
        id: 'charges',
        module: 'Extras & Charges',
        source: 'HQ Rentals API',
        lastSync: formatLastSync(charges.data),
        status: charges.data && charges.data.length > 0 ? 'success' : 'pending'
      },
      {
        id: 'seasons',
        module: 'Taxes & Fees',
        source: 'HQ Rentals API',
        lastSync: formatLastSync(seasons.data),
        status: seasons.data && seasons.data.length > 0 ? 'success' : 'pending'
      }
    ];

    res.json({ success: true, data: syncModules });
  } catch (err) {
    console.error('Error getting sync status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncVehicles = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (VEHICLES) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (VEHICLES) ---');

    const r = await hqService.fetchHQ(hqService.hqUrls.vehicles);
    const results = await syncVehicles(r.data || [], req);

    // Crear notificación
    try {
      await supabase.from('notifications').insert({
        type: 'success',
        title: 'Sync Vehicles',
        message: `Sync Vehicles: ${results.inserted} insertadas, ${results.skipped} saltados`
      });
    } catch (notifError) {
      console.log('⚠️ No se pudo crear notificación:', notifError.message);
    }

    res.json({ success: true, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.syncSeasons = async (req, res) => {
  try {
    console.log("\n--- CONSULTANDO HQ RENTALS (SEASONS) ---");
    sendSSELog(req, 'info', '--- CONSULTANDO HQ RENTALS (SEAS) ---');

    const r = await hqService.fetchHQ(hqService.hqUrls.seasons);
    const results = await syncSeasons(r, req);
    res.json({ success: true, ...results, logs: req.syncLogs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: req.syncLogs || [] });
  }
};

exports.clearDatabase = async (req, res) => {
  try {
    console.log("\n🧹 INICIANDO LIMPIEZA DE BASE DE DATOS");

    // Orden crítico: tablas hijas primero, luego padres (respetando foreign keys)
    const tables = [
      'reservations',           // Hija de vehicles
      'reservations_open',      // Independiente (sincronización HQ)
      'vehicle_rates',          // Hija de vehicles
      'vehicles',               // Hija de vehicle_categories y locations
      'notifications',          // Independiente
      'charges',                // Independiente
      'seasons',                // Independiente
      'vehicle_categories',     // Padre de vehicles
      'locations'              // Padre de vehicles
    ];

    const results = {};

    for (const table of tables) {
      console.log(`> Limpiando tabla: ${table}...`);

      // Usar filtro que siempre sea verdadero para cumplir con requerimiento de WHERE
      const { error } = await supabase.from(table).delete().not('id', 'is', null);

      if (error && error.code !== 'PGRST116') { // Ignorar error si la tabla ya está vacía
        console.log(`❌ Error limpiando ${table}: ${error.message}`);
        results[table] = { success: false, error: error.message };
      } else {
        console.log(`✅ ${table} limpiada correctamente`);
        results[table] = { success: true };
      }
    }

    const tablesCleared = Object.keys(results).filter(t => results[t].success);
    const totalDeleted = tablesCleared.length;
    
    res.json({ 
      success: true, 
      tables: tablesCleared,
      totalDeleted,
      results 
    });
  } catch (err) {
    console.error("❌ ERROR EN CLEAR DATABASE:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};