import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroBanner from '../components/HeroBanner'

const useFadeIn = () => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)' } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

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
        const step = Math.ceil(num / 60)
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
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [location, setLocation] = useState('')
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const featuresRef     = useFadeIn()
  const categoriesRef   = useFadeIn()
  const testimonialsRef = useFadeIn()
  const searchRef       = useFadeIn()
  const statsRef        = useFadeIn()
  const ctaRef          = useFadeIn()

  /* Arrays DENTRO del componente para que t() reaccione al cambio de idioma */
  const FEATURES = [
    { icon: '⚡',  title: t('home.feature_1_title'), desc: t('home.feature_1_desc') },
    { icon: '🛡️', title: t('home.feature_2_title'), desc: t('home.feature_2_desc') },
    { icon: '📍',  title: t('home.feature_3_title'), desc: t('home.feature_3_desc') },
    { icon: '🔧',  title: t('home.feature_4_title'), desc: t('home.feature_4_desc') },
  ]

  const CATEGORIES = [
    { emoji: '🏎️', name: t('home.cat_sport'),   count: 8,  color: '#FF4D4D' },
    { emoji: '🚙',  name: t('home.cat_suv'),     count: 15, color: '#FF8C00' },
    { emoji: '🚗',  name: t('home.cat_sedan'),   count: 12, color: '#00C9A7' },
    { emoji: '🚐',  name: t('home.cat_minivan'), count: 6,  color: '#6C63FF' },
  ]

  const TESTIMONIALS = [
    { name: t('home.test_1_name'), role: t('home.test_1_role'), text: t('home.test_1_text'), rating: 5 },
    { name: t('home.test_2_name'), role: t('home.test_2_role'), text: t('home.test_2_text'), rating: 5 },
    { name: t('home.test_3_name'), role: t('home.test_3_role'), text: t('home.test_3_text'), rating: 5 },
  ]

  const STATS = [
    { icon: '🚗', target: '50',   suffix: '+',  label: t('home.stat_vehicles') },
    { icon: '⭐', target: '49',   suffix: '/5', label: t('home.stat_rating')   },
    { icon: '👥', target: '1000', suffix: '+',  label: t('home.stat_clients')  },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/fleet?startDate=${pickupDate}&endDate=${returnDate}&location=${location}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .fade-section { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .feature-card { background: var(--glass-bg, rgba(255,255,255,0.06)); border: 1px solid var(--glass-border, rgba(255,255,255,0.12)); border-radius: 20px; padding: 32px 28px; backdrop-filter: blur(20px); transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); border-color: var(--accent, #FF4D4D); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .category-card { border-radius: 20px; padding: 28px 20px; text-align: center; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .category-card:hover { transform: translateY(-6px) scale(1.02); }
        .search-input { width: 100%; padding: 14px 16px; background: var(--input-bg, rgba(0,0,0,0.3)); border: 1px solid var(--glass-border, rgba(255,255,255,0.15)); border-radius: 12px; color: var(--text-primary, #fff); font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .search-input:focus { border-color: var(--accent, #FF4D4D); }
        .search-input::placeholder { color: rgba(255,255,255,0.35); }
        .search-btn { width: 100%; padding: 16px; background: var(--btn-primary-bg, linear-gradient(135deg,#FF4D4D,#FF8C00)); border: none; color: #fff; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s; font-family: inherit; }
        .search-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,77,77,0.4); }
        .testimonial-dot { width: 8px; height: 8px; border-radius: 50%; cursor: pointer; transition: all 0.3s; border: none; padding: 0; }
        .cta-btn { padding: 18px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; letter-spacing: 1px; font-family: inherit; }
        @media (max-width: 768px) { .grid-3 { grid-template-columns: 1fr !important; } .grid-4 { grid-template-columns: repeat(2,1fr) !important; } .cta-btns { flex-direction: column !important; } }
      `}</style>

      {/* ══ HERO BANNER ══ */}
      <HeroBanner />

      {/* ══ SEARCH FORM ══ */}
      <section style={{ padding: '0 2rem', marginTop: '-150px', position: 'relative', zIndex: 10 }}>
        <div ref={searchRef} className="fade-section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ background: 'var(--glass-bg, rgba(10,20,40,0.85))', border: '1px solid var(--glass-border, rgba(255,255,255,0.15))', borderTop: '1px solid rgba(255,255,255,0.25)', borderRadius: '24px', backdropFilter: 'blur(32px)', padding: '36px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <h2 style={{ color: 'var(--text-primary,#fff)', fontSize: '16px', fontWeight: '500', margin: '0 0 24px', letterSpacing: '0.5px' }}>
              🔍 {t('home.search_title')}
            </h2>
            <form onSubmit={handleSearch}>
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary,rgba(255,255,255,0.5))', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    📍 {t('home.pickup_location')}
                  </label>
                  <input className="search-input" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t('home.pickup_location_placeholder')} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary,rgba(255,255,255,0.5))', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    📅 {t('home.pickup_date')}
                  </label>
                  <input className="search-input" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={today} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary,rgba(255,255,255,0.5))', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    🔁 {t('home.return_date')}
                  </label>
                  <input className="search-input" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} min={pickupDate || today} />
                </div>
              </div>
              <button type="submit" className="search-btn">{t('home.search_btn')} →</button>
            </form>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: '48px 2rem 0' }}>
        <div ref={statsRef} className="fade-section" style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: 'var(--glass-bg,rgba(255,255,255,0.05))', border: '1px solid var(--glass-border,rgba(255,255,255,0.1))', borderRadius: '16px', backdropFilter: 'blur(20px)', padding: '28px 20px', textAlign: 'center', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent,#FF4D4D)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border,rgba(255,255,255,0.1))'}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '36px', color: 'var(--accent,#FF4D4D)', letterSpacing: '2px' }}>
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: 'var(--text-secondary,rgba(255,255,255,0.5))', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <section style={{ padding: '80px 2rem' }}>
        <div ref={categoriesRef} className="fade-section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: 'var(--accent,#FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
              {t('home.categories_badge')}
            </p>
            <h2 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(32px,6vw,52px)', color: 'var(--text-primary,#fff)', letterSpacing: '3px', margin: 0 }}>
              {t('home.categories_title')}
            </h2>
          </div>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="category-card" onClick={() => navigate('/fleet')}
                style={{ background: `linear-gradient(135deg,${cat.color}22,${cat.color}11)`, border: `1px solid ${cat.color}44` }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.emoji}</div>
                <div style={{ color: 'var(--text-primary,#fff)', fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>{cat.name}</div>
                <div style={{ color: cat.color, fontSize: '13px', fontWeight: '500' }}>{cat.count} {t('home.cat_vehicles')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: '0 2rem 80px' }}>
        <div ref={featuresRef} className="fade-section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: 'var(--accent,#FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
              {t('home.features_badge')}
            </p>
            <h2 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(32px,6vw,52px)', color: 'var(--text-primary,#fff)', letterSpacing: '3px', margin: 0 }}>
              {t('home.features_title')}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ color: 'var(--text-primary,#fff)', fontWeight: '600', fontSize: '17px', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary,rgba(255,255,255,0.55))', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding: '0 2rem 80px' }}>
        <div ref={testimonialsRef} className="fade-section" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent,#FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            {t('home.testimonials_badge')}
          </p>
          <h2 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(32px,5vw,52px)', color: 'var(--text-primary,#fff)', letterSpacing: '3px', marginBottom: '40px' }}>
            {t('home.testimonials_title')}
          </h2>
          <div style={{ background: 'var(--glass-bg,rgba(255,255,255,0.05))', border: '1px solid var(--glass-border,rgba(255,255,255,0.1))', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '20px' }}>{'⭐'.repeat(TESTIMONIALS[activeTestimonial].rating)}</div>
            <p style={{ color: 'var(--text-primary,#fff)', fontSize: '17px', lineHeight: 1.8, margin: '0 0 24px', fontStyle: 'italic' }}>
              "{TESTIMONIALS[activeTestimonial].text}"
            </p>
            <div style={{ color: 'var(--text-primary,#fff)', fontWeight: '600', marginBottom: '2px' }}>{TESTIMONIALS[activeTestimonial].name}</div>
            <div style={{ color: 'var(--accent,#FF4D4D)', fontSize: '13px' }}>{TESTIMONIALS[activeTestimonial].role}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className="testimonial-dot" onClick={() => setActiveTestimonial(i)}
                style={{ background: i === activeTestimonial ? 'var(--accent,#FF4D4D)' : 'rgba(255,255,255,0.2)', width: i === activeTestimonial ? '28px' : '8px' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '0 2rem 100px' }}>
        <div ref={ctaRef} className="fade-section" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(255,77,77,0.2),rgba(108,99,255,0.15))', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '32px', padding: 'clamp(40px,8vw,72px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: '#FF7A7A', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>
              {t('home.cta_badge')}
            </p>
            <h2 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(36px,7vw,64px)', color: 'var(--text-primary,#fff)', letterSpacing: '4px', margin: '0 0 16px', lineHeight: 1 }}>
              {t('home.cta_title')}
            </h2>
            <p style={{ color: 'var(--text-secondary,rgba(255,255,255,0.6))', fontSize: '16px', margin: '0 auto 40px', maxWidth: '480px', lineHeight: 1.7 }}>
              {t('home.cta_subtitle')}
            </p>
            <div className="cta-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="cta-btn" onClick={() => navigate('/fleet')} style={{ background: 'linear-gradient(135deg,#FF4D4D,#FF8C00)', border: 'none', color: '#fff', boxShadow: '0 8px 32px rgba(255,77,77,0.4)' }}>
                {t('home.cta_btn_primary')}
              </button>
              <button className="cta-btn" onClick={() => navigate('/fleet')} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', color: 'var(--text-primary,#fff)' }}>
                {t('home.cta_btn_secondary')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
