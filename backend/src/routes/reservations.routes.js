const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/reservations.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Todos autenticados
router.get('/',     authenticate, ctrl.getAll)
router.get('/:id',  authenticate, ctrl.getOne)
router.post('/',    authenticate, ctrl.create)
router.put('/:id',  authenticate, ctrl.update)
router.delete('/:id', authenticate, ctrl.remove)

// Solo ADMIN o AGENT cambian el estado
router.patch('/:id/status', authenticate, authorize('ADMIN', 'AGENT'), ctrl.changeStatus)

module.exports = router