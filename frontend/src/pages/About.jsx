import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const About = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const values = [
    { icon: '🎯', title: t('about.mission_title'), text: t('about.mission_text') },
    { icon: '🌟', title: t('about.vision_title'),  text: t('about.vision_text')  },
    { icon: '💎', title: t('about.values_title'),  text: t('about.values_text')  },
    { icon: '🌿', title: t('about.green_title'),   text: t('about.green_text')   },
  ]

  const milestones = [
    { year: '2010', text: t('about.milestone_2010') },
    { year: '2014', text: t('about.milestone_2014') },
    { year: '2018', text: t('about.milestone_2018') },
    { year: '2022', text: t('about.milestone_2022') },
    { year: '2025', text: t('about.milestone_2025') },
  ]

  const teamMembers = [
    { icon: '👔', name: t('about.team_1_name'), role: t('about.team_1_role'), years: t('about.team_1_years') },
    { icon: '🚗', name: t('about.team_2_name'), role: t('about.team_2_role'), years: t('about.team_2_years') },
    { icon: '🔧', name: t('about.team_3_name'), role: t('about.team_3_role'), years: t('about.team_3_years') },
    { icon: '⭐', name: t('about.team_4_name'), role: t('about.team_4_role'), years: t('about.team_4_years') },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '100px 2rem 4rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        .about-card { background: var(--glass-bg, rgba(255,255,255,0.05)); border: 1px solid var(--glass-border, rgba(255,255,255,0.1)); border-radius: 20px; backdrop-filter: blur(20px); transition: transform 0.3s, border-color 0.3s; }
        .about-card:hover { transform: translateY(-6px); border-color: var(--accent, #FF4D4D); }
        .timeline-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent, #FF4D4D); flex-shrink: 0; margin-top: 4px; box-shadow: 0 0 12px rgba(255,77,77,0.5); }
        @media (max-width: 768px) { .values-grid { grid-template-columns: 1fr !important; } .team-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: 'var(--accent, #FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t('about.badge')}
          </p>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(42px, 8vw, 80px)', color: 'var(--text-primary, #fff)', letterSpacing: '4px', margin: '0 0 20px' }}>
            {t('about.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', fontSize: '18px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission / Vision / Values / Green */}
        <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '64px' }}>
          {values.map((v, i) => (
            <div key={i} className="about-card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{v.icon}</div>
              <h3 style={{ color: 'var(--text-primary, #fff)', fontSize: '18px', fontWeight: '600', margin: '0 0 12px' }}>{v.title}</h3>
              <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>{v.text}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: 'var(--accent, #FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {t('about.history_badge')}
            </p>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--text-primary, #fff)', letterSpacing: '3px', margin: 0 }}>
              {t('about.history_title')}
            </h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '6px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--accent, #FF4D4D), transparent)' }} />
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-start' }}>
                <div className="timeline-dot" />
                <div className="about-card" style={{ flex: 1, padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: 'var(--accent, #FF4D4D)', letterSpacing: '2px', flexShrink: 0 }}>{m.year}</span>
                  <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.7))', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: 'var(--accent, #FF4D4D)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {t('about.team_badge')}
            </p>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--text-primary, #fff)', letterSpacing: '3px', margin: 0 }}>
              {t('about.team_title')}
            </h2>
          </div>
          <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {teamMembers.map((m, i) => (
              <div key={i} className="about-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{m.icon}</div>
                <div style={{ color: 'var(--text-primary, #fff)', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{m.name}</div>
                <div style={{ color: 'var(--accent, #FF4D4D)', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>{m.role}</div>
                <div style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))', fontSize: '11px' }}>{m.years}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px', background: 'linear-gradient(135deg, rgba(255,77,77,0.15), rgba(108,99,255,0.1))', border: '1px solid rgba(255,77,77,0.25)', borderRadius: '24px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text-primary, #fff)', letterSpacing: '3px', margin: '0 0 16px' }}>
            {t('about.cta_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))', marginBottom: '32px', fontSize: '15px' }}>
            {t('about.cta_subtitle')}
          </p>
          <button
            onClick={() => navigate('/fleet')}
            style={{ padding: '16px 48px', background: 'linear-gradient(135deg, #FF4D4D, #FF8C00)', border: 'none', color: '#fff', borderRadius: '50px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.3s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,77,77,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {t('about.cta_btn')}
          </button>
        </div>

      </div>
    </div>
  )
}

export default About
