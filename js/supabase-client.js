/**
 * Hpower Car Rental — Supabase Client Module
 * Connects directly to Supabase for real-time fleet data.
 * Uses the publishable (anon) key for read-only access.
 * Includes localStorage cache with TTL for fallback when Supabase is unavailable.
 */

const SUPABASE_URL = 'https://xtvopaehirznzeyuanwc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LCKuoYEaj6uJ4SOTUkHKwA_CYXZYOjf';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_PREFIX = 'hpower_cache_';

/**
 * Cache helper functions
 */
function cacheGet(key) {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data;
    } catch (err) {
        console.warn('Cache get error:', err);
        return null;
    }
}

function cacheSet(key, data) {
    try {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (err) {
        console.warn('Cache set error:', err);
    }
}

function cacheClear(key) {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch (err) {
        console.warn('Cache clear error:', err);
    }
}

/**
 * Clear all Hpower cache from localStorage
 */
function cacheClearAll() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        console.log('All Hpower cache cleared');
    } catch (err) {
        console.warn('Cache clear all error:', err);
    }
}

// Location ID ↔ Brand ID mapping
const LOCATION_MAP = {
    1: { name: 'Miami', state: 'FL', brand_id: 1 },
    5: { name: 'Charlotte', state: 'NC', brand_id: 2 },
    6: { name: 'Nashville', state: 'TN', brand_id: 3 }
};

const LOCATION_IDS = [1, 5, 6];

/**
 * Core REST helper – calls Supabase PostgREST directly (no SDK needed)
 * Includes retry mechanism with exponential backoff and cache fallback
 */
