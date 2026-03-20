import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import VehicleCard from '../components/VehicleCard'

const Fleet = () => {
  const { t } = useTranslation()

  const [vehicles, setVehicles]                 = useState([])
  const [locations, setLocations]               = useState([])
  const [categories, setCategories]             = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading]                   = useState(false)   // ← false, no true
  const initialized                             = useRef(false)     // ← bandera para evitar disparo inicial

  /* ── Paso 1: Solo carga ubicaciones al montar ── */
  useEffect(() => {
    fetchLocations().then(() => {
      initialized.current = true  // ← marca que ya montó
    })
  }, [])

  /* ── Paso 2: Reacciona a cambio de ubicación ── */
  useEffect(() => {
    if (!initialized.current) return  // ← evita disparo al montar

    setSelectedCategory('')
    setCategories([])
    setVehicles([])

    if (selectedLocation) {
      fetchCategories(selectedLocation)
      fetchVehicles(selectedLocation, '')
    }
  }, [selectedLocation])

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations')
      setLocations(res.data.data || [])
    } catch (err) {
      console.error('Error cargando ubicaciones:', err)
    }
  }

  const fetchCategories = async (locationId) => {
    try {
      const res = await api.get(`/categories?location_id=${locationId}`)
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Error cargando categorías:', err)
    }
  }

  const fetchVehicles = async (locationId, categoryId = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (locationId) params.append('location_id', locationId)
      if (categoryId) params.append('category_id', categoryId)
      const res = await api.get(`/vehicles?${params.toString()}`)
      setVehicles(res.data.data || [])
    } catch (err) {
      console.error('Error cargando vehículos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLocation = (locationId) => {
    setSelectedLocation(locationId)
  }

  const handleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchVehicles(selectedLocation, categoryId)
  }

  const btnStyle = (active) => ({
    padding: '8px 20px',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'var(--btn-primary-bg)' : 'var(--glass-bg)',
    color: active ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  })

  const labelStyle = {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '10px',
    display: 'block',
  }

  const filterBoxStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '16px',
    backdropFilter: 'blur(16px)',
  }

  return (
    <div style={{ minHeight: '100vh', padding: '90px 2rem 4rem' }}>

      {/* ── Título ── */}
      <h1 style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '48px',
        color: 'var(--accent)',
        marginBottom: '32px',
        letterSpacing: '3px'
      }}>
        {t('vehicles.title')}
      </h1>

      {/* ── FILTRO 1: Ubicación ── */}
      <div style={filterBoxStyle}>
        <span style={labelStyle}>📍 {t('vehicles.filter_by_location')}</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => handleLocation(String(loc.id))}
              style={btnStyle(selectedLocation === String(loc.id))}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTRO 2: Categoría (solo si hay ubicación) ── */}
      {selectedLocation && categories.length > 0 && (
        <div style={{ ...filterBoxStyle, marginBottom: '32px' }}>
          <span style={labelStyle}>🚗 {t('vehicles.filter_by_category')}</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCategory('')}
              style={btnStyle(selectedCategory === '')}
            >
              {t('vehicles.all_categories')}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                style={btnStyle(selectedCategory === cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENIDO ── */}
      {!selectedLocation ? (

        /* Sin ubicación seleccionada */
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          color: 'var(--text-secondary)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📍</div>
          <p style={{ fontSize: '16px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('vehicles.select_location')}
          </p>
        </div>

      ) : loading ? (

        /* Skeleton loading */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              height: '380px',
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>

      ) : vehicles.length > 0 ? (

        /* Grid de vehículos */
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            {vehicles.length} {t('vehicles.title').toLowerCase()}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </>

      ) : (

        /* Sin resultados */
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: 'var(--text-secondary)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          <p style={{ fontSize: '48px' }}>🚗</p>
          <p>{t('vehicles.no_vehicles')}</p>
        </div>

      )}
    </div>
  )
}

export default Fleet
