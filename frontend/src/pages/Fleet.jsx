import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import VehicleCard from '../components/VehicleCard'
import BookingSummary from '../components/BookingSummary'

const Fleet = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationIdFromUrl = searchParams.get('location');
  const categoryFromUrl = searchParams.get('category');

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(locationIdFromUrl || ''); 
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [isFromSearch] = useState(!!locationIdFromUrl);

  const [pDate, setPDate] = useState(searchParams.get('start') || '');
  const [rDate, setRDate] = useState(searchParams.get('end') || '');
  const [pTime, setPTime] = useState(searchParams.get('startTime') || '10:00');
  const [rTime, setRTime] = useState(searchParams.get('endTime') || '10:00');
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingReturn, setIsEditingReturn] = useState(false);

  const [tempPDate, setTempPDate] = useState(pDate);
  const [tempRDate, setTempRDate] = useState(rDate);
  const [tempPTime, setTempPTime] = useState(pTime);
  const [tempRTime, setTempRTime] = useState(rTime);

  // Generar opciones de hora cada 30 minutos
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      timeOptions.push(`${hh}:${mm}`);
    }
  }

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get('/locations')
      setLocations(res.data.data || [])
    } catch (err) {
      console.error('Error cargando ubicaciones:', err)
    }
  }, [])

  const fetchCategories = useCallback(async (locId) => {
    try {
      const res = await api.get(`/categories?location_id=${locId}`)
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Error cargando categorías:', err)
    }
  }, [])

  const fetchVehicles = useCallback(async (locId, catId = '', forceLoading = false) => {
    if (forceLoading) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (locId) params.append('location_id', locId)
      if (catId) params.append('category_id', catId)
      if (pDate) params.append('start', pDate)
      if (rDate) params.append('end', rDate)
      if (pTime) params.append('start_time', pTime)
      if (rTime) params.append('end_time', rTime)
      const res = await api.get(`/vehicles?${params.toString()}`)
      if (res.data.selected_location_name) {
        setSelectedLocationName(res.data.selected_location_name);
      }
      setVehicles(res.data.data || [])
    } catch (err) {
      console.error('Error cargando vehículos:', err)
    } finally {
      setLoading(false)
    }
  }, [pDate, rDate, pTime, rTime])

  useEffect(() => { fetchLocations(); }, [fetchLocations]);
  useEffect(() => {
    if (locationIdFromUrl) setSelectedLocation(locationIdFromUrl);
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [locationIdFromUrl, categoryFromUrl]);

  useEffect(() => {
    if (selectedLocation) {
      fetchCategories(selectedLocation)
      fetchVehicles(selectedLocation, selectedCategory)
      const loc = locations.find(l => String(l.id) === String(selectedLocation));
      if (loc) setSelectedLocationName(loc.name);
    }
  }, [selectedLocation, locations, categoryFromUrl, selectedCategory, fetchCategories, fetchVehicles])

  const handleLocation = (locId) => {
    setSelectedLocation(locId)
    setSelectedCategory('') 
    fetchVehicles(locId, '', true)
  }

  const handleCategory = (catId) => {
    setSelectedCategory(catId)
    fetchVehicles(selectedLocation, catId)
  }

  const calculateBooking = () => {
    if (!pDate || !pTime || !rDate || !rTime || !selectedVehicle) return null;
    const start = new Date(`${pDate}T${pTime || '00:00'}`);
    const end = new Date(`${rDate}T${rTime || '00:00'}`);
    const diffMs = end - start;
    const dailyRate = Number(selectedVehicle.current_rate?.daily_rate || selectedVehicle.base_price_per_day || 0);

    if (isNaN(diffMs) || diffMs <= 0) return { 
      days: 1, hours: 0, dailyRate, hourlyRate: dailyRate / 24, subtotalDays: dailyRate, subtotalHours: 0, total: dailyRate,
      category: selectedVehicle.vehicle_categories?.name || t('vehicles.category')
    };

    const totalHours = diffMs / (1000 * 60 * 60);
    let days = Math.floor(totalHours / 24);
    let hours = Math.round(totalHours % 24);
    if (days === 0 && totalHours > 0) { days = 1; hours = 0; }
    const hourlyRate = dailyRate / 24;
    const subtotalDays = days * dailyRate;
    const subtotalHours = hours * hourlyRate;
    const total = subtotalDays + subtotalHours;
    return { days, hours, dailyRate, hourlyRate, subtotalDays, subtotalHours, total, category: selectedVehicle.vehicle_categories?.name || t('vehicles.category') };
  }

  const booking = calculateBooking();

  const btnStyle = (active) => ({
    padding: '8px 20px', borderRadius: '20px', border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'var(--btn-primary-bg)' : 'var(--glass-bg)', color: active ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '400', backdropFilter: 'blur(8px)', transition: 'all 0.2s', fontFamily: 'inherit',
  })

  const labelStyle = { color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', display: 'block', }

  const filterBoxStyle = { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', backdropFilter: 'blur(16px)', }

  return (
    <div style={{ minHeight: '100vh', padding: '130px 4% 5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '60px' }}>
        <div style={{ flex: '1', maxWidth: '1000px' }}>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: 'var(--accent)', marginBottom: '32px', letterSpacing: '3px' }}>
            {t('vehicles.title')} {selectedLocationName ? `| ${selectedLocationName}` : ''}
          </h1>

          {!isFromSearch && (
            <div style={filterBoxStyle}>
              <span style={labelStyle}>📍 {t('vehicles.filter_by_location')}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {locations.map(loc => (
                  <button key={loc.id} onClick={() => handleLocation(String(loc.id))} style={btnStyle(selectedLocation === String(loc.id))}>{loc.name}</button>
                ))}
              </div>
            </div>
          )}

          {selectedLocation && categories.length > 0 && (
            <div style={{ ...filterBoxStyle, marginBottom: '32px' }}>
              <span style={labelStyle}>🚗 {t('vehicles.filter_by_category')}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handleCategory('')} style={btnStyle(selectedCategory === '')}>{t('vehicles.all_categories')}</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => handleCategory(cat.id)} style={btnStyle(selectedCategory === cat.id)}>{cat.name}</button>
                ))}
              </div>
            </div>
          )}

          {!selectedLocation ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', backdropFilter: 'blur(16px)', }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>📍</div>
              <p style={{ fontSize: '16px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>{t('vehicles.select_location')}</p>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '220px', background: 'var(--glass-bg)', borderRadius: '16px', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{vehicles.length} {t('vehicles.title').toLowerCase()}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {vehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} layout="horizontal" onSelect={(v) => setSelectedVehicle(v)} isSelected={selectedVehicle?.id === vehicle.id} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', backdropFilter: 'blur(16px)', }}>
              <p style={{ fontSize: '48px' }}>🚗</p>
              <p>{t('vehicles.no_vehicles')}</p>
            </div>
          )}
        </div>

        <BookingSummary 
          selectedVehicle={selectedVehicle}
          booking={booking}
          pDate={pDate}
          pTime={pTime}
          rDate={rDate}
          rTime={rTime}
          selectedLocationName={selectedLocationName}
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
              alert(t('errors.invalid_dates', 'La fecha de devolución debe posterior a la de recogida'));
              return;
            }
            setRDate(tempRDate); 
            setRTime(tempRTime); 
            setIsEditingReturn(false); 
          }}
          showContinueButton={true}
          onContinue={() => navigate('/booking', { 
            state: { 
              selectedVehicle, 
              bookingDetails: { ...booking, pDate, pTime, rDate, rTime, selectedLocationName, selectedLocationId: selectedLocation } 
            } 
          })}
        />
      </div>
    </div>
  )
}

export default Fleet;