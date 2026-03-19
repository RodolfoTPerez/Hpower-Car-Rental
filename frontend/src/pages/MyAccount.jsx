import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const MyAccount = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reservations')

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations')
      setReservations(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await api.delete(`/reservations/${id}`, {
        data: { cancel_reason: 'Cancelada por el cliente' }
      })
      fetchReservations()
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING:   { bg: 'rgba(239,159,39,0.15)',  border: '#EF9F27', text: '#EF9F27' },
      CONFIRMED: { bg: 'rgba(29,158,117,0.15)',  border: '#1D9E75', text: '#1D9E75' },
      ACTIVE:    { bg: 'rgba(55,138,221,0.15)',  border: '#378ADD', text: '#378ADD' },
      COMPLETED: { bg: 'rgba(29,158,117,0.15)',  border: '#1D9E75', text: '#1D9E75' },
      CANCELLED: { bg: 'rgba(226,75,74,0.15)',   border: '#E24B4A', text: '#E24B4A' }
    }
    return colors[status] || colors.PENDING
  }

  const tabStyle = (active) => ({
    padding: '10px 24px',
    background: active ? 'var(--btn-primary-bg)' : 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: active ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  })

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', padding: '80px 2rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderTop: '1px solid var(--glass-border-top)',
          borderRadius: '16px',
          backdropFilter: 'blur(24px)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--btn-primary-bg)',
            border: '1px solid var(--btn-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'var(--btn-primary-text)',
            fontWeight: '700'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: '500',
              margin: 0
            }}>
              {user?.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
              {user?.email} · {user?.role}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'reservations')} onClick={() => setActiveTab('reservations')}>
            Mis Reservaciones
          </button>
          <button style={tabStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>
            Mi Perfil
          </button>
        </div>

        {activeTab === 'reservations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
            ) : reservations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ fontSize: '48px' }}>📅</p>
                <p>No tienes reservaciones aún</p>
              </div>
            ) : (
              reservations.map(res => {
                const statusColor = getStatusColor(res.status)
                return (
                  <div key={res.id} style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderTop: '1px solid var(--glass-border-top)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(16px)',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h3 style={{
                          color: 'var(--text-primary)',
                          fontSize: '16px',
                          fontWeight: '500',
                          margin: '0 0 4px'
                        }}>
                          {res.vehicle_brand} {res.vehicle_model} {res.vehicle_year}
                        </h3>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          margin: 0,
                          fontFamily: 'monospace'
                        }}>
                          {res.reservation_code}
                        </p>
                      </div>
                      <span style={{
                        background: statusColor.bg,
                        border: `1px solid ${statusColor.border}`,
                        color: statusColor.text,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {res.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>Recogida</p>
                        <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>{res.pickup_date}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>{res.pickup_location}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>Devolución</p>
                        <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>{res.return_date}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>{res.return_location}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>Total</p>
                        <p style={{
                          color: 'var(--accent)',
                          fontSize: '20px',
                          fontFamily: 'Bebas Neue, sans-serif',
                          margin: 0,
                          letterSpacing: '1px'
                        }}>
                          ${res.total_amount}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>{res.total_days} días</p>
                      </div>
                    </div>

                    {['PENDING', 'CONFIRMED'].includes(res.status) && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        style={{
                          padding: '8px 20px',
                          background: 'rgba(226,75,74,0.15)',
                          border: '1px solid rgba(226,75,74,0.4)',
                          color: '#E24B4A',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Cancelar reservación
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            backdropFilter: 'blur(24px)',
            padding: '24px'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Información personal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Nombre', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Teléfono', value: user?.phone || 'No registrado' },
                { label: 'Rol', value: user?.role }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--glass-border)'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyAccount