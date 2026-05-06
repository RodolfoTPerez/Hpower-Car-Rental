const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/pricing.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Público — calcular precio
router.get('/calculate', ctrl.calculate)

// Privados
router.get('/',              authenticate, authorize('ADMIN', 'AGENT'), ctrl.getAll)
router.get('/vehicle/:id',   authenticate, ctrl.getByVehicle)
router.post('/',             authenticate, authorize('ADMIN'), ctrl.create)
router.put('/:id',           authenticate, authorize('ADMIN'), ctrl.update)
router.delete('/:id',        authenticate, authorize('ADMIN'), ctrl.remove)
router.post('/import',       authenticate, authorize('ADMIN'), ctrl.importCSV)

module.exports = router