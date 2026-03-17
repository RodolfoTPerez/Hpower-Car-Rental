const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/v1/auth',         require('./routes/auth.routes'))
app.use('/api/v1/vehicles',     require('./routes/vehicles.routes'))
app.use('/api/v1/reservations', require('./routes/reservations.routes'))
app.use('/api/v1/pricing',      require('./routes/pricing.routes'))
app.use('/api/v1/categories',   require('./routes/categories.routes'))

// Ruta de salud — para verificar que el servidor está vivo
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Car Rental API funcionando',
    version: '1.0.0',
    date: new Date().toISOString()
  })
})

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})

module.exports = app