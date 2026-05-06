const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Rutas de configuración de email (requieren autenticación)
router.post('/config', emailController.saveEmailConfig);
router.get('/config', emailController.getEmailConfig);
router.post('/test', emailController.testEmail);

// Ruta pública para enviar email de contacto
router.post('/send', emailController.sendContactEmail);

module.exports = router;
