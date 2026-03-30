require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body } = require('express-validator');

// Importación de módulos internos (Asegúrate que estos archivos existan en sus carpetas)
const supabase = require('./config/supabase');
const authController = require('./controllers/authController');
const hqRoutes = require('./routes/hqRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- 1. Rutas Base y Salud ---
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Horsepower Car Rental API - Sistema Operativo' 
    });
});

// --- 2. Rutas de Autenticación ---
// Registro de nuevos clientes/usuarios
app.post('/api/register', [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña requiere 6 caracteres')
], authController.register);

// Login con validación JWT y Bcrypt (movido al controlador)
app.post('/api/login', authController.login);

// --- 3. Rutas de HQ Rentals (Módulo Externo) ---
// Agrupa: /api/hq/locations, /api/hq/seasons, /api/hq/charges, etc.
app.use('/api/hq', hqRoutes);

// --- 4. Gestión de Flota (Lógica Original de Horsepower) ---
app.get('/api/fleet-stats', async (req, res) => {
    try {
        const { location_id } = req.query;
        
        // Iniciamos consulta a tu tabla de vehículos en Supabase
        let query = supabase
            .from('vehicles')
            .select('*, vehicle_categories(name)')
            .eq('status', 'AVAILABLE');

        // Filtro dinámico por locación
        if (location_id && location_id !== 'undefined') {
            query = query.eq('location_id', parseInt(location_id));
        }

        const { data, error } = await query;
        if (error) throw error;

        // Mantenemos tu lógica exacta de clasificación para el Dashboard
        const stats = {
            total: data.length,
            // Agrupamos autos compactos/medianos/grandes bajo "Sedanes"
            sedan: data.filter(v => {
                const name = v.vehicle_categories?.name?.toLowerCase() || '';
                return name.includes('midsize') || name.includes('fullsize') || 
                       name.includes('icar') || name.includes('fcar');
            }).length,
            // Filtro para SUVs (Intermediate, Standard, etc.)
            suv: data.filter(v => {
                const name = v.vehicle_categories?.name?.toLowerCase() || '';
                return name.includes('suv');
            }).length,
            // Filtro para Vans y transporte de pasajeros
            van: data.filter(v => {
                const name = v.vehicle_categories?.name?.toLowerCase() || '';
                return name.includes('shuttle') || name.includes('minivan') || 
                       name.includes('7 passenger');
            }).length
        };

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

// --- Inicialización ---
app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`  HORSEPOWER CAR RENTAL - SERVIDOR ACTIVO  `);
    console.log(`  URL Local: http://localhost:${PORT}      `);
    console.log(`===========================================`);
});