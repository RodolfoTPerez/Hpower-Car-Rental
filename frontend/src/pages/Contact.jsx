import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const contactInfo = [
    { icon: '📍', label: t('contact.info_address_label'), value: t('contact.info_address_value'), sub: t('contact.info_address_sub') },
    { icon: '📞', label: t('contact.info_phone_label'),   value: t('contact.info_phone_value'),   sub: t('contact.info_phone_sub')   },
    { icon: '✉️', label: t('contact.info_email_label'),   value: t('contact.info_email_value'),   sub: t('contact.info_email_sub')   },
    { icon: '⏰', label: t('contact.info_hours_label'),   value: t('contact.info_hours_value'),   sub: t('contact.info_hours_sub')   },
  ]

  const socialLinks = [
    { icon: '📘', name: 'Facebook',   color: '#1877F2' },
    { icon: '📸', name: 'Instagram',  color: '#E1306C' },
    { icon: '🐦', name: 'Twitter/X',  color: '#1DA1F2' },
    { icon: '▶️', name: 'YouTube',    color: '#FF0000' },
  ]

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--input-bg, rgba(0,0,0,0.3))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    color: 'var(--text-primary, #fff)',
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block',
    color: 'var(--text-secondary, rgba(255,255,255,0.5))',
    fontSize: '11px', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '1.5px',
  }

  return (
    <div style={{ minHeight: '100vh', padding: '100px 2rem 4rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        .contact-input:focus { border-color: var(--accent, #FF4D4D) !important; }
        .contact-card { background: var(--glass-bg, rgba(255,255,255,0.05)); border: 1px solid var(--glass-border, rgba(255,255,255,0.1)); border-radius: 20px; backdrop-filter: blur(20px); transition: transform 0.3s, border-color 0.3s; }
        .contact-card:hover { transform: translateY(-4px); border-color: rgba(255,77,77,0.4); }
        .send-btn { width: 100%; padding: 16px; background: linear-gradient(135deg,#FF4D4D,#FF8C00); border: none; color: #fff; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 1.5px; text-transform: uppercase; transition: all 0.3s; font-family: inherit; }
        .send-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,77,77,0.4); }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 768px) { .contact-layout { grid-template-columns: 1fr !important; } .info-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ color: 'var(--accent, #FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t('contact.badge')}
          </p>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 8vw, 80px)', color: 'var(--text-primary, #fff)', letterSpacing: '4px', margin: '0 0 16px' }}>
            {t('contact.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', fontSize: '17px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.8 }}>
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Info Cards */}
        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {contactInfo.map((c, i) => (
            <div key={i} className="contact-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{c.icon}</div>
              <div style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>{c.label}</div>
              <div style={{ color: 'var(--text-primary, #fff)', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{c.value}</div>
              <div style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))', fontSize: '11px' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

          {/* Form */}
          <div className="contact-card" style={{ padding: '36px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: 'var(--text-primary, #fff)', letterSpacing: '2px', margin: '0 0 28px' }}>
              {t('contact.form_title')}
            </h2>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '20px', marginBottom: '12px' }}>
                  {t('contact.success_title')}
                </h3>
                <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', lineHeight: 1.7 }}>
                  {t('contact.success_text')}
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                  style={{ marginTop: '24px', padding: '12px 32px', background: 'transparent', border: '1px solid rgba(255,77,77,0.5)', color: 'var(--accent, #FF4D4D)', borderRadius: '50px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
                >
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>{t('contact.name')} *</label>
                    <input className="contact-input" style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder={t('contact.name_placeholder')} required />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.phone')}</label>
                    <input className="contact-input" style={inputStyle} name="phone" value={form.phone} onChange={handleChange} placeholder={t('contact.phone_placeholder')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t('contact.email')} *</label>
                  <input className="contact-input" style={inputStyle} type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('contact.email_placeholder')} required />
                </div>
                <div>
                  <label style={labelStyle}>{t('contact.subject')}</label>
                  <select className="contact-input" style={{ ...inputStyle, cursor: 'pointer' }} name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">{t('contact.subject_placeholder')}</option>
                    <option value="reserva">{t('contact.subject_reservation')}</option>
                    <option value="precio">{t('contact.subject_price')}</option>
                    <option value="soporte">{t('contact.subject_support')}</option>
                    <option value="factura">{t('contact.subject_billing')}</option>
                    <option value="otro">{t('contact.subject_other')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('contact.message')} *</label>
                  <textarea className="contact-input" style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} name="message" value={form.message} onChange={handleChange} placeholder={t('contact.message_placeholder')} required />
                </div>
                <button type="submit" className="send-btn" disabled={loading}>
                  {loading ? `⏳ ${t('contact.sending')}` : `✉️ ${t('contact.send_btn')}`}
                </button>
              </form>
            )}
          </div>

          {/* Map + Social */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Map */}
            <div className="contact-card" style={{ flex: 1, minHeight: '280px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,46,80,0.9), rgba(15,30,55,0.95))' }} />
              <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="100%" height="100%">
                <defs>
                  <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5A8ACA" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                <div style={{ color: 'var(--text-primary, #fff)', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                  {t('contact.map_title')}
                </div>
                <div style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))', fontSize: '13px', marginBottom: '20px' }}>
                  {t('contact.map_sub')}
                </div>
                
                <a href="https://www.google.com/maps/search/?api=1&query=3947+NW+26th+St+Miami+FL+33142" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '10px 24px', background: 'rgba(255,77,77,0.2)', border: '1px solid rgba(255,77,77,0.4)', color: '#FF7A7A', borderRadius: '50px', fontSize: '13px', textDecoration: 'none' }}>
                  {t('contact.map_btn')} →
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="contact-card" style={{ padding: '24px' }}>
              <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
                {t('contact.follow')}
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {socialLinks.map((s, i) => (
                  <button key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: '50px', color: 'var(--text-primary, #fff)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${s.color}30`; e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${s.color}18`; e.currentTarget.style.transform = 'none' }}
                  >
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(37,211,102,0.05))', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '36px' }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary, #fff)', fontWeight: '600', marginBottom: '4px' }}>
                  {t('contact.whatsapp_title')}
                </div>
                <div style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))', fontSize: '13px' }}>
                  {t('contact.whatsapp_sub')}
                </div>
              </div>
              <button style={{ padding: '10px 20px', background: '#25D366', border: 'none', color: '#fff', borderRadius: '50px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {t('contact.whatsapp_btn')}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
