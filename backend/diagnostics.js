require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function runDiagnostics() {
  try {
    console.log('--- STARTING DIAGNOSTICS ---\n');

    // 1. Fetch DB Stats
    const { count: totalDB } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
    const { data: statusStats } = await supabase.from('vehicles').select('status');
    const statusCounts = statusStats.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    console.log(`[DB] Total Vehicles: ${totalDB}`);
    console.log(`[DB] Status Distribution:`, statusCounts);

    // 2. Fetch HQ Stats
    console.log('\n[HQ] Fetching vehicles from HQ...');
    const hqRes = await fetch(process.env.HQ_API_URL, { headers: { 'Authorization': process.env.HQ_API_TOKEN, 'Content-Type': 'application/json' } }).then(res => res.json());
    const hqVehicles = hqRes.data || [];
    console.log(`[HQ] Total Vehicles: ${hqVehicles.length}`);

    // 3. Category Mapping Check
    console.log('\n[MAPPING] Checking for gaps...');
    const classIdsInHQData = [...new Set(hqVehicles.map(v => v.vehicle_class_id))];
    const { data: cats } = await supabase.from('vehicle_categories').select('name, hq_class_ids');
    
    const mappedClassIds = cats.flatMap(c => c.hq_class_ids || []);
    const unmapped = classIdsInHQData.filter(id => !mappedClassIds.includes(id));
    
    if (unmapped.length > 0) {
      console.log(`[MAPPING] Found UNMAPPED HQ Class IDs in vehicle data: ${unmapped.join(', ')}`);
      
      const classRes = await fetch(process.env.HQ_API_CLASSES_URL, { headers: { 'Authorization': process.env.HQ_API_TOKEN, 'Content-Type': 'application/json' } }).then(res => res.json());
      const allHQClasses = classRes.data || classRes.fleets_vehicle_classes || [];
      
      console.log('\nDetails of unmapped classes:');
      unmapped.forEach(id => {
        const cls = allHQClasses.find(c => c.id === id);
        if (cls) console.log(` - ID ${id}: ${cls.name}`);
        else console.log(` - ID ${id}: Unknown name`);
      });
    } else {
      console.log('[MAPPING] All HQ classes in current vehicle data are mapped successfully.');
    }

    // 4. Sample check for specific models that might be filtered
    console.log('\n[INSPECTION] Checking why some available HQ cars might be missing...');
    const availableInHQ = hqVehicles.filter(v => v.status === 'AVAILABLE');
    console.log(`[HQ] Total AVAILABLE in HQ: ${availableInHQ.length}`);

    // Compare available in HQ vs available in DB
    const { count: availableInDB } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'AVAILABLE');
    console.log(`[DB] Total AVAILABLE in DB: ${availableInDB}`);

    console.log('\n--- DIAGNOSTICS COMPLETE ---');

  } catch (err) {
    console.error('DIAGNOSTICS ERROR:', err);
  }
}

runDiagnostics();
