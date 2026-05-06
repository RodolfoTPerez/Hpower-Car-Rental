const supabase = require('../config/supabase')
const hqService = require('../services/hqService')

// Limpiar tablas de sincronización (endpoint temporal)
const clearSyncTables = async (req, res) => {
  try {
    const tables = ['notifications', 'charges', 'vehicle_rates', 'vehicles', 'seasons', 'vehicle_categories', 'locations']
    const results = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).delete()
      if (error) {
        results[table] = { success: false, error: error.message }
      } else {
        results[table] = { success: true }
      }
    }

    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Obtener conteo de registros de sincronización
const getSyncCounts = async (req, res) => {
  try {
    const results = {}

    const tables = [
      { name: 'locations', label: 'Locations' },
      { name: 'vehicle_categories', label: 'Vehicle Categories' },
      { name: 'vehicles', label: 'Vehicles' },
      { name: 'seasons', label: 'Seasons' },
      { name: 'vehicle_rates', label: 'Rates' },
      { name: 'charges', label: 'Charges' }
    ]

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      results[table.name] = {
        label: table.label,
        count: count || 0,
        error: error ? error.message : null
      }
    }

    res.json({ success: true, data: results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// STATS - Estadísticas del dashboard
const getStats = async (req, res) => {
  try {
    // Revenue hoy
    const { data: revenueData, error: revenueError } = await supabase
      .from('reservations')
      .select('total_amount')
      .gte('created_at', new Date().toISOString().split('T')[0])
    
    const revenueToday = revenueData?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

    // Reservas activas
    const { count: activeReservations } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Fleet total y disponible
    const { count: totalFleet } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })

    const { count: availableFleet } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'AVAILABLE')

    // Reservas pendientes
    const { count: pendingReservations } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Tasa de ocupación
    const occupancyRate = totalFleet > 0 ? ((totalFleet - availableFleet) / totalFleet * 100).toFixed(0) : 0

    // Vehículos por ubicación
    let locations = [];
    try {
      const hqData = await hqService.fetchHQ(hqService.hqUrls.locations);
      locations = hqData.fleets_locations || [];
    } catch (err) {
      console.error('Error fetching locations from HQ:', err.message);
    }

    const vehiclesByLocation = []
    for (const loc of (locations || [])) {
      const { count: totalAtLocation } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', loc.id)

      const { count: availableAtLocation } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', loc.id)
        .eq('status', 'AVAILABLE')

      vehiclesByLocation.push({
        locationId: loc.id,
        locationName: loc.name,
        locationCode: `Loc.: ${loc.id}`,
        totalVehicles: totalAtLocation || 0,
        availableVehicles: availableAtLocation || 0
      })
    }

    res.json({
      data: {
        revenueToday,
        activeReservations,
        totalFleet,
        availableFleet,
        pendingReservations,
        occupancyRate,
        vehiclesByLocation
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// LOCATIONS - CRUD
const getLocations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getLocation = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createLocation = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateLocation = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteLocation = async (req, res) => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Location deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const toggleLocation = async (req, res) => {
  try {
    const { data: current } = await supabase
      .from('locations')
      .select('enabled')
      .eq('id', req.params.id)
      .single()

    const { data, error } = await supabase
      .from('locations')
      .update({ enabled: !current.enabled })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// CUSTOMERS - CRUD
const getCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['CUSTOMER', 'AGENT', 'ADMIN'])
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCustomer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createCustomer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateCustomer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteCustomer = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// COMMUNICATIONS
const getCommunications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const sendCommunication = async (req, res) => {
  try {
    const { recipient_email, recipient_name, subject, template_name } = req.body

    const { data, error } = await supabase
      .from('communications')
      .insert([{
        recipient_email,
        recipient_name,
        subject,
        template_name,
        status: 'sent',
        created_by: req.user.id
      }])
      .select()
      .single()

    if (error) throw error
    res.json({ data, message: 'Communication sent successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching notifications:', error);
      // Si la tabla no existe, retornar array vacío
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return res.json({ data: [] });
      }
      throw error;
    }
    res.json({ data: data || [] })
  } catch (error) {
    console.error('Error in getNotifications:', error);
    // Si es error de tabla no encontrada, retornar array vacío
    if (error.code === 'PGRST205') {
      return res.json({ data: [] });
    }
    res.status(500).json({ error: error.message })
  }
}

const markNotificationRead = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const markAllNotificationsRead = async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)

    if (error) throw error
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// USERS - CRUD
const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getStats,
  clearSyncTables,
  getSyncCounts,
  getLocations, getLocation, createLocation, updateLocation, deleteLocation, toggleLocation,
  getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
  getCommunications, sendCommunication,
  getNotifications, markNotificationRead, markAllNotificationsRead,
  getUsers, getUser, createUser, updateUser, deleteUser
}
