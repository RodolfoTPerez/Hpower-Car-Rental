const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/syncController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Solo ADMIN y AGENT pueden acceder a estas rutas
router.use(authenticate);
router.use(authorize('ADMIN', 'AGENT'));

// Sync Endpoints
router.get('/status', ctrl.getSyncStatus);
router.get('/all', ctrl.syncAll);
router.get('/locations', ctrl.syncLocations);
router.get('/categories', ctrl.syncCategories);
router.get('/vehicles', ctrl.syncVehicles);
router.get('/seasons', ctrl.syncSeasons);
router.get('/rates', ctrl.syncRates);
router.get('/charges', ctrl.syncCharges);
router.get('/reservations', ctrl.syncReservations);
router.delete('/clear', ctrl.clearDatabase);

module.exports = router;
