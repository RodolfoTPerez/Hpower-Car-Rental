import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { theme, changeTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '24px',
        color: 'var(--accent)',
        textDecoration: 'none',
        letterSpacing: '2px'
      }}>
        HPOWER
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px' }}>
          {t('nav.home')}
        </Link>
        <Link to="/fleet" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px' }}>
          {t('nav.fleet')}
        </Link>

        {user && (
          <Link to="/account" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px' }}>
            {t('nav.profile')}
          </Link>
        )}

        {!user ? (
          <Link to="/login" style={{
            background: 'var(--btn-primary-bg)',
            border: '1px solid var(--btn-primary-border)',
            color: 'var(--btn-primary-text)',
            padding: '8px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            {t('nav.login')}
          </Link>
        ) : (
          <button onClick={handleLogout} style={{
            background: 'var(--btn-primary-bg)',
            border: '1px solid var(--btn-primary-border)',
            color: 'var(--btn-primary-text)',
            padding: '8px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            {t('nav.logout')}
          </button>
        )}

        <button onClick={toggleLanguage} style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          {i18n.language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>

        <select
          value={theme}
          onChange={(e) => changeTheme(e.target.value)}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          <option value="midnight">🌙 Midnight</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="pearl">☀️ Pearl</option>
          <option value="sunset">🌅 Sunset</option>
        </select>
      </div>
    </nav>
  )
}

export default Navbar