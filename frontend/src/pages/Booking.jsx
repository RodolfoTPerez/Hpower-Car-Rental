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
  
  // FORMULARIO COMPLETO: No se ha eliminado ningún campo
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    otherEmail: '', 
    otherPhone: '',
    street1: '', 
    airlineInfo: '', 
    city: '', 
    state: '', 
    zip: '', 
    country: 'United States', 
    birthday: ''
  });

  const [categories, setCategories] = useState([]);
  const [charges, setCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState({});
  const [loadingCharges, setLoadingCharges] = useState(false);

  // ESTADOS DE FECHAS Y UBICACIÓN
  const [pDate, setPDate] = useState(bookingDetails?.pDate || '');
  const [pTime, setPTime] = useState(bookingDetails?.pTime || '');
  const [rDate, setRDate] = useState(bookingDetails?.rDate || '');
  const [rTime, setRTime] = useState(bookingDetails?.rTime || '');
  const [selectedLocationName, setSelectedLocationName] = useState(bookingDetails?.selectedLocationName || 'Miami');
  
  // ESTADOS DE EDICIÓN PARA EL SUMMARY
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingReturn, setIsEditingReturn] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [tempPDate, setTempPDate] = useState(bookingDetails?.pDate || '');
  const [tempPTime, setTempPTime] = useState(bookingDetails?.pTime || '');
  const [tempRDate, setTempRDate] = useState(bookingDetails?.rDate || '');
  const [tempRTime, setTempRTime] = useState(bookingDetails?.rTime || '');
  const [tempLocationName, setTempLocationName] = useState(bookingDetails?.selectedLocationName || 'Miami');

  const locations = [
    { id: 1, name: 'Miami' }, 
    { id: 2, name: 'Charlotte' }, 
    { id: 3, name: 'Nashville' }
  ];

  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const h = String(i).padStart(2, '0');
      const m = String(j).padStart(2, '0');
      timeOptions.push(`${h}:${m}`);
    }
  }

  const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Dominican Republic", "Puerto Rico", "Colombia", "Venezuela", "Brazil"];

  const loadCharges = async () => {
    if (!bookingDetails?.selectedLocationId) return;
    try {
      setLoadingCharges(true);
      const res = await api.get(`/charges?location_id=${bookingDetails.selectedLocationId}`);
      if (res.data.success) {
        setCategories(res.data.data.categories);
        setCharges(res.data.data.charges);
      }
    } catch (e) { 
      console.error('Error fetching charges:', e); 
    } finally { 
      setLoadingCharges(false); 
    }
  };

  useEffect(() => {
    if (step === 2 && charges.length === 0) loadCharges();
  }, [step]);

  useEffect(() => {
    if (!selectedVehicle) navigate('/fleet');
  }, [selectedVehicle]);

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

  // VALIDACIÓN: Incluye street1 como requerido
  const isStep1Valid = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'city', 'state', 'zip', 'country', 'birthday', 'street1'];
    return required.every(field => formData[field]?.trim() !== '');
  };

  const inputStyle = { width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' };
  const sectionHeaderStyle = { fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' };

  return (
    <div style={{ minHeight: '100vh', padding: '130px 4% 5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '60px' }}>
        
        <div style={{ flex: '1', maxWidth: '1000px', background: 'var(--navbar-bg)', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '40px', backdropFilter: 'blur(20px)' }}>
          
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

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>{t('booking.customer_information', 'CUSTOMER INFORMATION')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={labelStyle}>{t('booking.first_name', 'FIRST NAME')} *</label><input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.last_name', 'LAST NAME')} *</label><input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={labelStyle}>{t('booking.email', 'EMAIL ADDRESS')} *</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.phone', 'PHONE NUMBER')} *</label><input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} /></div>
              </div>
              
              {/* CAMPOS RESTAURADOS: street1 y airlineInfo */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={labelStyle}>{t('booking.street', 'STREET ADDRESS')} *</label><input name="street1" value={formData.street1} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.airline', 'AIRLINE / FLIGHT')}</label><input name="airlineInfo" value={formData.airlineInfo} onChange={handleChange} style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={labelStyle}>{t('booking.city', 'CITY')} *</label><input name="city" value={formData.city} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.state', 'STATE')} *</label><input name="state" value={formData.state} onChange={handleChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>{t('booking.zip', 'ZIP')} *</label><input name="zip" value={formData.zip} onChange={handleChange} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div><label style={labelStyle}>{t('booking.country', 'COUNTRY')} *</label><select name="country" value={formData.country} onChange={handleChange} style={{ ...inputStyle, background: '#111' }}>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={labelStyle}>{t('booking.birthday', 'BIRTHDAY')} *</label><input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={inputStyle} /></div>
              </div>
              
              <button 
                onClick={() => setStep(2)} 
                disabled={!isStep1Valid()} 
                style={{ width: '100%', padding: '18px', borderRadius: '15px', background: isStep1Valid() ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: isStep1Valid() ? '#000' : '#666', fontWeight: '800', border: 'none', cursor: 'pointer' }}
              >
                {t('common.continue', 'CONTINUE TO EXTRAS')}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>{t('booking.select_extras', 'SELECT EXTRAS')}</h2>
              {loadingCharges ? (
                <div style={{ color: 'var(--accent)', textAlign: 'center', padding: '40px' }}>{t('common.loading', 'Loading Extras...')}</div>
              ) : (
                <>
                  {categories.map(cat => (
                    <div key={cat.id} style={{ marginBottom: '30px' }}>
                      <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '15px', fontFamily: 'Bebas Neue' }}>{cat.label}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {charges.filter(c => c.additional_charge_category_id === cat.id).map(charge => (
                          <ExtraChargeCard key={charge.id} charge={charge} isSelected={!!selectedCharges[charge.id]} onToggle={() => toggleCharge(charge)} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '18px', borderRadius: '15px', background: 'transparent', border: '1px solid #444', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{t('common.back', 'BACK')}</button>
                    <button onClick={() => setStep(3)} style={{ flex: 2, padding: '18px', borderRadius: '15px', background: 'var(--accent)', color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer' }}>{t('common.continue_review', 'CONTINUE TO REVIEW')}</button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && ( <div style={{ color: '#fff' }}><h2>Paso 3: Revisión (En desarrollo)</h2><button onClick={() => setStep(2)}>Atrás</button></div> )}
          {step === 4 && ( <div style={{ color: '#fff' }}><h2>Paso 4: Pago</h2></div> )}
        </div>

        {/* COMPONENTE SUMMARY CON TODAS LAS PROPS PARA EDICIÓN Y BOTÓN */}
        <BookingSummary 
          selectedVehicle={selectedVehicle}
          booking={bookingDetails}
          pDate={pDate} pTime={pTime} rDate={rDate} rTime={rTime}
          selectedLocationName={selectedLocationName}
          isEditingLocation={isEditingLocation}
          setIsEditingLocation={setIsEditingLocation}
          tempLocationName={tempLocationName}
          setTempLocationName={setTempLocationName}
          locations={locations}
          onConfirmLocation={() => { if(tempLocationName) setSelectedLocationName(tempLocationName); setIsEditingLocation(false); }}
          selectedExtraCharges={Object.values(selectedCharges)}
          isEditingPickup={isEditingPickup} setIsEditingPickup={setIsEditingPickup}
          isEditingReturn={isEditingReturn} setIsEditingReturn={setIsEditingReturn}
          tempPDate={tempPDate} setTempPDate={setTempPDate}
          tempPTime={tempPTime} setTempPTime={setTempPTime}
          tempRDate={tempRDate} setTempRDate={setTempRDate}
          tempRTime={tempRTime} setTempRTime={setTempRTime}
          timeOptions={timeOptions}
          onConfirmPickup={() => { setPDate(tempPDate); setPTime(tempPTime); setIsEditingPickup(false); }}
          onConfirmReturn={() => { setRDate(tempRDate); setRTime(tempRTime); setIsEditingReturn(false); }}
          showContinueButton={step === 1 && isStep1Valid()} 
          onContinue={() => setStep(2)}
        />
      </div>
    </div>
  );
};

export default Booking;