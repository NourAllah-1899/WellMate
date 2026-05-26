import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'



export default function Goals() {
  const { me } = useAuth()
  const { t } = useLanguage()

  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [recLoading, setRecLoading]     = useState(false)
  const [apiError, setApiError]         = useState('')

  const [activeGoal, setActiveGoal]     = useState(null)
  const [showForm, setShowForm]         = useState(false)

  // Form state
  const [direction, setDirection]       = useState('maintain')
  const [targetWeightKg, setTargetWeightKg] = useState('')
  const [aiSummary, setAiSummary]       = useState('')
  const [recommendation, setRecommendation] = useState(null)

  const fetchActive = async () => {
    const res = await api.get('/api/goals/active')
    const goal = res?.data?.goal || null
    setActiveGoal(goal)
    setShowForm(!goal)
  }

  useEffect(() => {
    if (!me) return
    setLoading(true)
    fetchActive().catch(err => {
      setApiError(err?.response?.data?.message || 'Failed to load goal.')
    }).finally(() => setLoading(false))
  }, [me])

  const onRecommend = async () => {
    setApiError('')
    setRecLoading(true)
    try {
      const res = await api.post('/api/goals/recommendation', {})
      const rec = res?.data?.recommendation
      setRecommendation(rec || null)
      if (rec?.direction)               setDirection(rec.direction)
      if (rec?.suggestedTargetWeightKg) setTargetWeightKg(String(rec.suggestedTargetWeightKg))
      if (rec?.explanation)             setAiSummary(String(rec.explanation))
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to get recommendation. Make sure your height & weight are set in Profile.')
    } finally {
      setRecLoading(false)
    }
  }

  const onSave = async () => {
    if (!targetWeightKg || isNaN(Number(targetWeightKg))) {
      setApiError('Please enter a valid target weight.')
      return
    }
    setApiError('')
    setSaving(true)
    try {
      const res = await api.post('/api/goals', {
        direction,
        targetWeightKg: Number(targetWeightKg),
        aiSummary,
        suggestedCalories: recommendation?.suggestedCalories
      })
      setActiveGoal(res?.data?.goal || null)
      setShowForm(false)
      setRecommendation(null)
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to save goal.')
    } finally {
      setSaving(false)
    }
  }

  const startNewGoal = () => {
    setShowForm(true)
    setRecommendation(null)
    setAiSummary('')
    setTargetWeightKg('')
    setDirection('maintain')
  }

  if (!me) {
    return (
      <div className="wm-container">
        <div className="wm-card">
          <h1>{t('goals.title')}</h1>
          <div className="wm-alert">{t('dashboard.notLoggedIn', { logIn: t('common.login') })}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="wm-container">
      <div className="wm-header-card">
        <h1>{t('goals.title')}</h1>
        <p className="wm-subtitle">{t('goals.subtitle')}</p>
      </div>

      <div className="wm-card">
        {apiError ? <div className="wm-alert error" style={{ marginBottom: 16 }}>{apiError}</div> : null}
        {loading  ? <div className="wm-panel">{t('common.loading')}</div> : null}

        {/* ── Active goal display ── */}
        {activeGoal && !showForm ? (
          <div className="wm-panel" style={{ marginBottom: 20 }}>
            <div className="wm-kpi-label" style={{ marginBottom: 12, fontWeight: 'bold' }}>{t('goals.activeGoal')}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
              <span className="wm-kpi" style={{ margin: 0 }}>{activeGoal.direction} → {activeGoal.target_weight_kg} kg</span>
            </div>

            {activeGoal.ai_summary
              ? <div className="wm-muted" style={{ fontStyle: 'italic', marginBottom: 16 }}>{activeGoal.ai_summary}</div>
              : null}

            <button className="wm-btn" type="button" onClick={startNewGoal} style={{ fontWeight: 'bold' }}>
              {t('goals.newGoal')}
            </button>
          </div>
        ) : null}

        {/* ── Goal-setting form ── */}
        {showForm ? (
          <div>
            <div className="wm-kpi-label" style={{ marginBottom: 16 }}>
              {activeGoal ? t('goals.newGoal') : t('goals.noGoal')}
            </div>

            {/* AI recommendation box */}
            {recommendation ? (
              <div className="wm-panel" style={{ marginBottom: 20, borderLeft: '3px solid #6366f1' }}>
                <div style={{ fontWeight: 700, color: '#6366f1', marginBottom: 6 }}>{t('goals.recommendation')}</div>
                {recommendation.bmi
                  ? <div className="wm-muted" style={{ marginBottom: 6 }}>{t('goals.bmi')}: <b>{recommendation.bmi}</b> — <b>{recommendation.bmiCategory}</b></div>
                  : null}
                {recommendation.explanation
                  ? <div className="wm-muted" style={{ fontStyle: 'italic' }}>{recommendation.explanation}</div>
                  : null}
              </div>
            ) : null}

            {/* Direction selector and Target weight */}
            <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 18 }}>
              <label className="wm-field">
                {t('goals.direction')}
                <select className="wm-input" value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="lose">{t('goals.lose')}</option>
                  <option value="gain">{t('goals.gain')}</option>
                  <option value="maintain">{t('goals.maintain')}</option>
                </select>
              </label>

              <label className="wm-field">
                {t('goals.targetWeight')}
                <input
                  className="wm-input"
                  value={targetWeightKg}
                  onChange={e => setTargetWeightKg(e.target.value)}
                  placeholder="e.g. 70"
                  inputMode="decimal"
                />
              </label>
            </div>

            {/* Save button */}
            <button
              className="wm-btn"
              type="button"
              onClick={onSave}
              disabled={saving}
              style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
            >
              {saving ? t('common.loading') : t('goals.saveGoal')}
            </button>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

            {/* AI calculate (optional) */}
            <button
              className="wm-btn"
              type="button"
              onClick={onRecommend}
              disabled={recLoading}
              style={{ width: '100%', background: 'transparent', border: '2px solid #6366f1', color: '#6366f1' }}
            >
              {recLoading ? t('goals.generating') : t('goals.getRecommendation')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
