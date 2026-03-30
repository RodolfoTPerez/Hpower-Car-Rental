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
const HQ_API_RATES_URL     = process.env.HQ_API_RATES_URL
const HQ_API_SEASONS_URL   = process.env.HQ_API_SEASONS_URL 
const HQ_API_CHARGES_URL   = process.env.HQ_API_CHARGES_URL || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/additional-charges'

const HQ_HEADERS = {
  'Authorization': process.env.HQ_API_TOKEN,
  'Content-Type':  'application/json'
}

/* ── Middleware ── */
app.use(cors())
app.use(express.json())

const router = express.Router()

/* ══════════════════════════════════════════
   HELPERS / MAPPERS (Originales y Completos)
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
   SYNC LOGIC (Funciones de Sincronización)
══════════════════════════════════════════ */

// FUNCIÓN ACTUALIZADA: Sincronización de Seasons y Rates (Filtro 2026 y Fix de catMap)
const syncSeasons = async (rawData) => {
  try {
    const results = { inserted: 0, skipped: 0, errors: [] };
    const items = Array.isArray(rawData) ? rawData : (rawData.data || []);

    console.log(`\n--- [SEASONS] Procesando ${items.length} registros ---`);

    for (const s of items) {
      if (!s || !s.id) {
        results.skipped++;
        continue;
      }

      // FILTRO: Solo 2025 en adelante
      const year = s.date_start ? new Date(s.date_start).getUTCFullYear() : 0;
      if (year < 2025) {
        results.skipped++;
        continue;
      }

      const { error } = await supabase
        .from('seasons')
        .upsert({
          id: s.id,
          brand_id: s.brand_id,
          name: s.name,
          date_start: s.date_start ? s.date_start.split('T')[0] : null,
          date_end: s.date_end ? s.date_end.split('T')[0] : null,
          created_at: new Date()
        }, { onConflict: 'id' });

      if (error) {
        results.errors.push(`ID ${s.id}: ${error.message}`);
      } else {
        results.inserted++;
      }
    }
    return results;
  } catch (err) {
    console.error("Error en syncSeasons:", err.message);
    return { inserted: 0, error: err.message };
  }
};


/* ══════════════════════════════════════════
   SYNC LOGIC: syncLocations (CORREGIDA)
══════════════════════════════════════════ */
const syncLocations = async (hqLocations) => {
  try {
    const results = { inserted: 0, skipped: 0, errors: [] };

    if (!hqLocations || !Array.isArray(hqLocations)) {
      return results;
    }

    for (const loc of hqLocations) {
      // Filtro ID 9 (sede interna)
      if (loc.id === 9 || loc.id === "9") {
        results.skipped++;
        continue;
      }

      // Mapeamos los campos de HQ a nuestra tabla `locations`
      const locationData = {
        id:              loc.id,
        name:            loc.label_for_website_translated || loc.label_for_website?.en || loc.name,
        city:            loc.city    || null,
        state:           loc.state   || null,
        address:         loc.address || null,
        phone:           loc.phone_number || null,
        active:          loc.active ?? true,
        pick_up_allowed: loc.pick_up_allowed ?? true,
        return_allowed:  loc.return_allowed  ?? true,
        brand_id:        loc.brand_id || null,
      };

      const { error } = await supabase
        .from('locations')
        .upsert([locationData], { onConflict: 'id' });

      if (error) {
        console.log(`❌ Error Location ID ${loc.id}: ${error.message}`);
        results.errors.push({ id: loc.id, error: error.message });
      } else {
        console.log(`✅ Location guardada: ${locationData.name}`);
        results.inserted++;
      }
    }
    
    return results;
  } catch (err) {
    console.error('Error en syncLocations:', err.message);
    return { inserted: 0, error: err.message };
  }
};

