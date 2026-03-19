import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || t('errors.server_error'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--input-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    marginBottom: '6px'
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
          {t('auth.register_title')}
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
            <label style={labelStyle}>{t('auth.name')}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>{t('auth.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={inputStyle}
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
            {loading ? 'Cargando...' : t('auth.register_btn')}
          </button>
        </form>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          {t('auth.have_account')}{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            {t('auth.login_link')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register