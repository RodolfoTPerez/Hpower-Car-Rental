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
const syncSeasons = async (hqSeasons) => {
  console.log(`\n🚀 [INICIO SYNC] Analizando array de HQ con ${hqSeasons.length} elementos.`);
  const results = { inserted: 0, skipped: 0, errors: [] };

  // 1. Auditoría de dependencias
  const { data: locations } = await supabase.from('locations').select('id, name');
  const validLocs = new Set(locations?.map(l => l.id) || []);
  console.log(`📍 DB Local tiene ${validLocs.size} oficinas autorizadas: [${Array.from(validLocs).join(', ')}]`);

  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  const catMap = {};
  categories?.forEach(c => c.hq_class_ids?.forEach(id => catMap[id] = c.id));

  // 2. Procesamiento registro por registro
  for (const [index, s] of hqSeasons.entries()) {
    console.log(`\n--- [PASO ${index + 1}] Analizando Season ID: ${s.id} ("${s.name}") ---`);

    // Limpieza de fechas
    const startDate = s.date_start ? s.date_start.split('T')[0] : 'N/A';
    const endDate = s.date_end ? s.date_end.split('T')[0] : 'N/A';
    const startYear = parseInt(startDate.substring(0, 4));
    const endYear = parseInt(endDate.substring(0, 4));

    console.log(`   📅 Rango: ${startDate} al ${endDate} | Oficina HQ: ${s.brand_id}`);

    // FILTRO DE AÑO 2026
    const toca2026 = (startYear <= 2026 && endYear >= 2026);
    if (!toca2026) {
      console.log(`   ❌ SALTADO: No toca el año 2026 (Rango fuera de interés).`);
      results.skipped++;
      continue;
    }
    console.log(`   ✅ FILTRO AÑO: Pasa el filtro de 2026.`);

    // VALIDACIÓN DE OFICINA
    if (!validLocs.has(s.brand_id)) {
      console.log(`   ❌ ERROR FK: La oficina ${s.brand_id} NO EXISTE en tu tabla 'locations'. Corre el sync de locations primero.`);
      results.skipped++;
      continue;
    }
    console.log(`   ✅ OFICINA: ID ${s.brand_id} encontrada en DB local.`);

    // GUARDADO EN SUPABASE
    console.log(`   💾 Intentando UPSERT en tabla 'seasons'...`);
    const { error: sError } = await supabase.from('seasons').upsert({
      id: s.id,
      brand_id: s.brand_id,
      name: s.name,
      date_start: startDate,
      date_end: endDate
    }, { onConflict: 'id' });

    if (sError) {
      console.log(`   🔴 ERROR DB (Season): ${sError.message}`);
      results.errors.push({ id: s.id, error: sError.message });
      continue;
    }
    console.log(`   ✨ Season guardada con éxito.`);

    // PROCESAR RATES
    if (s.rates && s.rates.length > 0) {
      console.log(`   💰 Procesando ${s.rates.length} tarifas internas...`);
      let ratesSaved = 0;
      for (const r of s.rates) {
        const catUuid = catMap[r.vehicle_class_id];
        if (catUuid) {
          const { error: rError } = await supabase.from('vehicle_rates').upsert({
            vehicle_class_id: catUuid,
            location_id: s.brand_id,
            season_id: s.id,
            daily_rate: parseFloat(r.daily_rate) || 0,
            weekly_rate: parseFloat(r.weekly_rate) || 0,
            monthly_rate: parseFloat(r.monthly_rate) || 0,
            start_date: startDate,
            end_date: endDate
          }, { onConflict: 'vehicle_class_id, location_id, season_id' });
          
          if (!rError) ratesSaved++;
        }
      }
      console.log(`   📈 Tarifas actualizadas: ${ratesSaved} de ${s.rates.length}`);
    } else {
      console.log(`   ⚠️ No se encontraron rates en el JSON para esta temporada.`);
    }

    results.inserted++;
  }

  console.log(`\n🏁 [FIN DEL PROCESO] Insertados/Actualizados: ${results.inserted} | Saltados: ${results.skipped} | Errores: ${results.errors.length}`);
  return results;
};