/* ══════════════════════════════════════════
   SYNC LOGIC: syncCharges (NUEVO)
══════════════════════════════════════════ */
const syncCharges = async (hqCharges) => {
  try {
    console.log(`\n--- [CHARGES] Analizando ${hqCharges.length} cargos extra desde HQ ---`);
    const results = { inserted: 0, skipped: 0, errors: [] };

    // WHITELIST DE IDs AUTORIZADOS
    const validCat1 = [136, 135, 131, 130, 52];
    const validCat4 = [139, 138, 88, 2];

    for (const charge of hqCharges) {
      const catId = charge.additional_charge_category_id;
      const chargeId = charge.id;

      // Filtro 1: Solo categorías 1 y 4, y solo IDs en la lista blanca
      if (catId === 1 && !validCat1.includes(chargeId)) { results.skipped++; continue; }
      if (catId === 4 && !validCat4.includes(chargeId)) { results.skipped++; continue; }
      if (catId !== 1 && catId !== 4) { results.skipped++; continue; }

      // Filtro 2: Exclusiones de Brand (Ignorar si excluye 1, 2 y 3)
      const exBrands = charge.excluded_brands || [];
      if (exBrands.includes("1") && exBrands.includes("2") && exBrands.includes("3")) {
        results.skipped++; 
        continue;
      }

      // Preparar payload para Supabase
      const chargeData = {
        id: chargeId,
        additional_charge_category_id: catId,
        name: charge.label_for_website?.en || charge.name,
        charge_type: charge.charge_type, // 'amount', 'daily', 'percent'
        percent_amount: charge.percent_amount || {},
        excluded_brands: exBrands,
        source: 'hq'
      };

      const { error } = await supabase
        .from('charges')
        .upsert(chargeData, { onConflict: 'id' });

      if (error) {
         results.errors.push(`ID ${chargeId}: ${error.message}`);
      } else {
         results.inserted++;
      }
    }
    return results;
  } catch(e) {
    console.error("Error en syncCharges:", e.message);
    return { inserted: 0, error: e.message };
  }
};


const syncCategories = async (hqClasses) => {
  console.log(`\n--- [CATEGORIES] Iniciando guardado de ${hqClasses.length} clases ---`);
  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] }
  const groupedByName = {}
  for (const cls of hqClasses) {
    if (!cls.active) { results.skipped++; continue }
    const name = cls.label_for_website?.en?.trim() || cls.name
    if (!groupedByName[name]) {
      groupedByName[name] = {
        name:          name,
        description:   cls.name,
        icon:          cls.public_image_link || null,
        is_active:     true, 
        hq_class_ids:  []
      };
    }
    if (!groupedByName[name].hq_class_ids.includes(cls.id.toString())) {
      groupedByName[name].hq_class_ids.push(cls.id.toString());
    }
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
        results.errors.push({ name, error: error.message });
      } else {
        results.updated++;
      }
    } else {
      const { error } = await supabase.from('vehicle_categories').insert([catData])
      if (error) {
        results.errors.push({ name, error: error.message });
      } else {
        results.inserted++;
      }
    }
  }
  return results
}

