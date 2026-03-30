import { useTranslation } from 'react-i18next';

const BookingSummary = ({ 
  selectedVehicle, 
  booking, 
  pDate, 
  pTime, 
  rDate, 
  rTime, 
  selectedLocationName,
  // Props de Ubicación (Faltaban en tu archivo)
  isEditingLocation,
  setIsEditingLocation,
  tempLocationName,
  setTempLocationName,
  locations = [],
  onConfirmLocation,
  // Props de Fechas
  isEditingPickup,
  setIsEditingPickup,
  isEditingReturn,
  setIsEditingReturn,
  tempPDate,
  setTempPDate,
  tempPTime,
  setTempPTime,
  tempRDate,
  setTempRDate,
  tempRTime,
  setTempRTime,
  timeOptions,
  selectedExtraCharges = [],
  onConfirmPickup,
  onConfirmReturn,
  showContinueButton = false,
  onContinue
}) => {
  const { t } = useTranslation();

  // ----- CÁLCULO DE EXTRAS (Restaurado) -----
  const brandId = selectedLocationName?.toLowerCase().includes('charlotte') ? '2' 
                : selectedLocationName?.toLowerCase().includes('nashville') ? '3' 
                : '1'; 

  let addonsTotal = 0;
  const categoryLabels = { 
    1: t('booking.coverages', 'Coverages'), 
    4: t('booking.services', 'Services'), 
    43: t('booking.other_fees', 'Other Fees') 
  };
  let addonsBreakdown = {};

  if (booking && selectedExtraCharges.length > 0) {
    const rentalSubtotal = booking.subtotalDays + (booking.hours > 0 ? booking.subtotalHours : 0);
    const rentalDaysForCharges = booking.days + (booking.hours > 0 ? 1 : 0); 

    selectedExtraCharges.forEach(charge => {
      const brandData = charge.percent_amount?.[brandId] || charge.percent_amount?.['1'];
      let chargeAmountStr = brandData?.amount || 0;
      let amount = parseFloat(chargeAmountStr) || 0;
      let calculatedCost = 0;

      if (charge.charge_type === 'percent') {
        calculatedCost = rentalSubtotal * (amount / 100);
      } else if (charge.charge_type === 'daily') {
        calculatedCost = amount * rentalDaysForCharges;
      } else {
        calculatedCost = amount;
      }

      addonsTotal += calculatedCost;
      const catLab = categoryLabels[charge.additional_charge_category_id] || t('booking.extras', 'Extras');
      if (!addonsBreakdown[catLab]) addonsBreakdown[catLab] = [];
      addonsBreakdown[catLab].push({
        name: charge.name,
        cost: calculatedCost
      });
    });
  }

  const grandTotal = (booking?.total || 0) + addonsTotal;

  return (
    <aside style={{ width: '380px', position: 'sticky', top: '120px', marginLeft: 'auto', zIndex: 100 }}>
      <div style={{ background: 'var(--navbar-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '30px', paddingRight: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '10px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--accent)', marginBottom: '25px', letterSpacing: '1px' }}>
            {t('vehicles.booking_summary', 'RESUMEN DE RENTA')}
          </h2>

          {/* PICKUP */}
          <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 {t('vehicles.pickup', 'RECOGIDA')}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setTempLocationName(selectedLocationName); setIsEditingLocation(!isEditingLocation); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>📍</button>
                  <button onClick={() => { setTempPDate(pDate); setTempPTime(pTime); setIsEditingPickup(!isEditingPickup); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>📝</button>
              </div>
            </div>

            {isEditingLocation && (
              <div style={{ marginBottom: '15px', display: 'grid', gap: '10px' }}>
                  <select value={tempLocationName} onChange={e => setTempLocationName(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }}>
                    {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onConfirmLocation} style={{ flex: 1, background: 'var(--accent)', border: 'none', padding: '5px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', color: '#000' }}>SAVE LOC</button>
                    <button onClick={() => setIsEditingLocation(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px', borderRadius: '8px', fontSize: '12px' }}>X</button>
                  </div>
              </div>
            )}

            {isEditingPickup ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <input type="date" value={tempPDate} onChange={e => setTempPDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }} />
                <select value={tempPTime} onChange={e => setTempPTime(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={onConfirmPickup} style={{ flex: 1, background: 'var(--accent)', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', color: '#000' }}>OK</button>
                  <button onClick={() => setIsEditingPickup(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px' }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                <div>FECHA: <span style={{ fontWeight: '400' }}>{pDate || '---'}</span> &nbsp;&nbsp; HORA: <span style={{ fontWeight: '400' }}>{pTime || '---'}</span></div>
                <div>UBICACIÓN: <span style={{ fontWeight: '400', color: 'var(--accent)' }}>{selectedLocationName || '---'}</span></div>
              </div>
            )}
          </div>

          {/* RETURN */}
          <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>🏁 {t('vehicles.return', 'DEVOLUCIÓN')}</span>
              <button onClick={() => { setTempRDate(rDate); setTempRTime(rTime); setIsEditingReturn(!isEditingReturn); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>📝</button>
            </div>
            {isEditingReturn ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <input type="date" value={tempRDate} onChange={e => setTempRDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }} />
                <select value={tempRTime} onChange={e => setTempRTime(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={onConfirmReturn} style={{ flex: 1, background: 'var(--accent)', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', color: '#000' }}>OK</button>
                  <button onClick={() => setIsEditingReturn(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px' }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                <div>FECHA: <span style={{ fontWeight: '400' }}>{rDate || '---'}</span> &nbsp;&nbsp; HORA: <span style={{ fontWeight: '400' }}>{rTime || '---'}</span></div>
                <div>UBICACIÓN: <span style={{ fontWeight: '400' }}>{selectedLocationName || '---'}</span></div>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '20px 0' }} />

          {/* PRICING (Restaurado) */}
          {booking && typeof booking.dailyRate !== 'undefined' && (
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '25px' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '15px' }}>{booking.category}</div>
              <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>{booking.days || 0} Días x ${(booking.dailyRate || 0).toFixed(2)}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${(booking.subtotalDays || 0).toFixed(2)}</span>
                </div>
                {booking.hours > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{booking.hours} Horas x ${((booking.dailyRate || 0)/24).toFixed(2)}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${(booking.subtotalHours || 0).toFixed(2)}</span>
                  </div>
                )}
                
                {Object.entries(addonsBreakdown).map(([catName, items], catIdx) => (
                  <div key={catIdx} style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '5px' }}>{catName}</div>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <span>{item.name}</span>
                        <span>${item.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>TOTAL</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '24px', fontFamily: 'Bebas Neue' }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {selectedVehicle && (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <img src={selectedVehicle.main_image || selectedVehicle.images?.[0]} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} alt="Car" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{selectedVehicle.brand} {selectedVehicle.model}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;