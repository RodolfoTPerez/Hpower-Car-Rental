// routes/rates.routes.js
const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/rates.controller');

// Esta es la URL que llamarás para actualizar tus precios
router.get('/sync', ratesController.syncRates);

module.exports = router;