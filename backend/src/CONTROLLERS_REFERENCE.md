# Referencia de Controladores - Backend

## Nombres de Archivos Correctos para Importación

### Controllers (backend/src/controllers/)
- `auth.controller.js` → `require('./controllers/auth.controller')`
- `admin.controller.js` → `require('./controllers/admin.controller')`
- `analytics.controller.js` → `require('./controllers/analytics.controller')`
- `categories.controller.js` → `require('./controllers/categories.controller')`
- `emailController.js` → `require('./controllers/emailController')` ⚠️ **SIN punto**
- `pricing.controller.js` → `require('./controllers/pricing.controller')`
- `publicBookingController.js` → `require('./controllers/publicBookingController')` ⚠️ **SIN punto**
- `rates.controller.js` → `require('./controllers/rates.controller')`
- `reservations.controller.js` → `require('./controllers/reservations.controller')`
- `syncController.js` → `require('./controllers/syncController')` ⚠️ **SIN punto**
- `vehicles.controller.js` → `require('./controllers/vehicles.controller')`

### Routes (backend/src/routes/)
- `admin.routes.js` → `require('./routes/admin.routes')`
- `auth.routes.js` → `require('./routes/auth.routes')`
- `categories.routes.js` → `require('./routes/categories.routes')`
- `email.routes.js` → `require('./routes/email.routes')`
- `hqRoutes.js` → `require('./routes/hqRoutes')` ⚠️ **camelCase**
- `pricing.routes.js` → `require('./routes/pricing.routes')`
- `publicBooking.routes.js` → `require('./routes/publicBooking.routes')`
- `reservations.routes.js` → `require('./routes/reservations.routes')`
- `sync.routes.js` → `require('./routes/sync.routes')`
- `vehicles.routes.js` → `require('./routes/vehicles.routes')`

### Config (backend/src/config/)
- `supabase.js` → `require('./config/supabase')`

## Regla General

La mayoría de los archivos usan **kebab-case** con punto (`.controller.js`, `.routes.js`).

**EXCEPCIONES** (sin punto, camelCase):
- `emailController.js`
- `publicBookingController.js`
- `syncController.js`
- `hqRoutes.js`

## Importación en server.js

```javascript
// ✅ CORRECTO
const authController = require('./controllers/auth.controller');
const emailController = require('./controllers/emailController'); // SIN punto
const syncController = require('./controllers/syncController'); // SIN punto

// ❌ INCORRECTO
const authController = require('./controllers/authController'); // Error
const emailController = require('./controllers/email.controller'); // Error
```

---
**Última actualización**: 24/04/2026
**Motivo**: Corrección de errores de importación en server.js
