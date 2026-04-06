import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const toNumberOrEmpty = (v) => {
  if (v === '' || v === null || v === undefined) return ''
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}

const calcBmi = (heightCm, weightKg) => {
  const h = Number(heightCm)
  const w = Number(weightKg)
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null
  const m = h / 100
  return Number((w / (m * m)).toFixed(2))
}

export default function Profile() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')

  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const bmi = useMemo(() => calcBmi(heightCm, weightKg), [heightCm, weightKg])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setApiError('')
      try {
        const res = await api.get('/api/auth/me')
        const u = res?.data?.user

        if (!mounted) return

        setFullName(u?.full_name ?? '')
        setAge(u?.age ?? '')
        setHeightCm(u?.height_cm ?? '')
        setWeightKg(u?.weight_kg ?? '')
      } catch (err) {
        if (!mounted) return
        const msg = err?.response?.data?.message || 'Failed to load profile.'
        setApiError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const onSave = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccessMsg('')

    setSaving(true)
    try {
      const payload = {
        full_name: fullName || undefined,
        age: age === '' ? undefined : toNumberOrEmpty(age),
        height_cm: heightCm === '' ? undefined : toNumberOrEmpty(heightCm),
        weight_kg: weightKg === '' ? undefined : toNumberOrEmpty(weightKg),
      }

      const res = await api.put('/api/auth/profile', payload)
      const u = res?.data?.user

      setFullName(u?.full_name ?? '')
      setAge(u?.age ?? '')
      setHeightCm(u?.height_cm ?? '')
      setWeightKg(u?.weight_kg ?? '')

      setSuccessMsg('Profile saved.')
      // Redirect to dashboard
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save profile.'
      setApiError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="wm-container">
        <div className="wm-card" style={{ maxWidth: 560, margin: '0 auto' }}>{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="wm-container">
      <div className="wm-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="wm-header">
          <h1>{t('dashboard.healthProfile') || 'Health profile'}</h1>
        </div>

        <p className="wm-subtitle">
          {/* Missing pure generic text, fallback or simple strings */}
          Fill your personal data. Your BMI (IMC) is calculated automatically.
        </p>

        <form onSubmit={onSave} className="wm-form">
          <label className="wm-field">
            {t('auth.fullName')}
            <input
              className="wm-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="wm-field">
            {t('dashboard.age')}
            <input
              className="wm-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 22"
              inputMode="numeric"
            />
          </label>

          <label className="wm-field">
            {t('dashboard.height')} (cm)
            <input
              className="wm-input"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 175"
              inputMode="decimal"
            />
          </label>

          <label className="wm-field">
            {t('dashboard.weight')} (kg)
            <input
              className="wm-input"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 70"
              inputMode="decimal"
            />
          </label>

          <div className="wm-panel">
            <div style={{ fontWeight: 700 }}>{t('dashboard.bmi')} (IMC)</div>
            <div className="wm-muted" style={{ marginTop: 6 }}>
              {bmi === null ? 'Enter height and weight to see your BMI.' : bmi}
            </div>
          </div>

          {apiError ? <div className="wm-error">{apiError}</div> : null}
          {successMsg ? <div className="wm-success">{successMsg}</div> : null}

          <button type="submit" disabled={saving} className="wm-btn">
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
