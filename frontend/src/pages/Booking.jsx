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

  // Step 2 State (Charges)
  const [categories, setCategories] = useState([]);
  const [charges, setCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState({}); // { chargeId: rawChargeObject }
  const [loadingCharges, setLoadingCharges] = useState(false);

  // State for internal summary editing (mirroring Fleet.jsx)
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

  useEffect(() => {
    if (!selectedVehicle) {
      navigate('/fleet');
    }
  }, [selectedVehicle, navigate]);

  // Dynamically calculate days/hours/totals so they aren't lost if State gets messy
  const calculateTotal = () => {
    if (!pDate || !rDate || !pTime || !rTime || !selectedVehicle) return bookingDetails;

    const start = new Date(`${pDate}T${pTime}`);
    const end = new Date(`${rDate}T${rTime}`);
    const diffMs = end - start;

    if (diffMs <= 0) return bookingDetails;

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = diffMs / msPerDay;

    let days = Math.floor(diffDays);
    const remainder = diffDays - days;
    let hours = Math.round(remainder * 24);

    if (hours === 24) { days += 1; hours = 0; }

    const dailyRate = Number(selectedVehicle.current_rate?.daily_rate || selectedVehicle.base_price_per_day || 0);
    const subtotalDays = days * dailyRate;
    const subtotalHours = hours * (dailyRate / 24);
    const total = subtotalDays + subtotalHours;

    return {
      ...bookingDetails, // preserves location names and ids
      days,
      hours,
      dailyRate,
      subtotalDays,
      subtotalHours,
      total,
      category: selectedVehicle.category_name
    };
  };

  const currentBooking = calculateTotal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'city', 'state', 'zip', 'country', 'birthday'];
    return required.every(field => formData[field]?.trim() !== '');
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: '0.3s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const sectionHeaderStyle = {
    fontFamily: 'Bebas Neue',
    fontSize: '24px',
    color: 'var(--accent)',
    marginBottom: '20px',
    letterSpacing: '1px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '10px'
  };

  const loadCharges = async () => {
    if (!bookingDetails?.selectedLocationId) return;
    try {
      setLoadingCharges(true);
      const res = await api.get(`/charges?location_id=${bookingDetails.selectedLocationId}`);
      if (res.data.success) {
        setCategories(res.data.data.categories);
        setCharges(res.data.data.charges);
      }
    } catch(e) {
      console.error('Error fetching charges:', e);
    } finally {
      setLoadingCharges(false);
    }
  };

  useEffect(() => {
    if (step === 2 && charges.length === 0) {
      loadCharges();
    }
  }, [step]);

  const toggleCharge = (charge) => {
    setSelectedCharges(prev => {
      const next = { ...prev };
      if (next[charge.id]) delete next[charge.id];
      else next[charge.id] = charge;
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '130px 4% 5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '60px' }}>
        
        {/* MAIN FORM AREA */}
        <div style={{ 
          flex: '1',
          maxWidth: '1000px',
          background: 'var(--navbar-bg)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '30px', 
          padding: '40px',
          backdropFilter: 'blur(20px)'
        }}>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '4px', background: step >= 1 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: step >= 1 ? 'var(--accent)' : '#666' }}>1. {t('booking.customer_info', 'CUSTOMER')}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '4px', background: step >= 2 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: step >= 2 ? 'var(--accent)' : '#666' }}>2. {t('booking.addons', 'ADD-ONS')}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '4px', background: step >= 3 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: step >= 3 ? 'var(--accent)' : '#666' }}>3. {t('booking.payment', 'PAYMENT')}</span>
            </div>
          </div>

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>{t('booking.customer_information', 'CUSTOMER INFORMATION')}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.first_name', 'FIRST NAME')} *</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} placeholder="John" />
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.last_name', 'LAST NAME')} *</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} placeholder="Doe" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.email', 'EMAIL ADDRESS')} *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="rtperez2017@gmail.com" />
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.phone', 'PHONE NUMBER')} *</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="+1 123 456 7890" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.other_email', 'OTHER EMAIL')}</label>
                  <input type="email" name="otherEmail" value={formData.otherEmail} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.other_phone', 'OTHER PHONE NUMBER')}</label>
                  <input name="otherPhone" value={formData.otherPhone} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={labelStyle}>{t('booking.street', 'STREET 1')}</label>
                <input name="street1" value={formData.street1} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={labelStyle}>{t('booking.airline_info', 'AIRLINE NAME, FLIGHT NUMBER, LANDING TIME')}</label>
                <input name="airlineInfo" value={formData.airlineInfo} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.city', 'CITY')} *</label>
                  <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.state', 'STATE')} *</label>
                  <input name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.zip', 'ZIP')} *</label>
                  <input name="zip" value={formData.zip} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div>
                  <label style={labelStyle}>{t('booking.country', 'COUNTRY')} *</label>
                  <select name="country" value={formData.country} onChange={handleChange} style={{ ...inputStyle, background: '#111' }}>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('booking.birthday', 'BIRTHDAY')} *</label>
                  <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <button 
                onClick={() => isStep1Valid() && setStep(2)}
                disabled={!isStep1Valid()}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '15px', 
                  background: isStep1Valid() ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                  color: isStep1Valid() ? '#000' : '#666',
                  fontWeight: '800', 
                  fontSize: '16px', 
                  cursor: isStep1Valid() ? 'pointer' : 'not-allowed',
                  border: 'none',
                  transition: '0.3s'
                }}
              >
                {t('common.continue', 'CONTINUE TO PAYMENT')}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h2 style={sectionHeaderStyle}>{t('booking.enhance_trip', 'ENHANCE YOUR TRIP')}</h2>
              
              {loadingCharges ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--accent)' }}>Cargando opcionales...</div>
              ) : (
                categories.map(cat => {
                  const catCharges = charges.filter(c => c.additional_charge_category_id === cat.id);
                  if (catCharges.length === 0) return null;

                  return (
                    <div key={cat.id} style={{ marginBottom: '40px' }}>
                      <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        {cat.label}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {catCharges.map(charge => (
                          <ExtraChargeCard 
                            key={charge.id} 
                            charge={charge} 
                            brandId={bookingDetails?.selectedLocationId?.toString() || '1'} 
                            isSelected={!!selectedCharges[charge.id]}
                            onToggle={toggleCharge}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                 <button onClick={() => setStep(1)} style={{ flex: 1, padding: '18px', borderRadius: '15px', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>VOLVER</button>
                 <button onClick={() => setStep(3)} style={{ flex: 2, padding: '18px', borderRadius: '15px', background: 'var(--accent)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>CONTINUAR A REVIEW</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', padding: '40px 0' }}>
               <h2 style={sectionHeaderStyle}>{t('booking.payment_method', 'REVIEW & PAYMENT')}</h2>
               <p style={{ color: '#888', marginBottom: '30px' }}>Próximamente... Aquí veremos el resumen final y el pago.</p>
               <button onClick={() => setStep(2)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px 30px', borderRadius: '10px', cursor: 'pointer' }}>VOLVER</button>
            </div>
          )}
        </div>

        {/* SUMMARY SIDEBAR - PERFECTLY ALIGNED */}
        <BookingSummary 
          selectedVehicle={selectedVehicle}
          booking={currentBooking} // Fixed: Always uses recalculated current summary
          pDate={pDate}
          pTime={pTime}
          rDate={rDate}
          rTime={rTime}
          selectedLocationName={bookingDetails?.selectedLocationName}
          isEditingPickup={isEditingPickup}
          setIsEditingPickup={setIsEditingPickup}
          isEditingReturn={isEditingReturn}
          setIsEditingReturn={setIsEditingReturn}
          tempPDate={tempPDate}
          setTempPDate={setTempPDate}
          tempPTime={tempPTime}
          setTempPTime={setTempPTime}
          tempRDate={tempRDate}
          setTempRDate={setTempRDate}
          tempRTime={tempRTime}
          setTempRTime={setTempRTime}
          timeOptions={timeOptions}
          selectedExtraCharges={Object.values(selectedCharges)} // Passing selected charges to summary
          onConfirmPickup={() => { 
            const start = new Date(`${tempPDate}T${tempPTime}`);
            const end = new Date(`${rDate}T${rTime}`);
            if (start >= end) {
              alert(t('errors.invalid_dates', 'La fecha de recogida debe ser anterior a la de devolución'));
              return;
            }
            setPDate(tempPDate); 
            setPTime(tempPTime); 
            setIsEditingPickup(false); 
          }}
          onConfirmReturn={() => { 
            const start = new Date(`${pDate}T${pTime}`);
            const end = new Date(`${tempRDate}T${tempRTime}`);
            if (end <= start) {
              alert(t('errors.invalid_dates', 'La fecha de devolución posterior a la de recogida'));
              return;
            }
            setRDate(tempRDate); 
            setRTime(tempRTime); 
            setIsEditingReturn(false); 
          }}
          showContinueButton={false} // Hidden in the booking page
        />
      </div>
    </div>
  );
};

export default Booking;