async function supabaseQuery(table, params = '', retries = 3) {
    const cacheKey = `${table}_${params}`;
    
    // Try cache first
    const cached = cacheGet(cacheKey);
    if (cached) {
        console.log(`Using cached data for [${table}]`);
        return cached;
    }

    const url = `${SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            });
            
            if (!response.ok) {
                console.warn(`Supabase query failed [${table}] attempt ${attempt + 1}:`, response.status, response.statusText);
                if (attempt < retries - 1) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                // All retries failed, try to return cached data
                const fallbackData = cacheGet(cacheKey);
                if (fallbackData) {
                    console.warn(`Using stale cached data for [${table}] after all retries failed`);
                    return fallbackData;
                }
                return [];
            }
            
            const data = await response.json();
            // Cache successful responses
            cacheSet(cacheKey, data);
            return data;
            
        } catch (err) {
            console.warn(`Supabase connection error [${table}] attempt ${attempt + 1}:`, err.message);
            if (attempt < retries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // All retries failed, try to return cached data
            const fallbackData = cacheGet(cacheKey);
            if (fallbackData) {
                console.warn(`Using stale cached data for [${table}] after connection errors`);
                return fallbackData;
            }
            return [];
        }
    }
    
    return [];
}

/**
 * Get count of available vehicles per location
 * Returns: { 1: { total, name }, 5: { total, name }, 6: { total, name } }
 */
async function getAvailableCountByLocation() {
    const result = {};
    for (const locId of LOCATION_IDS) {
        const data = await supabaseQuery('vehicles', `select=id&status=eq.AVAILABLE&location_id=eq.${locId}`);
        result[locId] = {
            total: Array.isArray(data) ? data.length : 0,
            ...LOCATION_MAP[locId]
        };
    }
    return result;
}

/**
 * Get vehicles grouped by category for a given location (or all)
 * Returns: [{ category_name, category_id, models: [{ brand, model, count, image, price }] }]
 */
async function getVehiclesByLocation(locationId) {
    let params = 'select=id,brand,model,category_id,location_id,main_image,seats,transmission,fuel_type,base_price_per_day,status,vehicle_categories(id,name,icon)&status=eq.AVAILABLE&order=brand.asc';
    if (locationId && locationId !== 'all') {
        params += `&location_id=eq.${locationId}`;
    }
    const vehicles = await supabaseQuery('vehicles', params);
    if (!Array.isArray(vehicles) || vehicles.length === 0) return [];

    // Get current rates
    const today = new Date().toISOString().split('T')[0];
    const rates = await supabaseQuery('vehicle_rates',
        `select=vehicle_class_id,daily_rate,location_id&start_date=lte.${today}&end_date=gte.${today}`
    );
    const rateMap = {};
    for (const r of (rates || [])) {
        const key = `${r.vehicle_class_id}__${r.location_id}`;
        const keyGen = `${r.vehicle_class_id}__general`;
        if (!rateMap[key]) rateMap[key] = parseFloat(r.daily_rate);
        if (!rateMap[keyGen]) rateMap[keyGen] = parseFloat(r.daily_rate);
    }

    // Group by category (and location if 'all' is selected) → unique models
    const categoryMap = {};
    for (const v of vehicles) {
        const catName = v.vehicle_categories?.name || 'Otros';
        const catId = v.category_id;
        const locId = v.location_id;
        const locName = LOCATION_MAP[locId]?.name || '';
        
        const groupKey = (!locationId || locationId === 'all') ? `${catId}_${locId}` : catId;

        if (!categoryMap[groupKey]) {
            categoryMap[groupKey] = {
                category_name: catName,
                category_id: catId,
                location_id: locId,
                location_name: locName,
                icon: v.vehicle_categories?.icon || null,
                models: {},
                totalAvailable: 0
            };
        }
        categoryMap[groupKey].totalAvailable++;

        const modelKey = `${v.brand}__${v.model}`;
        if (!categoryMap[groupKey].models[modelKey]) {
            const rateKey = `${catId}__${v.location_id}`;
            const rateKeyGen = `${catId}__general`;
            const price = rateMap[rateKey] || rateMap[rateKeyGen] || v.base_price_per_day || 0;

            categoryMap[groupKey].models[modelKey] = {
                brand: v.brand,
                model: v.model,
                image: v.main_image || null,
                seats: v.seats || 5,
                transmission: v.transmission || 'AUTO',
                fuel_type: v.fuel_type || 'GAS',
                daily_rate: price,
                count: 0
            };
        }
        categoryMap[groupKey].models[modelKey].count++;
    }

    // Flatten models and sort
    return Object.values(categoryMap).map(cat => ({
        ...cat,
        models: Object.values(cat.models).sort((a, b) => b.count - a.count)
    })).sort((a, b) => {
        if (!locationId || locationId === 'all') {
            if (a.location_id !== b.location_id) return (a.location_id || 0) - (b.location_id || 0);
        }
        return b.totalAvailable - a.totalAvailable;
    });
}

/**
 * Get locations from Supabase
 */
async function getLocations() {
    return await supabaseQuery('locations', 'select=*&active=eq.true&order=name.asc');
}

/**
 * Get vehicle categories
 */
async function getCategories(locationId) {
    if (locationId && locationId !== 'all') {
        // First get category IDs that have vehicles in this location
        const vehicles = await supabaseQuery('vehicles',
            `select=category_id&status=eq.AVAILABLE&location_id=eq.${locationId}`
        );
        const catIds = [...new Set(vehicles.map(v => v.category_id).filter(Boolean))];
        if (catIds.length === 0) return [];
        return await supabaseQuery('vehicle_categories',
            `select=*&is_active=eq.true&id=in.(${catIds.join(',')})&order=name.asc`
        );
    }
    return await supabaseQuery('vehicle_categories', 'select=*&is_active=eq.true&order=name.asc');
}

/**
 * Get fleet stats (total, sedan, suv, van) for a location
 */
async function getFleetStats(locationId) {
    let params = 'select=id,vehicle_categories(name)&status=eq.AVAILABLE';
    if (locationId && locationId !== 'all') {
        params += `&location_id=eq.${locationId}`;
    }
    const data = await supabaseQuery('vehicles', params);
    const stats = { total: 0, sedan: 0, suv: 0, van: 0 };
    if (!Array.isArray(data)) return stats;

    stats.total = data.length;
    for (const v of data) {
        const name = v.vehicle_categories?.name?.toLowerCase() || '';
        if (name.includes('midsize') || name.includes('fullsize') || name.includes('icar') || name.includes('fcar')) {
            stats.sedan++;
        } else if (name.includes('suv')) {
            stats.suv++;
        } else if (name.includes('shuttle') || name.includes('minivan') || name.includes('7 passenger')) {
            stats.van++;
        }
    }
    return stats;
}

/**
 * Expose to global scope
 */
window.HpowerSupabase = {
    SUPABASE_URL,
    LOCATION_MAP,
    LOCATION_IDS,
    getAvailableCountByLocation,
    getVehiclesByLocation,
    getLocations,
    getCategories,
    getFleetStats,
    supabaseQuery,
    cacheGet,
    cacheSet,
    cacheClear,
    cacheClearAll
};