const syncLocations = async () => {
  try {
    const res = await api.get('/locations');
    const locationsFromHQ = res.data.data;
    if (!locationsFromHQ || locationsFromHQ.length === 0) {
      console.log('⚠️ No se recibieron datos del HQ');
      return;
    }

    for (const loc of locationsFromHQ) {
      // 1. Preparamos el objeto con los nombres exactos de TU base de datos
      const locationData = {
        id: loc.id,              // Usamos 'id' como primary key según tu tabla
        name: loc.name,
        city: loc.city,          // Asegúrate de traer estos campos también
        state: loc.state,
        address: loc.address,
        phone: loc.phone,
        active: loc.active,
        brand_id: loc.brand_id, 
        
        updated_at: new Date()
      };

      // 2. Tu lógica de upsert (Asegúrate de que db.locations apunte a public.locations)
      await db.locations.upsert(locationData, { onConflict: 'id' });
    }
    
    console.log('Sincronización exitosa: datos del HQ mapeados a brand_id.');
  } catch (err) {
    console.error('Error en sincronización:', err);
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
  console.log(`\n--- [RATES] Iniciando guardado de ${hqRates.length} tarifas ---`);
  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  const catMap = {};
  categories?.forEach(c => c.hq_class_ids?.forEach(id => catMap[id] = c.id));

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const rate of hqRates) {
    const uuid = catMap[rate.vehicle_class_id];
    if (!uuid) { results.skipped++; continue; }

    const dailyPrice = parseFloat(rate.daily_rate) || 0;
    const rawStart = rate.season?.date_start;
    const rawEnd = rate.season?.date_end;

    if (dailyPrice <= 0 || !rawStart || !rawEnd) {
      results.skipped++;
      continue;
    }

    const { error } = await supabase.from('vehicle_rates').upsert({
        vehicle_class_id: uuid,
        season_id: rate.season_id,
        daily_rate: dailyPrice,
        weekly_rate: parseFloat(rate.weekly_rate) || 0,
        monthly_rate: parseFloat(rate.monthly_rate) || 0,
        start_date: rawStart.split('T')[0], 
        end_date: rawEnd.split('T')[0]
      }, { onConflict: 'vehicle_class_id, season_id' });

    if (error) results.errors.push(`ID ${rate.id}: ${error.message}`);
    else results.inserted++;
  }
  return results;
};

/* ══════════════════════════════════════════
   SYNC ENDPOINTS
══════════════════════════════════════════ */

app.get('/api/sync/all', async (req, res) => {
  try {
    console.log("\n🚀 INICIANDO SINCRONIZACIÓN TOTAL");
    const locRes = await fetch(HQ_API_LOCATIONS_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const resL = await syncLocations(locRes.fleets_locations || []);

    const clsRes = await fetch(HQ_API_CLASSES_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const resC = await syncCategories(clsRes.fleets_vehicle_classes || []);

    const vehRes = await fetch(HQ_API_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const resV = await syncVehicles(vehRes.data || []);

    // Sincronizamos Seasons (que ya trae sus rates internos)
    const seasonsRes = await fetch(HQ_API_SEASONS_URL, { headers: HQ_HEADERS }).then(r => r.json());
    const seasonsData = Array.isArray(seasonsRes) ? seasonsRes : (seasonsRes.data || []);
    const resS = await syncSeasons(seasonsData);

    res.json({ success: true, locations: resL, categories: resC, vehicles: resV, seasons_and_rates: resS });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sync/locations', async (req, res) => {
  try {
    const r = await fetch(HQ_API_LOCATIONS_URL, { headers: HQ_HEADERS }).then(res => res.json());
    
    // ESTO TE DIRÁ EL NOMBRE EXACTO DE LA LLAVE
    console.log("Llaves que vienen del HQ:", Object.keys(r)); 
    
    // Si la consola dice que la llave es 'locations' y no 'fleets_locations', cámbialo aquí:
    const data = r.fleets_locations || r.locations || []; 
    
    const results = await syncLocations(data);
    res.json({ success: true, ...results });
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
    console.log("\n--- CONSULTANDO HQ RENTALS (SEASONS 2026) ---");
    const r = await fetch(HQ_API_SEASONS_URL, { headers: HQ_HEADERS }).then(res => res.json());
    const rawSeasons = Array.isArray(r) ? r : (r.data || []);
    const results = await syncSeasons(rawSeasons);
    res.json({ success: true, ...results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

/* ── NUEVO ENDPOINT: TRAER SEDES DINÁMICAMENTE ── */
router.get('/locations', async (req, res) => {
  try {
// EN EL BACKEND DEL HQ (Archivo de rutas o controladores)
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, city, state, address, phone, active') // <--- ASEGÚRATE QUE ESTÉ AQUÍ
    .order('city', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server corriendo en puerto ${PORT}`)
})