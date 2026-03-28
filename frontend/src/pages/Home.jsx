import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroBanner from '../components/HeroBanner'

// --- HOOK DE ANIMACIÓN FADE IN (INTACTO) ---
const useFadeIn = () => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

// --- COMPONENTE CONTADOR ANIMADO (INTACTO) ---
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const num = parseInt(target)
        if (isNaN(num)) return
        const step = Math.ceil(num / 60) || 1
        let cur = 0
        const timer = setInterval(() => {
          cur = Math.min(cur + step, num)
          setCount(cur)
          if (cur >= num) clearInterval(timer)
        }, 25)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // ESTADOS (INICIALIZADOS EN BLANCO)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [location, setLocation] = useState('') 
  const [returnLocation, setReturnLocation] = useState('') 
  const [availableLocations, setAvailableLocations] = useState([]) 
  const [fleetStats, setFleetStats] = useState({ total: 0, sedan: 0, suv: 0, van: 0 })
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  // Opciones de hora cada 30 minutos
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      timeOptions.push(`${hh}:${mm}`);
    }
  }

  // REFS DE ANIMACIÓN
  const searchRef = useFadeIn()
  const statsRef = useFadeIn()
  const categoriesRef = useFadeIn()
  const featuresRef = useFadeIn()
  const testimonialsRef = useFadeIn()
  const ctaRef = useFadeIn()

  // 1. CARGAR LOCATIONS
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/locations')
        const result = await res.json()
        if (result.success && result.data.length > 0) {
          setAvailableLocations(result.data)
          // No pre-seleccionamos ninguna ubicación para dejar el panel en blanco
        }
      } catch (e) { console.error("Error cargando sedes:", e) }
    }
    loadLocations()
  }, [])

  // 2. CARGAR CONTADORES
  const fetchStats = useCallback(async (locId) => {
    if (!locId) return
    try {
      const res = await fetch(`http://localhost:3000/api/v1/fleet/counters?location_id=${locId}`)
      const data = await res.json()
      if (data.success) setFleetStats(data.stats)
    } catch (err) { console.error("Error fetch stats:", err) }
  }, [])

  useEffect(() => {
    fetchStats(location)
  }, [location, fetchStats])

  // LÓGICA DE BÚSQUEDA (MEJORADA PARA SER EXPLÍCITA)
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!location) return; 

    // Validación de fechas
    if (pickupDate && returnDate && pickupTime && returnTime) {
      const start = new Date(`${pickupDate}T${pickupTime}`);
      const end = new Date(`${returnDate}T${returnTime}`);
      if (start >= end) {
        alert(t('errors.invalid_dates', 'La fecha de recogida debe ser anterior a la de devolución'));
        return;
      }
    }
    
    // Navegamos con los parámetros a Fleet
    navigate(`/fleet?location=${location}&returnLocation=${returnLocation}&start=${pickupDate}&startTime=${pickupTime}&end=${returnDate}&endTime=${returnTime}`);
  }

  // NUEVA FUNCIÓN: Navegar por categoría respetando la ubicación seleccionada
