const express = require('express');
const router = express.Router();
const publicBookingController = require('../controllers/publicBookingController');
const supabase = require('../config/supabase');

// Ruta pública para crear reservaciones (No requiere autenticación)
router.post('/reservations', publicBookingController.createPublicReservation);

// Ruta pública para buscar cliente por email
router.get('/customers/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      res.json({ 
        success: true, 
        customer: data,
        message: 'Cliente encontrado'
      });
    } else {
      res.json({ 
        success: false, 
        customer: null,
        message: 'Cliente no encontrado'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ruta pública para obtener cargos desde Supabase (no directo de HQ)
router.get('/charges', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charges')
      .select('*')
      .eq('source', 'hq');

    if (error) throw error;

    res.json({ success: true, data: { charges: data || [] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;