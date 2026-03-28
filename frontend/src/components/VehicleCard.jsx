import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const VehicleCard = ({ vehicle, layout = 'vertical', onSelect, isSelected }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  /* ─── HELPERS DE TRADUCCIÓN (ORIGINALES) ─── */
  const getFuelLabel = (fuel) => {
    const map = { 
      GAS: t('vehicles.gas'), 
      DIESEL: t('vehicles.diesel'), 
      ELECTRIC: t('vehicles.electric'), 
      HYBRID: t('vehicles.hybrid') 
    }
    return map[fuel] || fuel
  }

  const getTransmissionLabel = (trans) => {
    return trans === 'AUTO' ? t('vehicles.auto') : t('vehicles.manual')
  }

  const getFeatureIcon = (featureStr) => {
    const f = String(featureStr).toLowerCase();
    if (f.includes('auto') || f.includes('trans')) return '🕹️';
    if (f.includes('steer')) return '🛞';
    if (f.includes('door')) return '🚪';
    if (f.includes('air') || f.includes('ac ') || f.includes('a/c') || f.includes('condit')) return '❄️';
    if (f.includes('radio') || f.includes('audio') || f.includes('stereo') || f.includes('player')) return '📻';
    if (f.includes('blue') || f.includes('tooth')) return '📶';
    if (f.includes('cam')) return '📷';
    if (f.includes('nav') || f.includes('gps')) return '🗺️';
    if (f.includes('bag') || f.includes('lug') || f.includes('suit')) return '🧳';
    if (f.includes('seat')) return '💺';
    if (f.includes('engine') || f.includes('cyl')) return '⚙️';
    return '✨';
  };

  const renderFeatures = () => {
    let rawFeatures = vehicle.features || [];
    let validFeatures = Array.isArray(rawFeatures) ? rawFeatures.filter(f => typeof f === 'string' && f.trim() !== '') : [];
    
    if (validFeatures.length === 0) {
      const transLabel = vehicle.transmission === 'AUTO' ? 'Automatic Transmission' : 'Manual Transmission';
      validFeatures = [
        transLabel,
        'Power Steering',
        '4-doors',
        'Airconditioning',
        'Radio Player',
        'Bluetooth'
      ];
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
        {validFeatures.slice(0, 8).map((feat, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '6px', 
            padding: '4px 10px', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            fontWeight: '600',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ marginRight: '6px', fontSize: '12px' }}>{getFeatureIcon(feat)}</span>
            {feat}
          </div>
        ))}
        {validFeatures.length > 8 && (
          <div style={{ fontSize: '11px', color: 'var(--accent)', alignSelf: 'center', marginLeft: '4px' }}>+{validFeatures.length - 8} more</div>
        )}
      </div>
    );
  };

  /* ─── LÓGICA DE PRECIO (ORIGINAL) ─── */
  const displayPrice = vehicle.current_rate?.daily_rate || vehicle.base_price_per_day || 0;
  
  const isHorizontal = layout === 'horizontal';

  const handleAction = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(vehicle);
    } else {
      navigate(`/fleet/${vehicle.id}`);
    }
  }

  return (
    <div 
      style={{
        background: isSelected ? 'rgba(232, 255, 0, 0.05)' : 'var(--glass-bg)',
        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
        borderTop: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border-top)',
        borderRadius: '16px',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: isHorizontal ? 'auto' : '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        boxShadow: isSelected ? '0 0 20px rgba(232, 255, 0, 0.15)' : '0 4px 20px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(232, 255, 0, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(232, 255, 0, 0.4)';
        }
        const img = e.currentTarget.querySelector('.vehicle-img-zoom');
        if (img) img.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        }
        const img = e.currentTarget.querySelector('.vehicle-img-zoom');
        if (img) img.style.transform = 'scale(1)';
      }}
      onClick={() => onSelect ? onSelect(vehicle) : navigate(`/fleet/${vehicle.id}`)}
    >
      {/* SECCIÓN IMAGEN */}
      <div style={{
        width: isHorizontal ? '35%' : '100%',
        height: isHorizontal ? '220px' : '200px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRight: isHorizontal ? '1px solid var(--glass-border)' : 'none'
      }}>
        {vehicle.main_image ? (
          <img 
            className="vehicle-img-zoom"
            src={vehicle.main_image} 
            alt={`${vehicle.brand} ${vehicle.model}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
          />
        ) : (
          <span style={{ fontSize: isHorizontal ? '80px' : '64px', opacity: 0.5 }}>🚗</span>
        )}
      </div>

      {/* SECCIÓN DETALLES */}
      <div style={{ 
        padding: '24px', 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? '30px' : '0'
      }}>
        
        {/* Info Principal */}
        <div style={{ flex: isHorizontal ? '1.5' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700', margin: 0 }}>
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.license_plate && (
              <span style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--accent)', 
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                {vehicle.license_plate}
              </span>
            )}
            {isSelected && <span style={{ color: 'var(--accent)', fontSize: '10px', border: '1px solid var(--accent)', padding: '2px 6px', borderRadius: '4px' }}>SELECTED</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 16px' }}>
            {vehicle.year} · {vehicle.vehicle_categories?.name || t('vehicles.category')}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>👥</span> {vehicle.seats}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>⚙️</span> {getTransmissionLabel(vehicle.transmission)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>⛽</span> {getFuelLabel(vehicle.fuel_type)}</div>
          </div>

          {renderFeatures()}
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'rgba(50, 255, 100, 0.1)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(50, 255, 100, 0.2)',
            marginTop: '16px'
          }}>
            <span style={{ color: '#00FF66', fontSize: '14px' }}>🏁</span> 
            <span style={{ fontWeight: '700', color: '#00FF66', fontSize: '12px', letterSpacing: '0.5px' }}>
              {vehicle.total_units_available} {t('vehicles.units_available').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Precio y Botón (A la derecha en Horizontal) */}
        <div style={{ 
          flex: isHorizontal ? '1' : 'none',
          display: 'flex',
          flexDirection: isHorizontal ? 'column' : 'row',
          justifyContent: isHorizontal ? 'center' : 'space-between',
          alignItems: isHorizontal ? 'center' : 'center',
          gap: isHorizontal ? '15px' : '0',
          borderLeft: isHorizontal ? '1px solid var(--glass-border)' : 'none',
          paddingLeft: isHorizontal ? '30px' : '0',
          marginTop: isHorizontal ? '0' : '20px'
        }}>
          <div style={{ textAlign: isHorizontal ? 'center' : 'left' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px' }}>{t('vehicles.per_day')}</div>
            <div style={{ color: 'var(--accent)', fontSize: '32px', fontWeight: '800', fontFamily: 'Bebas Neue' }}>
              ${displayPrice}
            </div>
          </div>

          <button
            onClick={handleAction}
            style={{
              background: isSelected ? 'transparent' : 'var(--accent)',
              border: isSelected ? '1px solid var(--accent)' : 'none',
              color: isSelected ? 'var(--accent)' : '#000',
              padding: '12px 30px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              width: isHorizontal ? '100%' : 'auto',
              transition: '0.3s'
            }}
          >
            {isSelected ? t('vehicles.selected', 'SELECTED').toUpperCase() : t('vehicles.reserve_btn').toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VehicleCard