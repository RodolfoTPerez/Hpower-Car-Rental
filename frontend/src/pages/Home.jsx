import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/fleet?startDate=${pickupDate}&endDate=${returnDate}&location=${location}`)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 2rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(48px, 10vw, 96px)',
          color: 'var(--accent)',
          margin: '0 0 16px',
          letterSpacing: '4px',
          lineHeight: 1
        }}>
          {t('home.hero_title')}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '18px',
          marginBottom: '48px',
          maxWidth: '500px'
        }}>
          {t('home.hero_subtitle')}
        </p>

        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderTop: '1px solid var(--glass-border-top)',
          borderRadius: '16px',
          backdropFilter: 'blur(24px)',
          padding: '32px'
        }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '500',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            {t('home.search_title')}
          </h2>

          <form onSubmit={handleSearch}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={labelStyle}>{t('home.pickup_location')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San José, CR"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('home.pickup_date')}</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('home.return_date')}</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--btn-primary-bg)',
                border: '1px solid var(--btn-primary-border)',
                color: 'var(--btn-primary-text)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                letterSpacing: '1px'
              }}
            >
              {t('home.search_btn')}
            </button>
          </form>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '64px',
          width: '100%',
          maxWidth: '800px'
        }}>
          {[
            { icon: '🚗', num: '50+', label: 'Vehículos' },
            { icon: '⭐', num: '4.9', label: 'Calificación' },
            { icon: '👥', num: '1000+', label: 'Clientes' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              backdropFilter: 'blur(16px)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '32px',
                color: 'var(--accent)',
                letterSpacing: '2px'
              }}>
                {stat.num}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home