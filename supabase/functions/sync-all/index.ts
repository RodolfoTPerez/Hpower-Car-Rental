import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuración
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HQ_API_TOKEN = Deno.env.get('HQ_API_TOKEN')!

const HQ_HEADERS = {
  'Authorization': HQ_API_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const hqUrls = {
  locations: Deno.env.get('HQ_API_LOCATIONS_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/locations',
  classes: Deno.env.get('HQ_API_CLASSES_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/vehicle-classes',
  rates: Deno.env.get('HQ_API_RATES_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/rates',
  seasons: Deno.env.get('HQ_API_SEASONS_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/seasons',
  charges: Deno.env.get('HQ_API_CHARGES_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/additional-charges',
  vehicles: Deno.env.get('HQ_API_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/vehicles',
  reservations: Deno.env.get('HQ_API_RESERVATIONS_URL') || 'https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/reservations'
};

// Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Logs array
const logs: any[] = [];

const addLog = (type: string, message: string, data: any = null) => {
  logs.push({ type, message, data, timestamp: new Date().toISOString() });
  console.log(`[${type}] ${message}`);
};

// HELPERS / MAPPERS
const mapStatus = (hqStatus: string) => {
  const map: Record<string, string> = {
    'available': 'AVAILABLE',
    'rental': 'RENTED',
    'rented': 'RENTED',
    'maintenance': 'MAINTENANCE',
    'unavailable': 'UNAVAILABLE',
    'out_of_service': 'UNAVAILABLE',
  };
  return map[hqStatus?.toLowerCase()] || 'UNAVAILABLE';
};

const mapTransmission = (hqValue: string) => {
  const val = hqValue?.toLowerCase() || '';
  if (val.includes('manual')) return 'MANUAL';
  return 'AUTO';
};

const mapFuelType = (hqValue: string) => {
  const val = hqValue?.toLowerCase() || '';
  if (val.includes('diesel')) return 'DIESEL';
  if (val.includes('electric')) return 'ELECTRIC';
  if (val.includes('hybrid')) return 'HYBRID';
  return 'GAS';
};

const parseBrandModel = (label: string) => {
  const parts = label?.split(' - ')[0]?.split(' ') || [];
  const brand = parts[0] || 'Unknown';
  const model = parts.slice(1).join(' ') || 'Unknown';
  return { brand, model };
};

// Fetch HQ API
const fetchHQ = async (url: string) => {
  const response = await fetch(url, { headers: HQ_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// SYNC FUNCTIONS
const syncLocations = async (hqLocations: any[]) => {
  addLog('info', `--- [LOCATIONS] Iniciando guardado de ${hqLocations.length} registros ---`);

  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla locations...');
  const { error: clearError } = await supabase.from('locations').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando locations: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla locations limpiada');
  }

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  
  for (const loc of hqLocations) {
    if (!loc.active) { results.skipped++; continue; }
    const addressStr = typeof loc.address === 'object' && loc.address !== null
      ? (loc.address.address1 || JSON.stringify(loc.address))
      : (loc.address || null);

    const locationData = {
      id: loc.id,
      name: loc.label_for_website_translated || loc.label_for_website?.en || loc.name,
      city: loc.city || (typeof loc.address === 'object' ? loc.address.city : null),
      state: loc.state || (typeof loc.address === 'object' ? loc.address.state : null),
      address: addressStr,
      phone: loc.phone_number || (typeof loc.address === 'object' ? loc.address.phone : null),
      active: loc.active,
      pick_up_allowed: loc.pick_up_allowed ?? true,
      return_allowed: loc.return_allowed ?? true,
    };
    
    const { error } = await supabase.from('locations').upsert([locationData], { onConflict: 'id' });
    if (error) {
      addLog('error', `❌ Error Location ID ${loc.id}: ${error.message}`);
      results.errors.push({ id: loc.id, error: error.message });
    } else {
      addLog('success', `✅ Location guardada: ${locationData.name}`);
      results.inserted++;
    }
  }
  
  addLog('complete', `Proceso LOCATIONS finalizado ✅`, results);
  return results;
};

const syncCategories = async (hqClasses: any[]) => {
  addLog('info', `--- [CATEGORIES] Iniciando guardado de ${hqClasses.length} clases ---`);

  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla vehicle_categories...');
  const { error: clearError } = await supabase.from('vehicle_categories').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando vehicle_categories: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla vehicle_categories limpiada');
  }

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const groupedByName: Record<string, any> = {};
  
  for (const cls of hqClasses) {
    if (!cls.active) { results.skipped++; continue; }
    const name = cls.label_for_website?.en?.trim() || cls.name;
    if (!groupedByName[name]) {
      groupedByName[name] = {
        name,
        description: cls.name,
        icon: cls.public_image_link || null,
        is_active: cls.active && cls.available_on_website,
        hq_class_ids: []
      };
    }
    groupedByName[name].hq_class_ids.push(cls.id);
  }

  for (const [name, catData] of Object.entries(groupedByName)) {
    const { data: existing } = await supabase.from('vehicle_categories').select('id').eq('name', name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('vehicle_categories').update({
        description: catData.description,
        icon: catData.icon,
        is_active: catData.is_active,
        hq_class_ids: catData.hq_class_ids,
      }).eq('id', existing.id);
      if (error) {
        addLog('error', `❌ Error Categoría ${name}: ${error.message}`);
        results.errors.push({ name, error: error.message });
      } else {
        addLog('success', `✅ Categoría actualizada: ${name}`);
        results.updated++;
      }
    } else {
      const { error } = await supabase.from('vehicle_categories').insert([catData]);
      if (error) {
        addLog('error', `❌ Error Categoría ${name}: ${error.message}`);
        results.errors.push({ name, error: error.message });
      } else {
        addLog('success', `✅ Categoría insertada: ${name}`);
        results.inserted++;
      }
    }
  }
  
  addLog('complete', `Proceso CATEGORIES finalizado ✅`, results);
  return results;
};

const syncVehicles = async (hqVehicles: any[]) => {
  addLog('info', `--- [VEHICLES] Iniciando guardado de ${hqVehicles.length} vehículos ---`);

  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla vehicles...');
  const { error: clearError } = await supabase.from('vehicles').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando vehicles: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla vehicles limpiada');
  }

  const results = { inserted: 0, updated: 0, errors: [] };
  const { data: supabaseCategories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  
  const categoryByHqId: Record<string, string> = {};
  for (const cat of supabaseCategories || []) {
    for (const hqId of (cat.hq_class_ids || [])) {
      categoryByHqId[hqId] = cat.id;
    }
  }

  const SUPABASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/cars`;

  for (const hqV of hqVehicles) {
    try {
      const { brand, model } = parseBrandModel(hqV.label);
      const categoryId = categoryByHqId[hqV.vehicle_class_id];
      if (!categoryId) {
        addLog('info', `⚠️ Saltando auto ${hqV.plate}: No se encontró categoría Supabase para Class ID ${hqV.vehicle_class_id}`);
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
        addLog('error', `❌ Error Auto ${hqV.plate}: ${error.message}`);
        results.errors.push({ plate: hqV.plate, error: error.message });
      } else {
        addLog('success', `✅ Auto guardado: ${brand} ${model} (${hqV.plate || 'S/P'})`);
        results.inserted++;
      }
    } catch (err: any) {
      addLog('error', `Error Auto ${hqV.plate}: ${err.message}`);
      results.errors.push({ plate: hqV.plate, error: err.message });
    }
  }
  
  addLog('complete', `Proceso VEHICLES finalizado ✅`, results);
  return results;
};

const syncVehicleRates = async (hqRates: any[]) => {
  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla vehicle_rates...');
  const { error: clearError } = await supabase.from('vehicle_rates').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando vehicle_rates: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla vehicle_rates limpiada');
  }

  const { data: categories } = await supabase.from('vehicle_categories').select('id, hq_class_ids');
  const catMap: Record<string, string> = {};
  categories?.forEach((c: any) => c.hq_class_ids?.forEach((id: string) => catMap[id] = c.id));
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
        addLog('error', `Error Rate: ${error.message}`);
      } else {
        results.inserted++;
      }
    }
  }
  
  addLog('complete', `Proceso RATES finalizado ✅`, results);
  return results;
};

const syncSeasons = async (rawData: any) => {
  const results = { inserted: 0, skipped: 0, errors: [] };
  const items = Array.isArray(rawData) ? rawData : (rawData.data || []);
  addLog('info', `--- [SEASONS] Datos recibidos: ${items.length} temporadas ---`);

  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla seasons...');
  const { error: clearError } = await supabase.from('seasons').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando seasons: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla seasons limpiada');
  }

  for (const s of items) {
    if (!s || !s.id) { results.skipped++; continue; }
    const year = s.date_start ? new Date(s.date_start).getUTCFullYear() : 0;

    if (year < 2025) {
      addLog('info', `⚠️ Saltada (año < 2025): ${s.name}`);
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
      addLog('error', `❌ Error ${s.name}: ${error.message}`);
      results.errors.push(`ID ${s.id}: ${error.message}`);
    } else {
      addLog('success', `✅ Guardada: ${s.name}`);
      results.inserted++;
    }
  }

  addLog('complete', `Proceso SEASONS finalizado ✅`, results);
  return results;
};

const syncCharges = async (hqCharges: any[]) => {
  const results = { inserted: 0, skipped: 0, errors: [] };
  addLog('info', `--- [CHARGES] Iniciando guardado de ${hqCharges.length} cargos ---`);
  
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
      charge_type: charge.charge_type,
      percent_amount: charge.percent_amount || {},
      excluded_brands: exBrands,
      source: 'hq'
    };

    const { error } = await supabase.from('charges').upsert(chargeData, { onConflict: 'id' });
    if (error) {
      results.errors.push(`ID ${chargeId}: ${error.message}`);
      addLog('error', `Error Charge ID ${chargeId}: ${error.message}`);
    } else {
      results.inserted++;
    }
  }

  addLog('complete', `Proceso CHARGES finalizado ✅`, results);
  return results;
};

const syncReservations = async (hqReservations: any[]) => {
  addLog('info', `--- [RESERVATIONS] Iniciando guardado de ${hqReservations.length} reservas ---`);

  // LIMPIEZA DE TABLA
  addLog('info', '🧹 Borrando tabla reservations_open...');
  const { error: clearError } = await supabase.from('reservations_open').delete().not('id', 'is', null);
  if (clearError && clearError.code !== 'PGRST116') {
    addLog('error', `❌ Error limpiando reservations_open: ${clearError.message}`);
  } else {
    addLog('success', '✅ Tabla reservations_open limpiada');
  }

  const results = { inserted: 0, updated: 0, errors: [] };

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
      addLog('error', `❌ Error Reserva ID ${res.id}: ${error.message}`);
      results.errors.push({ id: res.id, error: error.message });
    } else {
      addLog('success', `✅ Reserva guardada: #${res.prefixed_id || res.id}`);
      results.inserted++;
    }
  }

  addLog('complete', `Proceso RESERVATIONS finalizado ✅`, results);
  return results;
};

// MAIN SYNC ALL FUNCTION
const syncAll = async () => {
  addLog('info', '🚀 INICIANDO SINCRONIZACIÓN TOTAL');

  // LIMPIEZA GLOBAL DE TODAS LAS TABLAS
  addLog('info', '🧹 PASO 0: LIMPIEZA GLOBAL DE BASE DE DATOS');

  const tables = [
    'reservations',
    'reservations_open',
    'vehicle_rates',
    'vehicles',
    'notifications',
    'charges',
    'seasons',
    'vehicle_categories',
    'locations'
  ];

  for (const table of tables) {
    addLog('info', `Limpiando tabla: ${table}...`);
    const { error } = await supabase.from(table).delete().not('id', 'is', null);

    if (error && error.code !== 'PGRST116') {
      addLog('error', `❌ Error limpiando ${table}: ${error.message}`);
    } else {
      addLog('success', `✅ ${table} limpiada correctamente`);
    }
  }

  addLog('info', '📥 PASO 1: SINCRONIZACIÓN DE DATOS DESDE HQ RENTALS');

  const locRes = await fetchHQ(hqUrls.locations);
  const resL = await syncLocations(locRes.fleets_locations || []);

  const clsRes = await fetchHQ(hqUrls.classes);
  const resC = await syncCategories(clsRes.fleets_vehicle_classes || []);

  const vehRes = await fetchHQ(hqUrls.vehicles);
  const resV = await syncVehicles(vehRes.data || []);

  const ratesRes = await fetchHQ(hqUrls.rates);
  const ratesData = Array.isArray(ratesRes) ? ratesRes : (ratesRes.data || []);
  const resR = await syncVehicleRates(ratesData);

  const seasonsRes = await fetchHQ(hqUrls.seasons);
  const resS = await syncSeasons(seasonsRes);

  const chargesRes = await fetchHQ(hqUrls.charges);
  const chargesItems = chargesRes.charges || chargesRes.fleets_additional_charges || [];
  const resCh = await syncCharges(chargesItems);

  // Sync Reservations
  const brands = ["1", "2", "3"];
  let totalInserted = 0;
  const allErrors: string[] = [];

  for (const bId of brands) {
    let brandItems: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const filters = [
        {"type":"string","column":"brand_id","operator":"equals","value": bId},
        {"type":"string","column":"status","operator":"equals","value":["open"]}
      ];
      const resUrl = `${hqUrls.reservations}?filters=${JSON.stringify(filters)}&limit=100&page=${page}`;

      try {
        const hqData = await fetchHQ(resUrl);
        const items = hqData.data || [];
        if (items.length === 0) { hasMore = false; break; }
        brandItems = brandItems.concat(items);
        if (items.length < 100) hasMore = false;
        else page++;
      } catch (err: any) {
        allErrors.push(`Brand ${bId} Page ${page}: ${err.message}`);
        hasMore = false;
      }
    }

    if (brandItems.length >= 0) {
      const resResults = await syncReservations(brandItems);
      totalInserted += resResults.inserted;
      if (resResults.errors.length > 0) allErrors.push(...resResults.errors);
    }
  }

  return {
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
    logs
  };
};

serve(async (req) => {
  try {
    // Solo permitir POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar autorización (opcional - puedes agregar tu propia lógica)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ejecutar sincronización
    const result = await syncAll();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error en sync-all:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      logs 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
