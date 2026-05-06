const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/vehicles.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Públicos — cualquiera puede ver los vehículos
router.get('/',          ctrl.getAll)
router.get('/available', ctrl.getAvailable)
router.get('/:id',       ctrl.getOne)

// Privados — solo ADMIN
router.post('/',           authenticate, authorize('ADMIN'), ctrl.create)
router.put('/:id',         authenticate, authorize('ADMIN'), ctrl.update)
router.delete('/:id',      authenticate, authorize('ADMIN'), ctrl.remove)
router.post('/:id/images', authenticate, authorize('ADMIN'), ctrl.uploadImages)

module.exports = router