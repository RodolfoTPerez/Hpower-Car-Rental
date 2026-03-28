import React from 'react';
import { useTranslation } from 'react-i18next';

// Premium Inline SVGs
const iconShield = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const iconCar = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"></path></svg>;
const iconPlus = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const iconCheck = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const getIconForCharge = (catId, name) => {
  const n = name.toLowerCase();
  if (n.includes('protection') || n.includes('waiver') || n.includes('insurance') || n.includes('cdw')) return iconShield;
  if (n.includes('driver')) return iconCar;
  return iconPlus;
};

const ExtraChargeCard = ({ charge, brandId, isSelected, onToggle }) => {
  const { t } = useTranslation();

  // 1. Resolver el precio basado en la Brand
  // La API nos dio percent_amount: {"1": {"amount": "24.99"}, "2": {"amount": "24.95"}}
  const brandData = charge.percent_amount?.[brandId] || charge.percent_amount?.['1']; 
  const rawAmount = brandData?.amount;
  
  // Si no hay monto o está excluido (though excluded already filtered outside), show 0
  const amount = rawAmount ? parseFloat(rawAmount) : 0;

  // 2. Formatear el precio
  let displayPrice = '';
  if (amount === 0 && charge.charge_type !== 'percent') {
    displayPrice = t('booking.free', 'Free');
  } else if (charge.charge_type === 'percent') {
    displayPrice = `${amount}%`;
  } else {
    displayPrice = `$${amount.toFixed(2)}`;
    if (charge.charge_type === 'daily') {
      displayPrice += ` /${t('booking.day', 'Day')}`;
    }
  }

  const icon = getIconForCharge(charge.additional_charge_category_id, charge.name);

  return (
    <div 
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '15px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 15px rgba(255, 204, 0, 0.2)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => onToggle(charge)}
    >
      {/* Indicador superior si está seleccionado */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--accent)'
        }} />
      )}

      {/* Icono Redondo */}
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: isSelected ? 'rgba(255, 204, 0, 0.1)' : 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: isSelected ? 'var(--accent)' : '#fff',
        transition: '0.3s'
      }}>
        {icon}
      </div>

      {/* Título y Precio */}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600', color: '#fff' }}>
          {charge.name}
        </h4>
        <p style={{ margin: 0, fontSize: '14px', color: isSelected ? 'var(--accent)' : '#aaa', fontWeight: isSelected ? 'bold' : 'normal' }}>
          {displayPrice}
        </p>
      </div>

      {/* Botón Inferior */}
      <button style={{
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        background: isSelected ? 'var(--accent)' : '#1a202c',
        color: isSelected ? '#000' : '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}>
        {isSelected ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {iconCheck} {t('booking.selected', 'Selected')}
          </span>
        ) : charge.additional_charge_category_id === 1 ? (
          t('booking.add_protection', 'Add Protection')
        ) : (
          t('booking.select', 'Select')
        )}
      </button>

    </div>
  );
};

export default ExtraChargeCard;
