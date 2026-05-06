const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/admin.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Solo ADMIN y AGENT pueden acceder a estas rutas
router.use(authenticate)
router.use(authorize('ADMIN', 'AGENT'))

// Limpiar tablas de sincronización (endpoint temporal)
router.delete('/clear-sync-tables', ctrl.clearSyncTables)

// Sync Counts - Conteo de registros de sincronización
router.get('/sync-counts', ctrl.getSyncCounts)

// STATS - Estadísticas del dashboard
router.get('/stats', ctrl.getStats)

// LOCATIONS - CRUD completo
router.get('/locations', ctrl.getLocations)
router.get('/locations/:id', ctrl.getLocation)
router.post('/locations', ctrl.createLocation)
router.put('/locations/:id', ctrl.updateLocation)
router.delete('/locations/:id', ctrl.deleteLocation)
router.patch('/locations/:id/toggle', ctrl.toggleLocation)

// CUSTOMERS - Obtener todos los clientes
router.get('/customers', ctrl.getCustomers)
router.get('/customers/:id', ctrl.getCustomer)
router.post('/customers', ctrl.createCustomer)
router.put('/customers/:id', ctrl.updateCustomer)
router.delete('/customers/:id', ctrl.deleteCustomer)

// COMMUNICATIONS - Historial de emails
router.get('/communications', ctrl.getCommunications)
router.post('/communications/send', ctrl.sendCommunication)

// NOTIFICATIONS - Notificaciones del sistema
router.get('/notifications', ctrl.getNotifications)
router.patch('/notifications/:id/read', ctrl.markNotificationRead)
router.patch('/notifications/read-all', ctrl.markAllNotificationsRead)

// USERS - CRUD de usuarios
router.get('/users', ctrl.getUsers)
router.get('/users/:id', ctrl.getUser)
router.post('/users', ctrl.createUser)
router.put('/users/:id', ctrl.updateUser)
router.delete('/users/:id', ctrl.deleteUser)

module.exports = router
