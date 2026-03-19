import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const VehicleCard = ({ vehicle }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getFuelLabel = (fuel) => {
    const map = { GAS: t('vehicles.gas'), DIESEL: t('vehicles.diesel'), ELECTRIC: t('vehicles.electric'), HYBRID: t('vehicles.hybrid') }
    return map[fuel] || fuel
  }

  const getTransmissionLabel = (trans) => {
    return trans === 'AUTO' ? t('vehicles.auto') : t('vehicles.manual')
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderTop: '1px solid var(--glass-border-top)',
      borderRadius: '16px',
      backdropFilter: 'blur(16px)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        height: '200px',
        background: vehicle.main_image
          ? `url(${vehicle.main_image}) center/cover`
          : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {!vehicle.main_image && (
          <span style={{ fontSize: '64px' }}>🚗</span>
        )}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: vehicle.status === 'AVAILABLE' ? 'rgba(29,158,117,0.2)' : 'rgba(226,75,74,0.2)',
          border: `1px solid ${vehicle.status === 'AVAILABLE' ? '#1D9E75' : '#E24B4A'}`,
          color: vehicle.status === 'AVAILABLE' ? '#1D9E75' : '#E24B4A',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {vehicle.status === 'AVAILABLE' ? t('vehicles.available') : t('vehicles.unavailable')}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '500',
            margin: '0 0 4px'
          }}>
            {vehicle.brand} {vehicle.model}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {vehicle.year} · {vehicle.vehicle_categories?.name}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          margin: '12px 0',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <span>👥 {vehicle.seats} {t('vehicles.seats')}</span>
          <span>⚙️ {getTransmissionLabel(vehicle.transmission)}</span>
          <span>⛽ {getFuelLabel(vehicle.fuel_type)}</span>
          <span>🎨 {vehicle.color || 'N/A'}</span>
        </div>

        {vehicle.features && vehicle.features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {vehicle.features.slice(0, 3).map((f, i) => (
              <span key={i} style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '11px'
              }}>
                {f}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: '11px',
                padding: '2px 8px'
              }}>
                +{vehicle.features.length - 3}
              </span>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px'
        }}>
          <div>
            <span style={{
              color: 'var(--accent)',
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'Bebas Neue, sans-serif'
            }}>
              ${vehicle.base_price_per_day}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              /{t('vehicles.per_day')}
            </span>
          </div>

          <button
            onClick={() => navigate(`/fleet/${vehicle.id}`)}
            style={{
              background: 'var(--btn-primary-bg)',
              border: '1px solid var(--btn-primary-border)',
              color: 'var(--btn-primary-text)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {t('vehicles.reserve_btn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VehicleCard