// NUEVA FUNCIÓN: Navegar por categoría respetando la ubicación seleccionada
  const handleCategoryClick = (categoryName) => {
    let catParam = '';
    const name = categoryName.toLowerCase();

    // Mapeo para que el filtro de categoría también viaje en la URL
    if (name.includes('suv')) catParam = 'suv';
    else if (name.includes('sedan')) catParam = 'sedan';
    else if (name.includes('van') || name.includes('7 passenger')) catParam = 'van';

    // Ahora SÍ usamos catParam en la URL
    const url = `/fleet?location=${location}${catParam ? `&category=${catParam}` : ''}`;
    navigate(url);
  }

  const FEATURES = [
    { icon: '⚡', title: t('home.feature_1_title'), desc: t('home.feature_1_desc') },
    { icon: '🛡️', title: t('home.feature_2_title'), desc: t('home.feature_2_desc') },
    { icon: '📍', title: t('home.feature_3_title'), desc: t('home.feature_3_desc') },
    { icon: '🔧', title: t('home.feature_4_title'), desc: t('home.feature_4_desc') },
  ]

  const CATEGORIES = [
    { emoji: '🚙', name: t('home.cat_suv'), count: fleetStats.suv, color: '#FF8C00' },
    { emoji: '🚗', name: t('home.cat_sedan'), count: fleetStats.sedan, color: '#00C9A7' },
    { emoji: '🚐', name: t('home.cat_minivan'), count: fleetStats.van, color: '#6C63FF' },
    { emoji: '🏎️', name: t('home.cat_sport'), count: 8, color: '#FF4D4D' },
  ]

  const TESTIMONIALS = [
    { name: t('home.test_1_name'), role: t('home.test_1_role'), text: t('home.test_1_text') },
    { name: t('home.test_2_name'), role: t('home.test_2_role'), text: t('home.test_2_text') },
    { name: t('home.test_3_name'), role: t('home.test_3_role'), text: t('home.test_3_text') },
  ]

  const STATS_UI = [
    { icon: '🚗', target: fleetStats.total.toString(), suffix: '+', label: t('home.stat_vehicles') },
    { icon: '⭐', target: '49', suffix: '/5', label: t('home.stat_rating') },
    { icon: '👥', target: '1000', suffix: '+', label: t('home.stat_clients') },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [TESTIMONIALS.length])

  const today = new Date().toISOString().split('T')[0]
  
  // VALIDACIÓN DE FORMULARIO COMPLETO
  const isFormComplete = location && returnLocation && pickupDate && returnDate && pickupTime && returnTime;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.3s ease' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
        .fade-section { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .feature-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 40px; backdrop-filter: blur(10px); color: var(--text-primary); }
        .search-input { width: 100%; padding: 15px; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); outline: none; transition: 0.3s; }
        .search-input:focus { border-color: var(--accent); }
        .search-input option { background: var(--navbar-bg); color: var(--text-primary); }
        .category-card { border-radius: 20px; padding: 30px; text-align: center; cursor: pointer; transition: 0.3s; border: 1px solid var(--glass-border); color: var(--text-primary); }
        .category-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); border-color: var(--accent); }
      `}</style>

      <HeroBanner />

      {/* BUSCADOR */}
      <section style={{ padding: '0 2rem', marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <div ref={searchRef} className="fade-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ background: 'var(--navbar-bg)', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', alignItems: 'end' }}>
              {/* FILA 1: PICKUP */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 {t('home.pickup_location')}</label>
                <select className="search-input" value={location} onChange={e => {
                  setLocation(e.target.value);
                  setReturnLocation(e.target.value);
                }}>
                  <option value="" disabled>{t('home.select_location_placeholder', 'Selecciona Sede')}</option>
                  {availableLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.city || loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>📅 {t('home.pickup_date')}</label>
                <input className="search-input" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={today} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>🕒 {t('home.pickup_time')}</label>
                <select className="search-input" value={pickupTime} onChange={e => setPickupTime(e.target.value)}>
                  <option value="" disabled>{t('home.select_time_placeholder', 'Hora')}</option>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* FILA 2: RETURN */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏁 {t('home.return_location')}</label>
                <select 
                  className="search-input" 
                  value={returnLocation} 
                  disabled // Bloqueado según requerimiento: siempre igual al pickup
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                >
                  <option value="" disabled>{t('home.select_location_placeholder', 'Selecciona Sede')}</option>
                  {availableLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.city || loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>📅 {t('home.return_date')}</label>
                <input className="search-input" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} min={pickupDate || today} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>🕒 {t('home.return_time')}</label>
                  <select className="search-input" value={returnTime} onChange={e => setReturnTime(e.target.value)}>
                    <option value="" disabled>{t('home.select_time_placeholder', 'Hora')}</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={!isFormComplete}
                  style={{ 
                    padding: '15px 5px', 
                    background: isFormComplete ? 'linear-gradient(135deg,#FF4D4D,#FF8C00)' : 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    color: isFormComplete ? '#fff' : 'rgba(255,255,255,0.3)', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: isFormComplete ? 'pointer' : 'not-allowed', 
                    height: '52px',
                    width: '100%',
                    alignSelf: 'end',
                    boxShadow: isFormComplete ? '0 10px 20px rgba(255, 77, 77, 0.3)' : 'none',
                    fontSize: '12px',
                    transition: '0.3s'
                  }}
                >
                  {t('home.search_btn').toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="fade-section" style={{ padding: '80px 2rem 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '30px' }}>
          {STATS_UI.map((s, i) => (
            <div key={i} className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '48px', fontFamily: 'Bebas Neue', color: 'var(--accent)' }}>
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS (AJUSTADAS PARA NAVEGAR CON LOCATION) */}
      <section ref={categoriesRef} className="fade-section" style={{ padding: '60px 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '50px', marginBottom: '40px', textAlign: 'center' }}>{t('home.categories_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {CATEGORIES.map((cat, i) => (
              <div 
                key={i} 
                className="category-card" 
                onClick={() => handleCategoryClick(cat.name)} // <--- AHORA USA LA FUNCIÓN CON LOCATION
                style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
              >
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>{cat.emoji}</div>
                <h3 style={{ margin: '0', fontSize: '20px' }}>{cat.name}</h3>
                <p style={{ color: cat.color, fontWeight: 'bold', marginTop: '10px' }}>{cat.count} {t('home.cat_vehicles')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES (INTACTO) */}
      <section ref={featuresRef} className="fade-section" style={{ padding: '60px 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>{f.title}</h3>
              <p style={{ color: '#aaa', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS (INTACTO) */}
      <section ref={testimonialsRef} className="fade-section" style={{ padding: '60px 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'var(--glass-bg)', padding: '60px', borderRadius: '40px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '20px' }}>"</div>
          <p style={{ fontSize: '20px', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '30px', color: 'var(--text-primary)' }}>{TESTIMONIALS[activeTestimonial].text}</p>
          <h4 style={{ margin: '0', color: 'var(--accent)' }}>{TESTIMONIALS[activeTestimonial].name}</h4>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="fade-section" style={{ padding: '100px 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'var(--navbar-bg)', padding: '80px', borderRadius: '40px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '60px', marginBottom: '20px', color: 'var(--text-primary)' }}>{t('home.cta_title')}</h2>
          <button 
            onClick={handleSearch} // Navega a la flota con la ubicación actual
            style={{ padding: '20px 60px', borderRadius: '50px', background: 'var(--accent)', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', transition: '0.3s' }}
          >
            {t('home.cta_btn_primary')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home