const syncVehicles = async (hqVehicles) => {
  console.log(`\n--- [VEHICLES] Iniciando guardado de ${hqVehicles.length} vehículos ---`);
  const results = { inserted: 0, updated: 0, errors: [] };
  const { data: supabaseCategories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  
  const categoryByHqId = {};
  for (const cat of supabaseCategories || []) {
    for (const hqId of (cat.hq_class_ids || [])) {
      categoryByHqId[hqId] = cat.id;
    }
  }

  const SUPABASE_STORAGE_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/cars`;

  for (const hqV of hqVehicles) {
    try {
      const { brand, model } = parseBrandModel(hqV.label);
      const categoryId = categoryByHqId[hqV.vehicle_class_id];
      if (!categoryId) continue;

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
      if (error) results.errors.push({ plate: hqV.plate, error: error.message });
      else results.inserted++;
    } catch (err) {
      results.errors.push({ plate: hqV.plate, error: err.message });
    }
  }
  return results;
};

const syncVehicleRates = async (hqRates) => {
  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  const catMap = {};
  categories?.forEach(c => c.hq_class_ids?.forEach(id => catMap[id] = c.id));

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const rate of hqRates) {
    const categoryUuid = catMap[rate.vehicle_class_id];
    const s = rate.season;
    
    if (!categoryUuid || !s) {
      results.skipped++;
      continue;
    }

    // FILTRO: Solo 2025 en adelante
    const year = s.date_start ? new Date(s.date_start).getUTCFullYear() : 0;
    if (year < 2025) {
      results.skipped++;
      continue;
    }

    const locIds = Array.isArray(rate.locations) ? rate.locations : [];
    if (locIds.length === 0) {
      results.skipped++;
      continue;
    }

    for (const locId of locIds) {
      const { error } = await supabase.from('vehicle_rates').upsert({
          vehicle_class_id: categoryUuid,
          season_id: rate.season_id,
          location_id: parseInt(locId), 
          daily_rate: parseFloat(rate.daily_rate) || 0,
          start_date: s.date_start?.split('T')[0], 
          end_date: s.date_end?.split('T')[0]
        }, { 
          onConflict: 'vehicle_class_id, season_id, location_id' 
        });

      if (error) {
        results.errors.push(`Clase ${rate.vehicle_class_id} (Loc ${locId}): ${error.message}`);
      } else {
        results.inserted++;
      }
    }
  }
  return results;
};


/* ══════════════════════════════════════════
   SYNC ENDPOINTS
══════════════════════════════════════════ */

app.get('/api/sync/all', async (req, res) => {
  try {
    console.log("\n🚀 INICIANDO SINCRONIZACIÓN TOTAL (2025+ Filter Active)");

    // Limpieza opcional de tablas antes de sincronizar (solo para evitar basura vieja)
    // await supabase.from('vehicle_rates').delete().neq('id', 0); // Limpia todo
    // await supabase.from('seasons').delete().neq('id', 0);

    // 1. LOCATIONS (Con filtro de ID 9 ya integrado en la función)
    const locRes = await fetch(HQ_API_LOCATIONS_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const locData = locRes.data || locRes.locations || locRes.fleets_locations || (Array.isArray(locRes) ? locRes : []);
    const resL = await syncLocations(locData);
    console.log(`✅ Sedes sincronizadas: ${resL.inserted}`);

    // 2. CATEGORIES (Clases de vehículos)
    const clsRes = await fetch(HQ_API_CLASSES_URL, { headers: HQ_HEADERS }).then(r => r.json());
    // Ajuste de seguridad para la llave de categorías
    const clsData = clsRes.data || clsRes.fleets_vehicle_classes || (Array.isArray(clsRes) ? clsRes : []);
    const resC = await syncCategories(clsData);
    console.log(`✅ Categorías sincronizadas: ${resC.inserted}`);

    // 3. VEHICLES (Dependen de Locaciones y Categorías)
    const vehRes = await fetch(HQ_API_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const vehData = vehRes.data || (Array.isArray(vehRes) ? vehRes : []);
    const resV = await syncVehicles(vehData);
    console.log(`✅ Vehículos sincronizados: ${resV.inserted}`);

    // 4. SEASONS (Temporadas base)
    const seasonsRes = await fetch(HQ_API_SEASONS_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const seasonsData = Array.isArray(seasonsRes) ? seasonsRes : (seasonsRes.data || []);
    const resS = await syncSeasons(seasonsData);
    console.log(`✅ Temporadas sincronizadas: ${resS.inserted}`);

    // 5. RATES (Tarifas ligadas a temporadas y categorías)
    const ratesRes = await fetch(HQ_API_RATES_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const ratesData = Array.isArray(ratesRes) ? ratesRes : (ratesRes.data || []);
    const resR = await syncVehicleRates(ratesData);
    console.log(`✅ Tarifas sincronizadas: ${resR.inserted}`);

    // Respuesta final consolidada
    res.json({ 
      success: true, 
      summary: {
        locations: resL, 
        categories: resC, 
        vehicles: resV, 
        seasons: resS,
        rates: resR
      }
    });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN SYNC ALL:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sync/locations', async (req, res) => {
  try {
    // 1. Hacemos el fetch al HQ
    const response = await fetch(HQ_API_LOCATIONS_URL, { headers: HQ_HEADERS });
    const locRes = await response.json();

    // 2. Extraemos los datos usando la llave que confirmamos: fleets_locations
    const dataToProcess = locRes.fleets_locations || [];

    // 3. Pasamos los datos a la función (que ya no usa 'api')
    const results = await syncLocations(dataToProcess);

    res.json({ 
      success: true, 
      count_received: dataToProcess.length, 
      ...results 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sync/categories', async (req, res) => {
  try {
    const r = await fetch(HQ_API_CLASSES_URL, { headers: HQ_HEADERS }).then(res => res.json());
    const results = await syncCategories(r.fleets_vehicle_classes || []);
    res.json({ success: true, ...results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sync/vehicles', async (req, res) => {
  try {
    const r = await fetch(HQ_API_URL, { headers: HQ_HEADERS }).then(res => res.json());
    const results = await syncVehicles(r.data || []);
    res.json({ success: true, ...results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sync/rates', async (req, res) => {
  try {
    const r = await fetch(HQ_API_RATES_URL, { headers: HQ_HEADERS }).then(res => res.json());
    const rates = Array.isArray(r) ? r : (r.data || []);
    const results = await syncVehicleRates(rates);
    res.json({ success: true, ...results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ENDPOINT ACTUALIZADO PARA SEASONS
app.get('/api/sync/seasons', async (req, res) => {
  try {
    console.log("--- Sincronizando Seasons (Filtrado en helper) ---");
    const response = await fetch(HQ_API_SEASONS_URL, { headers: HQ_HEADERS });
    const json = await response.json();
    const results = await syncSeasons(json);
    res.json({ success: true, ...results });
  } catch (e) {
    console.error("Error en Sync Seasons:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/sync/charges', async (req, res) => {
  try {
    const response = await fetch(HQ_API_CHARGES_URL, { headers: HQ_HEADERS });
    const json = await response.json();
    const items = json.fleets_additional_charges || (Array.isArray(json) ? json : json.data) || [];
    const results = await syncCharges(items);
    res.json({ success: true, count_received: items.length, ...results });
  } catch(e) {
    console.error("Error en Sync Charges:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
/* ══════════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════════ */
const authRoutes = require('./routes/auth.routes')
app.use('/api/v1/auth', authRoutes)

/* ══════════════════════════════════════════
   API V1 ENDPOINTS (Frontend)
══════════════════════════════════════════ */
app.use('/api/v1', router);

router.get('/locations', async (req, res) => {
  try {
    const { data, error } = await supabase.from('locations').select('*').eq('active', true);
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { location_id } = req.query;
    let query = supabase.from('vehicle_categories').select('*').eq('is_active', true);
    if (location_id && location_id !== 'undefined') {
       const { data: catIds } = await supabase.from('vehicles').select('category_id').eq('location_id', location_id);
       const ids = [...new Set(catIds?.map(v => v.category_id))];
       query = query.in('id', ids);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/vehicles', async (req, res) => {
  try {
    const { category_id, location_id } = req.query;
    const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

    // --- NUEVA LÓGICA ADICIONADA: NOMBRE DE OFICINA SELECCIONADA ---
    let selectedLocationName = null;
    if (location_id && location_id !== 'undefined') {
      const { data: locData } = await supabase.from('locations').select('name').eq('id', parseInt(location_id)).single();
      if (locData) selectedLocationName = locData.name;
    }

    // 1. Mejoramos la query para que traiga los rates filtrados por la oficina correcta
    let query = supabase.from('vehicles').select(`
        *, 
        locations (*), 
        vehicle_categories (
          *, 
          vehicle_rates (*)
        )
      `)
      .eq('status', 'AVAILABLE');

    if (location_id && location_id !== 'undefined') query = query.eq('location_id', parseInt(location_id));
    if (category_id && category_id !== 'undefined') query = query.eq('category_id', category_id);

    const { data, error } = await query.order('brand', { ascending: true });
    if (error) throw error;

    const uniqueVehiclesMap = new Map();

    data.forEach(v => {
      const key = `${v.brand}-${v.model}`.toLowerCase();
      
      // 2. LÓGICA SENIOR PARA ENCONTRAR EL RATE CORRECTO
      const allRates = v.vehicle_categories?.vehicle_rates || [];
      const currentRate = allRates.find(r => 
        r.location_id === v.location_id && 
        today >= r.start_date && 
        today <= r.end_date
      ) || { daily_rate: v.base_price_per_day }; // Fallback al precio base si no hay temporada

      if (!uniqueVehiclesMap.has(key)) {
        uniqueVehiclesMap.set(key, { 
          ...v, 
          current_rate: currentRate, // <--- Ahora sí es el rate real de hoy
          category_name: v.vehicle_categories?.name, 
          location_name: v.locations?.name, 
          total_units_available: 1 
        });
      } else {
        const existing = uniqueVehiclesMap.get(key);
        existing.total_units_available += 1;
      }
    });

    res.json({ 
      success: true, 
      selected_location_name: selectedLocationName, // <--- NOMBRE ADICIONADO PARA EL FRONT
      data: Array.from(uniqueVehiclesMap.values()) 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NUEVO ENDPOINT PARA STEP 2 WIZARD
router.get('/charges', async (req, res) => {
  try {
    const { location_id } = req.query; // location_id acts as brand_id for now as user defined 1=Miami, 2=Charlotte, etc.
    
    // 1. Obtener todas las categorías
    const { data: categories, error: catErr } = await supabase
      .from('fleets_categories')
      .select('*')
      .order('id');
    if (catErr) throw catErr;

    // 2. Obtener todos los cargos
    const { data: charges, error: charErr } = await supabase
      .from('charges')
      .select('*')
      .order('id');
    if (charErr) throw charErr;

    // 3. Filtrar cargos por excluded_brands
    let filteredCharges = charges;
    if (location_id && location_id !== 'undefined') {
      const brandIdStr = String(location_id);
      filteredCharges = charges.filter(c => {
        const excluded = c.excluded_brands || [];
        return !excluded.includes(brandIdStr);
      });
    }

    res.json({
      success: true,
      data: {
        categories: categories || [],
        charges: filteredCharges || []
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/health', (req, res) => res.send('OK'));
// NUEVO ENDPOINT PARA CONTADORES REALES
router.get('/fleet/counters', async (req, res) => {
  try {
    const { location_id } = req.query;
    
    // Traemos solo lo necesario para contar: ID y el nombre de la categoría
    let query = supabase
      .from('vehicles')
      .select('id, vehicle_categories(name)')
      .eq('status', 'AVAILABLE');

    if (location_id && location_id !== 'undefined') {
      query = query.eq('location_id', parseInt(location_id));
    }

    const { data, error } = await query;
    if (error) throw error;

    // Conteo inteligente basado en el nombre de la categoría
    const stats = {
      total: data.length,
      // Agrupamos todo lo que sea un auto compacto/mediano/grande bajo "Sedanes"
      sedan: data.filter(v => {
        const name = v.vehicle_categories?.name?.toLowerCase() || '';
        return name.includes('midsize') || name.includes('fullsize') || name.includes('icar') || name.includes('fcar');
      }).length,
      // Agrupamos tus SUVs (Intermediate, Standard, etc.)
      suv: data.filter(v => {
        const name = v.vehicle_categories?.name?.toLowerCase() || '';
        return name.includes('suv');
      }).length,
      // Agrupamos tus vans o camionetas de pasajeros
      van: data.filter(v => {
        const name = v.vehicle_categories?.name?.toLowerCase() || '';
        return name.includes('shuttle') || name.includes('minivan') || name.includes('7 passenger');
      }).length
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NOTA: El endpoint GET /locations ya está definido arriba (línea ~471) con filtro active=true

app.listen(PORT, () => {
  console.log(`\n🚀 Server corriendo en puerto ${PORT}`)
})