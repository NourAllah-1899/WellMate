import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Goals() {
  const { me } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const [activeGoal, setActiveGoal] = useState(null)

  const [recLoading, setRecLoading] = useState(false)
  const [recommendation, setRecommendation] = useState(null)

  const [direction, setDirection] = useState('maintain')
  const [targetWeightKg, setTargetWeightKg] = useState('')
  const [geminiSummary, setGeminiSummary] = useState('')

  const fetchActive = async () => {
    const res = await api.get('/api/goals/active')
    setActiveGoal(res?.data?.goal || null)
  }

  useEffect(() => {
    const run = async () => {
      if (!me) return
      setApiError('')
      setLoading(true)
      try {
        await fetchActive()
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load goal.'
        setApiError(msg)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [me])

  const canRecommend = useMemo(() => {
    return !!me && !recLoading
  }, [me, recLoading])

  const onRecommend = async () => {
    setApiError('')
    setRecLoading(true)
    try {
      const res = await api.post('/api/goals/recommendation', {})
      const rec = res?.data?.recommendation
      setRecommendation(rec || null)

      if (rec?.direction) setDirection(rec.direction)
      if (rec?.suggestedTargetWeightKg) setTargetWeightKg(String(rec.suggestedTargetWeightKg))
      if (rec?.explanation) setGeminiSummary(String(rec.explanation))
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to get recommendation.'
      setApiError(msg)
    } finally {
      setRecLoading(false)
    }
  }

  const onSave = async () => {
    setApiError('')
    setLoading(true)
    try {
      const res = await api.post('/api/goals', {
        direction,
        targetWeightKg: Number(targetWeightKg),
        geminiSummary,
      })
      setActiveGoal(res?.data?.goal || null)
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save goal.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
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
      <div className="wm-card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="wm-header">
          <div>
            <h1>{t('goals.title')}</h1>
            <p className="wm-subtitle">{t('goals.subtitle')}</p>
          </div>
        </div>

        {apiError ? <div className="wm-alert error">{apiError}</div> : null}

        {loading ? <div className="wm-panel">{t('common.loading')}</div> : null}

        {activeGoal ? (
          <div className="wm-panel">
            <div className="wm-kpi-label">{t('goals.currentGoal')}</div>
            <div className="wm-kpi">{activeGoal.direction} → {activeGoal.target_weight_kg} kg</div>
            {activeGoal.gemini_summary ? <div className="wm-muted" style={{ marginTop: 10 }}>{activeGoal.gemini_summary}</div> : null}
          </div>
        ) : (
          <div className="wm-panel">
            <div className="wm-muted">{t('dashboard.noGoalSet')}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="wm-btn" type="button" onClick={onRecommend} disabled={!canRecommend}>
            {recLoading ? t('goals.generating') : t('goals.getRecommendation')}
          </button>
        </div>

        {recommendation ? (
          <div className="wm-panel" style={{ marginTop: 14 }}>
            <div className="wm-kpi-label">{t('goals.recommendation')}</div>
            <div style={{ marginTop: 8 }}>
              <div className="wm-muted">{t('goals.bmi')}: <b>{recommendation.bmi}</b> — <b>{recommendation.bmiCategory}</b></div>
              {recommendation.explanation ? (
                <div className="wm-muted" style={{ marginTop: 8 }}>{recommendation.explanation}</div>
              ) : null}
              {recommendation.notes ? (
                <div className="wm-muted" style={{ marginTop: 8 }}>{recommendation.notes}</div>
              ) : null}
            </div>

            <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 14 }}>
              <label className="wm-field">
                {t('goals.direction')}
                <select className="wm-input" value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="lose">lose</option>
                  <option value="gain">gain</option>
                  <option value="maintain">maintain</option>
                </select>
              </label>

              <label className="wm-field">
                {t('goals.targetWeight')}
                <input
                  className="wm-input"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  placeholder="e.g. 70"
                  inputMode="decimal"
                />
              </label>
            </div>

            <label className="wm-field">
              {t('goals.summary')}
              <textarea
                className="wm-input"
                value={geminiSummary}
                onChange={(e) => setGeminiSummary(e.target.value)}
                rows={3}
                placeholder=""
              />
            </label>

            <button className="wm-btn" type="button" onClick={onSave} disabled={loading}>
              {t('goals.saveGoal')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
