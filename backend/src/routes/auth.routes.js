const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authValidators } = require('../middlewares/validators')

// PÚBLICO
router.post('/register', authValidators.register, ctrl.register)
router.post('/login',    authValidators.login, ctrl.login)
router.post('/refresh',  ctrl.refresh)

// AUTENTICADO
router.post('/logout',   authenticate, ctrl.logout)
router.get('/me',        authenticate, ctrl.me)

module.exports = router