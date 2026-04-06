import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

const isStrongPassword = (password) => {
  if (typeof password !== 'string') return false
  const hasMin = password.length >= 8
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  return hasMin && hasLower && hasUpper && hasNumber && hasSymbol
}

export default function Register() {
  const navigate = useNavigate()
  const { refreshMe } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return email && password && confirmPassword && !loading
  }, [email, password, confirmPassword, loading])

  const validate = () => {
    const next = {}

    if (!email) next.email = 'Email is required.'
    else if (!isValidEmail(email)) next.email = 'Email must be valid.'

    if (!password) next.password = 'Password is required.'
    else if (!isStrongPassword(password)) {
      next.password = 'Password must be strong (8+ chars, upper, lower, number, symbol).'
    }

    if (!confirmPassword) next.confirmPassword = 'Confirm password is required.'
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.'

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) return

    setLoading(true)
    try {
      await api.post(
        '/api/auth/register',
        { email, password, confirmPassword },
      )

      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed.'
      setApiError(msg)

      const errors = err?.response?.data?.errors
      if (Array.isArray(errors) && errors.length) {
        const next = {}
        for (const e of errors) {
          if (e?.path) next[e.path] = e.msg
        }
        if (Object.keys(next).length) setFieldErrors((prev) => ({ ...prev, ...next }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wm-container">
      <div className="wm-card" style={{ maxWidth: 440, margin: '0 auto' }}>
        <div className="wm-header">
          <h1>Create account</h1>
          <Link to="/">Home</Link>
        </div>
        <p className="wm-subtitle">Start tracking your health with WellMate.</p>

        <form onSubmit={onSubmit} className="wm-form">
          <label className="wm-field">
            Email
            <input
              className="wm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          {fieldErrors.email ? <div className="wm-error">{fieldErrors.email}</div> : null}

          <label className="wm-field">
            Password
            <input
              className="wm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Strong password"
            />
          </label>
          {fieldErrors.password ? <div className="wm-error">{fieldErrors.password}</div> : null}

          <label className="wm-field">
            Confirm password
            <input
              className="wm-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
            />
          </label>
          {fieldErrors.confirmPassword ? <div className="wm-error">{fieldErrors.confirmPassword}</div> : null}

          {apiError ? <div className="wm-error">{apiError}</div> : null}

          <button type="submit" disabled={!canSubmit} className="wm-btn">
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="wm-subtitle" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
