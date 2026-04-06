import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

export default function Login() {
  const navigate = useNavigate()
  const { refreshMe } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return email && password && !loading
  }, [email, password, loading])

  const validate = () => {
    const next = {}

    if (!email) next.email = 'Email is required.'
    else if (!isValidEmail(email)) next.email = 'Email must be valid.'

    if (!password) next.password = 'Password is required.'

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) return

    setLoading(true)
    try {
      const res = await api.post(
        '/api/auth/login',
        { email, password },
      )

      const token = res?.data?.token
      if (token) localStorage.setItem('token', token)

      await refreshMe()

      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wm-container">
      <div className="wm-card" style={{ maxWidth: 440, margin: '0 auto' }}>
        <div className="wm-header">
          <h1>{t('auth.login')}</h1>
          <Link to="/">{t('common.home')}</Link>
        </div>
        <p className="wm-subtitle">{t('auth.loginSubtitle')}</p>

        <form onSubmit={onSubmit} className="wm-form">
          <label className="wm-field">
            {t('auth.email')}
            <input
              className="wm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder=""
            />
          </label>
          {fieldErrors.email ? <div className="wm-error">{fieldErrors.email}</div> : null}

          <label className="wm-field">
            {t('auth.password')}
            <input
              className="wm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder=""
            />
          </label>
          {fieldErrors.password ? <div className="wm-error">{fieldErrors.password}</div> : null}

          {apiError ? <div className="wm-error">{apiError}</div> : null}

          <button type="submit" disabled={!canSubmit} className="wm-btn">
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <p className="wm-subtitle" style={{ marginTop: 14 }}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  )
}
