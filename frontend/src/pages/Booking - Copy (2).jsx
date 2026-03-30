import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BookingSummary from '../components/BookingSummary';
import ExtraChargeCard from '../components/ExtraChargeCard';
import api from '../services/api';

const Booking = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedVehicle, bookingDetails } = location.state || {};

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', otherEmail: '', otherPhone: '',
    street1: '', airlineInfo: '', city: '', state: '', zip: '', country: 'United States', birthday: ''
  });

  // --- LÓGICA DE CARGOS ---
  const [categories, setCategories] = useState([]);
  const [charges, setCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState({});
  const [loadingCharges, setLoadingCharges] = useState(false);

  // --- TUS ESTADOS ORIGINALES DE FECHAS (RESTABLECIDOS) ---
  const [pDate, setPDate] = useState(bookingDetails?.pDate || '');
  const [pTime, setPTime] = useState(bookingDetails?.pTime || '');
  const [rDate, setRDate] = useState(bookingDetails?.rDate || '');
  const [rTime, setRTime] = useState(bookingDetails?.rTime || '');
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingReturn, setIsEditingReturn] = useState(false);
  const [tempPDate, setTempPDate] = useState('');
  const [tempPTime, setTempPTime] = useState('');
  const [tempRDate, setTempRDate] = useState('');
  const [tempRTime, setTempRTime] = useState('');

  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const h = String(i).padStart(2, '0');
      const m = String(j).padStart(2, '0');
      timeOptions.push(`${h}:${m}`);
    }
  }

  const countries = [
    "United States", "Canada", "Mexico", "United Kingdom", "Germany", "France", "Spain", "Italy", 
    "Dominican Republic", "Puerto Rico", "Colombia", "Venezuela", "Brazil"
  ];

  const loadCharges = async () => {
    if (!bookingDetails?.selectedLocationId) return;
    try {
      setLoadingCharges(true);
      const res = await api.get(`/charges?location_id=${bookingDetails.selectedLocationId}`);
      if (res.data.success) {
        setCategories(res.data.data.categories);
        setCharges(res.data.data.charges);
      }
    } catch (e) { console.error('Error fetching charges:', e); }
    finally { setLoadingCharges(false); }
  };

  useEffect(() => {
    if (step === 2 && charges.length === 0) loadCharges();
  }, [step]);

  useEffect(() => {
    if (!selectedVehicle) navigate('/fleet');
  }, [selectedVehicle, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCharge = (charge) => {
    setSelectedCharges(prev => {
      const next = { ...prev };
      if (next[charge.id]) delete next[charge.id];
      else next[charge.id] = charge;
      return next;
    });
  };

  // --- TU VALIDACIÓN ORIGINAL COMPLETA ---
  const isStep1Valid = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'city', 'state', 'zip', 'country', 'birthday'];
    return required.every(field => formData[field]?.trim() !== '');
  };

  const inputStyle = { width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', transition: '0.3s' };
  const labelStyle = { display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' };
  const sectionHeaderStyle = { fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)', marginBottom: '20px', letterSpacing: '1px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' };

  return (
    <div style={{ minHeight: '100vh', padding: '130px 4% 5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '60px' }}>
        
        <div style={{ flex: '1', maxWidth: '1000px', background: 'var(--navbar-bg)', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '40px', backdropFilter: 'blur(20px)' }}>
          
          {/* PASOS */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
             {[1, 2, 3, 4].map(s => (
               <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                 <div style={{ height: '4px', background: step >= s ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }} />
                 <span style={{ fontSize: '12px', fontWeight: 'bold', color: step >= s ? 'var(--accent)' : '#666' }}>
                   {s === 1 ? `1. ${t('booking.customer_info', 'CUSTOMER')}` : s === 2 ? '2. EXTRAS' : s === 3 ? '3. REVIEW' : `4. ${t('booking.payment', 'PAYMENT')}`}
                 </span>
               </div>
             ))}
          </div>

          {/* PASO 1: FORMULARIO ORIGINAL COMPLETO */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>{t('booking.customer_information', 'CUSTOMER INFORMATION')}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div><label style={labelStyle}>{t('booking.first_name', 'FIRST NAME')} *</label><input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} placeholder="John" /></div>
                <div><label style={labelStyle}>{t('booking.last_name', 'LAST NAME')} *</label><input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} placeholder="Doe" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div><label style={labelStyle}>{t('booking.email', 'EMAIL ADDRESS')} *</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.phone', 'PHONE NUMBER')} *</label><input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div><label style={labelStyle}>{t('booking.other_email', 'OTHER EMAIL')}</label><input type="email" name="otherEmail" value={formData.otherEmail} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.other_phone', 'OTHER PHONE NUMBER')}</label><input name="otherPhone" value={formData.otherPhone} onChange={handleChange} style={inputStyle} /></div>
              </div>

              <div style={{ marginBottom: '30px' }}><label style={labelStyle}>{t('booking.street', 'STREET 1')}</label><input name="street1" value={formData.street1} onChange={handleChange} style={inputStyle} /></div>
              <div style={{ marginBottom: '30px' }}><label style={labelStyle}>{t('booking.airline_info', 'AIRLINE NAME, FLIGHT NUMBER, LANDING TIME')}</label><input name="airlineInfo" value={formData.airlineInfo} onChange={handleChange} style={inputStyle} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div><label style={labelStyle}>{t('booking.city', 'CITY')} *</label><input name="city" value={formData.city} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.state', 'STATE')} *</label><input name="state" value={formData.state} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.zip', 'ZIP')} *</label><input name="zip" value={formData.zip} onChange={handleChange} style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.country', 'COUNTRY')} *</label>
                  <select name="country" value={formData.country} onChange={handleChange} style={{ ...inputStyle, background: '#111' }}>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>{t('booking.birthday', 'BIRTHDAY')} *</label><input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={inputStyle} /></div>
              </div>

              <button onClick={() => isStep1Valid() && setStep(2)} disabled={!isStep1Valid()} style={{ width: '100%', padding: '18px', borderRadius: '15px', background: isStep1Valid() ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: isStep1Valid() ? '#000' : '#666', fontWeight: '800', border: 'none', cursor: isStep1Valid() ? 'pointer' : 'not-allowed' }}>
                {t('common.continue', 'CONTINUE TO EXTRAS')}
              </button>
            </div>
          )}

          {/* PASO 2: EXTRAS (LO QUE AGREGAMOS) */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>SELECT EXTRAS</h2>
              {loadingCharges ? <p>Loading...</p> : categories.map(cat => {
                const catCharges = charges.filter(c => c.additional_charge_category_id === cat.id);
                if (catCharges.length === 0) return null;
                return (
                  <div key={cat.id} style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '15px' }}>{cat.label}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                      {catCharges.map(charge => (
                        <ExtraChargeCard key={charge.id} charge={charge} isSelected={!!selectedCharges[charge.id]} onToggle={() => toggleCharge(charge)} />
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '15px', borderRadius: '10px', background: 'transparent', border: '1px solid #444', color: '#fff' }}>BACK</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: '15px', borderRadius: '10px', background: 'var(--accent)', color: '#000', fontWeight: 'bold', border: 'none' }}>CONTINUE TO REVIEW</button>
              </div>
            </div>
          )}
{/* PASO 3: REVIEW YOUR BOOKING (DISEÑO MEJORADO) */}
{/* PASO 3: REVIEW YOUR BOOKING (ESTRUCTURA FINAL SIN ERRORES) */}
{step === 3 && (
  <div style={{ animation: 'fadeIn 0.5s ease' }}>
    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--accent)', marginBottom: '30px', letterSpacing: '2px' }}>
      {t('booking.review.title', 'REVIEW YOUR BOOKING')}
    </h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 1. VEHÍCULO E ITINERARIO */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '24px', padding: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          
          {/* SECCIÓN IMAGEN: Si no carga la del objeto, intentamos con 'img' */}
          <div style={{ flex: '1', minWidth: '320px', textAlign: 'center' }}>
            <img 
              src={selectedVehicle?.image || selectedVehicle?.img} 
		
              alt="Selected Vehicle" 
              style={{ width: '100%', height: 'auto', maxWidth: '400px', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))' }} 
            />
            <h3 style={{ color: '#fff', fontSize: '28px', fontFamily: 'Bebas Neue', marginTop: '15px' }}>
              {selectedVehicle?.name || 'Vehicle Model'}
            </h3>
          </div>

          {/* SECCIÓN ITINERARIO */}
          <div style={{ flex: '1.2', minWidth: '300px', borderLeft: '1px solid #444', paddingLeft: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('booking.pickup', 'PICKUP / RECOGIDA')}</p>
                <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>{pDate}</p>
                <p style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: 'bold' }}>{pTime}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>{bookingDetails?.selectedLocationName}</p>
              </div>
              <div>
                <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('booking.return', 'RETURN / DEVOLUCIÓN')}</p>
                <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>{rDate}</p>
                <p style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: 'bold' }}>{rTime}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>{bookingDetails?.returnLocationName || bookingDetails?.selectedLocationName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DATOS DE LOS CONDUCTORES (CORREGIDO: NOMBRE COMPLETO) */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '24px', padding: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* CONDUCTOR PRINCIPAL */}
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '15px', textTransform: 'uppercase' }}>{t('booking.main_driver', 'MAIN DRIVER')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.full_name', 'FULL NAME')}</p>
                <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.email', 'EMAIL')}</p>
                <p style={{ color: '#fff', fontSize: '14px' }}>{formData.email}</p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.phone', 'PHONE')}</p>
                <p style={{ color: '#fff', fontSize: '14px' }}>{formData.phone}</p>
              </div>
            </div>
          </div>

          {/* CONDUCTOR ADICIONAL: Solo si existe el nombre */}
          {formData.otherFirstName && (
            <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
              <h4 style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '15px', textTransform: 'uppercase' }}>{t('booking.additional_driver', 'ADDITIONAL DRIVER')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.full_name', 'FULL NAME')}</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{formData.otherFirstName} {formData.otherLastName}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.email', 'EMAIL')}</p>
                  <p style={{ color: '#fff', fontSize: '14px' }}>{formData.otherEmail || '---'}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '10px' }}>{t('booking.phone', 'PHONE')}</p>
                  <p style={{ color: '#fff', fontSize: '14px' }}>{formData.otherPhone || '---'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. EXTRAS SELECCIONADOS */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '24px', padding: '25px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.values(selectedCharges).map((charge) => (
            <div key={charge.id} style={{ background: 'var(--accent)', color: '#000', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '900' }}>
              {charge.label || charge.name}
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <button onClick={() => setStep(2)} style={{ flex: 1, padding: '18px', borderRadius: '15px', background: 'transparent', border: '1px solid #444', color: '#fff', fontWeight: 'bold' }}>{t('common.back', 'BACK')}</button>
        <button onClick={() => setStep(4)} style={{ flex: 2, padding: '18px', borderRadius: '15px', background: 'var(--accent)', color: '#000', fontWeight: '900', border: 'none' }}>{t('booking.go_to_payment', 'GO TO PAYMENT')}</button>
      </div>

    </div>
  </div>
)}

 {/* PASO 4: PAGO */}
          {step === 4 && (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <h2 style={sectionHeaderStyle}>{t('booking.payment_method', 'PAYMENT METHOD')}</h2>
               <p style={{ color: '#888' }}>Próximamente...</p>
               <button onClick={() => setStep(3)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px 30px', borderRadius: '10px' }}>VOLVER</button>
             </div>
          )}
        </div>

        {/* TU SUMMARY ORIGINAL CON VALIDACIONES DE FECHAS */}
        <BookingSummary 
          selectedVehicle={selectedVehicle}
          booking={bookingDetails}
          pDate={pDate} pTime={pTime} rDate={rDate} rTime={rTime}
          selectedExtraCharges={Object.values(selectedCharges)}
          isEditingPickup={isEditingPickup} setIsEditingPickup={setIsEditingPickup}
          isEditingReturn={isEditingReturn} setIsEditingReturn={setIsEditingReturn}
          tempPDate={tempPDate} setTempPDate={setTempPDate}
          tempPTime={tempPTime} setTempPTime={setTempPTime}
          tempRDate={tempRDate} setTempRDate={setTempRDate}
          tempRTime={tempRTime} setTempRTime={setTempRTime}
          timeOptions={timeOptions}
          onConfirmPickup={() => { 
            const start = new Date(`${tempPDate}T${tempPTime}`);
            const end = new Date(`${rDate}T${rTime}`);
            if (start >= end) {
              alert(t('errors.invalid_dates', 'La fecha de recogida debe ser anterior a la de devolución'));
              return;
            }
            setPDate(tempPDate); setPTime(tempPTime); setIsEditingPickup(false); 
          }}
          onConfirmReturn={() => { 
            const start = new Date(`${pDate}T${pTime}`);
            const end = new Date(`${tempRDate}T${tempRTime}`);
            if (end <= start) {
              alert(t('errors.invalid_dates', 'La fecha de devolución posterior a la de recogida'));
              return;
            }
            setRDate(tempRDate); setRTime(tempRTime); setIsEditingReturn(false); 
          }}
          showContinueButton={false} 
        />
      </div>
    </div>
  );
};

export default Booking;