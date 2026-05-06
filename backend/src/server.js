require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body } = require('express-validator');

// Importación de módulos internos (Asegúrate que estos archivos existan en sus carpetas)
const supabase = require('./config/supabase');
const authController = require('./controllers/auth.controller');
const hqRoutes = require('./routes/hqRoutes');
const categoriesRoutes = require('./routes/categories.routes');
const vehiclesRoutes = require('./routes/vehicles.routes');
const pricingRoutes = require('./routes/pricing.routes');
const authRoutes = require('./routes/auth.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const publicBookingRoutes = require('./routes/publicBooking.routes');
const adminRoutes = require('./routes/admin.routes');
const syncRoutes = require('./routes/sync.routes');
const analyticsController = require('./controllers/analytics.controller');
const emailRoutes = require('./routes/email.routes');
const emailController = require('./controllers/emailController');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de payload

// Middleware de control de memoria
app.use((req, res, next) => {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    // Alerta si uso de memoria excede 500MB
    if (memUsedMB > 500) {
        console.warn(`⚠️  Alta memoria: ${memUsedMB}MB - Endpoint: ${req.path}`);
    }
    
    next();
});

// --- 1. Rutas Base y Salud ---
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Horsepower Car Rental API - Sistema Operativo' 
    });
});

// Health check endpoint para monitoreo
app.get('/health', async (req, res) => {
    try {
        const memUsage = process.memoryUsage();
        const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const uptime = process.uptime();
        
        // Verificar conexión a Supabase
        let supabaseStatus = 'unknown';
        try {
            const { data, error } = await supabase.from('locations').select('id').limit(1);
            supabaseStatus = error ? 'error' : 'connected';
        } catch (err) {
            supabaseStatus = 'error';
        }
        
        const health = {
            status: 'healthy',
            uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
            memory: `${memUsedMB}MB`,
            supabase: supabaseStatus,
            timestamp: new Date().toISOString()
        };
        
        // Si hay problemas con memoria o Supabase, marcar como degraded
        if (memUsedMB > 500 || supabaseStatus === 'error') {
            health.status = 'degraded';
            return res.status(503).json(health);
        }
        
        res.json(health);
    } catch (err) {
        res.status(500).json({ 
            status: 'unhealthy', 
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// --- 2. Rutas de Autenticación (Alineadas con el Frontend) ---
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// --- 3. Rutas de HQ Rentals (Módulo Externo) ---
// Agrupa: /api/hq/locations, /api/hq/seasons, /api/hq/charges, etc.
// app.use('/api/hq', hqRoutes);
app.use('/api/v1', hqRoutes); // Mantener compatibilidad con v1 (locations, seasons, charges)

// --- Rutas CRUD desde Supabase (las que usa el Frontend) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/vehicles', vehiclesRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/reservations', reservationsRoutes);
app.use('/api/public', publicBookingRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- SSE Endpoint para streaming de logs ---
// Definido ANTES de syncRoutes para evitar que el middleware de auth bloquee el query param token
app.get('/api/sync/stream', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado al stream de logs' })}\n\n`);

  req.app.locals.sseClient = res;

  const heartbeat = setInterval(() => {
    if (req.app.locals.sseClient) {
      req.app.locals.sseClient.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    req.app.locals.sseClient = null;
  });
});

app.use('/api/sync', syncRoutes);
app.use('/api/email', emailRoutes);
console.log('✅ Sync routes registradas');
console.log('✅ Email routes registradas');

// --- Contact Form Endpoint ---
app.post('/api/contact', emailController.sendContactEmail);
console.log('✅ Contact endpoint registrado');

// --- Analytics Routes ---
app.post('/api/v1/analytics/track', analyticsController.trackVisit);
app.put('/api/v1/analytics/session', analyticsController.updateSessionDuration);
app.get('/api/v1/analytics', analyticsController.getAnalytics);
app.get('/api/v1/analytics/summary', analyticsController.getAnalyticsSummary);
console.log('✅ Analytics routes registradas');



// --- 4. Configuración pública (para frontend) ---
app.get('/api/config', (req, res) => {
    res.json({
        hqBookingUrl: process.env.HQ_BOOKING_URL || 'https://horsepower-car-rental-staging.us4.hqrentals.app/public/car-rental/reservations/step1'
    });
});

// --- 5. Gestión de Flota (Optimizada para bajo consumo de RAM) ---
app.get('/api/fleet-stats', async (req, res) => {
    try {
        const { location_id } = req.query;
        
        // Optimización: Mover lógica de clasificación a la base de datos
        let query = supabase
            .from('vehicles')
            .select(`
                id,
                vehicle_categories!inner(
                    name
                )
            `)
            .eq('status', 'AVAILABLE');

        // Filtro dinámico por locación
        if (location_id && location_id !== 'undefined') {
            query = query.eq('location_id', parseInt(location_id));
        }

        const { data, error } = await query;
        if (error) throw error;

        // Procesamiento optimizado en memoria con liberación temprana
        const stats = {
            total: data.length,
            sedan: 0,
            suv: 0,
            van: 0
        };

        // Procesamiento más eficiente con un solo bucle
        for (const vehicle of data) {
            const name = vehicle.vehicle_categories?.name?.toLowerCase() || '';
            
            if (name.includes('midsize') || name.includes('fullsize') || 
                name.includes('icar') || name.includes('fcar')) {
                stats.sedan++;
            } else if (name.includes('suv')) {
                stats.suv++;
            } else if (name.includes('shuttle') || name.includes('minivan') || 
                       name.includes('7 passenger')) {
                stats.van++;
            }
        }

        // Liberar memoria explícitamente
        data.length = 0;

        res.json({ success: true, stats });
    } catch (err) {
        console.error('Error en fleet-stats:', err.message);
        res.status(500).json({ error: 'Error interno al procesar estadísticas de flota' });
    }
});

// --- 5. Manejo de Errores Final ---
app.use((req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado en el servidor de Horsepower' });
});

// --- Inicialización con manejo de memoria y cleanup ---
const server = app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`  HORSEPOWER CAR RENTAL - SERVIDOR ACTIVO  `);
    console.log(`  URL Local: http://localhost:${PORT}      `);
    console.log(`===========================================`);
    
    // Monitoreo inicial de memoria
    const memUsage = process.memoryUsage();
    console.log(`📊 Memoria inicial: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown para liberar recursos
process.on('SIGTERM', () => {
    console.log('🔄 Recibido SIGTERM, limpiando recursos...');
    supabase.cleanup();
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 Recibido SIGINT, limpiando recursos...');
    supabase.cleanup();
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});