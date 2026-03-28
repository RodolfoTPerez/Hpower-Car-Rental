import { useTranslation } from 'react-i18next';

const BookingSummary = ({ 
  selectedVehicle, 
  booking, 
  pDate, 
  pTime, 
  rDate, 
  rTime, 
  selectedLocationName,
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

  // ----- EXTRAS CALCULATION -----
  const brandId = selectedLocationName?.toLowerCase().includes('charlotte') ? '2' 
                : selectedLocationName?.toLowerCase().includes('nashville') ? '3' 
                : '1'; // Fallback to Miami

  let addonsTotal = 0;
  const categoryLabels = { 1: t('booking.coverages', 'Coverages'), 4: t('booking.services', 'Services'), 43: t('booking.other_fees', 'Other Fees') };
  let addonsBreakdown = {};

  if (booking && selectedExtraCharges.length > 0) {
    const rentalSubtotal = booking.subtotalDays + (booking.hours > 0 ? booking.subtotalHours : 0);
    const rentalDaysForCharges = booking.days + (booking.hours > 0 ? 1 : 0); // Many places charge full day for extra hours

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
        // 'amount' (flat fee)
        calculatedCost = amount;
      }

      addonsTotal += calculatedCost;
      const catLab = categoryLabels[charge.additional_charge_category_id] || t('booking.extras', 'Extras');
      if (!addonsBreakdown[catLab]) addonsBreakdown[catLab] = [];
      addonsBreakdown[catLab].push({
        name: charge.name,
        cost: calculatedCost,
        rawAmount: amount,
        type: charge.charge_type
      });
    });
  }

  const grandTotal = (booking?.total || 0) + addonsTotal;
  // ------------------------------

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
            {setIsEditingPickup && (
              <button onClick={() => { setTempPDate(pDate); setTempPTime(pTime); setIsEditingPickup(!isEditingPickup); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
            )}
          </div>
          {isEditingPickup ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <input type="date" value={tempPDate} onChange={e => setTempPDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }} />
              <select value={tempPTime} onChange={e => setTempPTime(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }}>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onConfirmPickup} style={{ flex: 1, background: 'var(--accent)', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>{t('common.ok', 'OK')}</button>
                <button onClick={() => setIsEditingPickup(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px' }}>{t('common.cancel', 'CANCEL')}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <div>{t('common.date', 'FECHA')}: <span style={{ fontWeight: '400' }}>{pDate || '---'}</span> &nbsp;&nbsp;&nbsp;&nbsp; {t('common.time', 'HORA')}: <span style={{ fontWeight: '400' }}>{pTime || '---'}</span></div>
              <div>{t('common.location', 'UBICACIÓN')}: <span style={{ fontWeight: '400' }}>{selectedLocationName || '---'}</span></div>
            </div>
          )}
        </div>

        {/* RETURN */}
        <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>🏁 {t('vehicles.return', 'DEVOLUCIÓN')}</span>
            {setIsEditingReturn && (
              <button onClick={() => { setTempRDate(rDate); setTempRTime(rTime); setIsEditingReturn(!isEditingReturn); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
            )}
          </div>
          {isEditingReturn ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <input type="date" value={tempRDate} onChange={e => setTempRDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }} />
              <select value={tempRTime} onChange={e => setTempRTime(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--accent)', background: '#000', color: '#fff' }}>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onConfirmReturn} style={{ flex: 1, background: 'var(--accent)', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>{t('common.ok', 'OK')}</button>
                <button onClick={() => setIsEditingReturn(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px' }}>{t('common.cancel', 'CANCEL')}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <div>{t('common.date', 'FECHA')}: <span style={{ fontWeight: '400' }}>{rDate || '---'}</span> &nbsp;&nbsp;&nbsp;&nbsp; {t('common.time', 'HORA')}: <span style={{ fontWeight: '400' }}>{rTime || '---'}</span></div>
              <div>{t('common.location', 'UBICACIÓN')}: <span style={{ fontWeight: '400' }}>{selectedLocationName || '---'}</span></div>
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '20px 0' }} />

        {/* PRICING */}
        {booking && typeof booking.dailyRate !== 'undefined' && (
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '25px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '15px' }}>{t('vehicles.category', 'CATEGORÍA')}: {booking.category}</div>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{booking.days || 0} {t('common.days', 'Días')} x ${(booking.dailyRate || 0).toFixed(2)}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${(booking.subtotalDays || 0).toFixed(2)}</span>
              </div>
              {booking.hours > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>{booking.hours} {t('common.hours', 'Horas')} x ${((booking.dailyRate || 0)/24).toFixed(2)}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${(booking.subtotalHours || 0).toFixed(2)}</span>
                </div>
              )}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
              
              {Object.keys(addonsBreakdown).length > 0 && (
                <div style={{ padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)', marginBottom: '10px' }}>
                  {Object.entries(addonsBreakdown)
                    .sort((a, b) => {
                      const order = [t('booking.coverages', 'Coverages'), t('booking.services', 'Services'), t('booking.other_fees', 'Other Fees'), t('booking.extras', 'Extras')];
                      const idxA = order.indexOf(a[0]);
                      const idxB = order.indexOf(b[0]);
                      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                    })
                    .map(([catName, items], catIdx) => (
                    <div key={catIdx} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>{catName}</div>
                      {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.name}</span>
                          <span>${(item.cost || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{t('booking.addons_total', 'Subtotal Add-ons')}</span>
                    <span>${(addonsTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>{t('common.total', 'TOTAL')}</span>
                <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '24px', fontFamily: 'Bebas Neue' }}>${(grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* SELECTED VEHICLE */}
        {selectedVehicle ? (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <img 
                src={selectedVehicle.main_image || selectedVehicle.images?.[0] || '/assets/placeholder-car.png'} 
                onError={(e) => { e.target.onerror = null; e.target.src = selectedVehicle.images?.[0] || 'https://via.placeholder.com/80x50?text=Auto'; }}
                style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }} 
                alt="Selected" 
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedVehicle.brand} {selectedVehicle.model}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent)' }}>${Number(selectedVehicle.current_rate?.daily_rate || selectedVehicle.base_price_per_day || 0).toFixed(2)} / día</div>
              </div>
            </div>
            {showContinueButton && (
              <div 
                onClick={onContinue}
                style={{ background: 'var(--accent)', color: '#000', padding: '15px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}
              >
                {t('vehicles.confirm_booking', 'CONTINUAR RESERVA')}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>{t('vehicles.select_to_continue', 'Selecciona un vehículo para ver el total')}</p>          </div>
        )}
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;
