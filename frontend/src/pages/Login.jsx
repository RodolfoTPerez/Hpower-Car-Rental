import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'ADMIN' || user.role === 'AGENT') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(t('errors.login_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '64px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderTop: '1px solid var(--glass-border-top)',
        borderRadius: '16px',
        backdropFilter: 'blur(24px)'
      }}>
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '32px',
          color: 'var(--accent)',
          marginBottom: '24px',
          letterSpacing: '2px'
        }}>
          {t('auth.login_title')}
        </h1>

        {error && (
          <div style={{
            background: 'rgba(226,75,74,0.15)',
            border: '1px solid rgba(226,75,74,0.4)',
            color: '#E24B4A',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--btn-primary-bg)',
              border: '1px solid var(--btn-primary-border)',
              color: 'var(--btn-primary-text)',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Cargando...' : t('auth.login_btn')}
          </button>
        </form>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            {t('auth.register_link')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login