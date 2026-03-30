const express = require('express');
const router = express.Router();
const hqService = require('../services/hqService');

// Ruta para Locaciones
router.get('/locations', async (req, res) => {
  try {
    const data = await hqService.fetchHQ(hqService.hqUrls.locations);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta para Temporadas (Seasons)
router.get('/seasons', async (req, res) => {
  try {
    const data = await hqService.fetchHQ(hqService.hqUrls.seasons);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta para Cargos/Seguros (Charges)
router.get('/charges', async (req, res) => {
  try {
    const data = await hqService.fetchHQ(hqService.hqUrls.charges);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;