const express = require('express');
const router = express.Router();
const hqService = require('../services/hqService');
const supabase = require('../config/supabase');

// Ruta para Locaciones
router.get('/locations', async (req, res) => {
  try {
    const data = await hqService.fetchHQ(hqService.hqUrls.locations);
    res.json({ success: true, data: data.fleets_locations || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta para Temporadas (Seasons)
router.get('/seasons', async (req, res) => {
  try {
    const data = await hqService.fetchHQ(hqService.hqUrls.seasons);
    res.json({ success: true, data: data || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta para Cargos/Seguros (Charges) — lee de Supabase, no de HQ
router.get('/charges', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charges')
      .select('*')
      .eq('source', 'hq');

    if (error) throw error;

    res.json({ success: true, data: { charges: data || [] } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;