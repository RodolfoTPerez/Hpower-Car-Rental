const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env' })

// Configuración optimizada para reducir consumo de RAM
const supabaseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Connection': 'keep-alive'
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  supabaseOptions
)

// Función para liberar recursos
supabase.cleanup = () => {
  if (supabase.realtime) {
    supabase.realtime.disconnect()
  }
}

module.exports = supabase