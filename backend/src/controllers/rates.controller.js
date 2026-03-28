// controllers/rates.controller.js
const supabase = require('../config/supabase'); // Tu configuración de Supabase

const syncRates = async (req, res) => {
    try {
        // 1. LLAMADA AL ENDPOINT DE HQ
        const response = await fetch('https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/rates', {
            headers: { 'Authorization': `Bearer ${process.env.HQ_TOKEN}` }
        });
        const hqData = await response.json(); 
        const hqRates = hqData.data || []; // Asumiendo que vienen en la propiedad data

        // 2. OBTENER CATEGORÍAS (EL DICCIONARIO)
        const { data: categories } = await supabase
            .from('vehicle_categories')
            .select('id, hq_class_id');

        const categoryMap = {};
        categories.forEach(c => { if(c.hq_class_id) categoryMap[c.hq_class_id] = c.id });

        // 3. TRANSFORMACIÓN SENIOR (MAPEANDO A TUS CAMPOS)
        const ratesToInsert = hqRates
            .filter(rate => {
                // Filtro de activas: Solo si la temporada es vigente hoy
                if (!rate.season) return false;
                const hoy = new Date();
                return hoy >= new Date(rate.season.date_start) && hoy <= new Date(rate.season.date_end);
            })
            .map(rate => {
                const uuid = categoryMap[rate.vehicle_class_id];
                if (!uuid) return null;

                return {
                    vehicle_class_id: uuid, // TU CAMPO UUID
                    daily_rate: parseFloat(rate.daily_rate) || 0,
                    weekly_rate: parseFloat(rate.weekly_rate) || 0,
                    monthly_rate: parseFloat(rate.monthly_rate) || 0,
                    season_id: rate.season_id,
                    // created_at lo pone Supabase solo
                };
            })
            .filter(r => r !== null);

        // 4. INSERCIÓN EN SUPABASE
        const { error } = await supabase.from('vehicle_rates').insert(ratesToInsert);

        if (error) throw error;

        res.json({ success: true, inserted: ratesToInsert.length });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { syncRates };