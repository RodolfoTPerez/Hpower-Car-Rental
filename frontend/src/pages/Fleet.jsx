import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import VehicleCard from '../components/VehicleCard'

const Fleet = () => {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchVehicles()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVehicles = async (categoryId = '') => {
    setLoading(true)
    try {
      const params = categoryId ? `?category=${categoryId}` : ''
      const res = await api.get(`/vehicles${params}`)
      setVehicles(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchVehicles(categoryId)
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', padding: '80px 2rem 2rem' }}>
      <h1 style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '48px',
        color: 'var(--accent)',
        marginBottom: '8px',
        letterSpacing: '3px'
      }}>
        {t('vehicles.title')}
      </h1>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => handleCategory('')}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            background: selectedCategory === '' ? 'var(--btn-primary-bg)' : 'var(--glass-bg)',
            color: selectedCategory === '' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            backdropFilter: 'blur(8px)'
          }}
        >
          {t('categories.all')}
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategory(cat.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: selectedCategory === cat.id ? 'var(--btn-primary-bg)' : 'var(--glass-bg)',
              color: selectedCategory === cat.id ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              backdropFilter: 'blur(8px)'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
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
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {!loading && vehicles.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontSize: '48px' }}>🚗</p>
          <p>No hay vehículos disponibles</p>
        </div>
      )}
    </div>
  )
}

export default Fleet