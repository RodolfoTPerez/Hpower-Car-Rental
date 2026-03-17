const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middleware')

router.post('/register', ctrl.register)
router.post('/login',    ctrl.login)
router.post('/logout',   ctrl.logout)
router.get('/me',        authenticate, ctrl.me)

module.exports = router