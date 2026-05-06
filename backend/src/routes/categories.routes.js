const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/categories.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Públicos
router.get('/',    ctrl.getAll)
router.get('/:id', ctrl.getOne)

// Privados
router.post('/',    authenticate, authorize('ADMIN'), ctrl.create)
router.put('/:id',  authenticate, authorize('ADMIN'), ctrl.update)
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove)

module.exports = router