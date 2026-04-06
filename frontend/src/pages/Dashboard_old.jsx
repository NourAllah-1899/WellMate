import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const bmiBadgeClass = (status) => {
  if (!status) return 'wm-badge'
  const s = String(status).toLowerCase()
  if (s.includes('normal')) return 'wm-badge success'
  if (s.includes('under')) return 'wm-badge warn'
  if (s.includes('over') || s.includes('obesity')) return 'wm-badge danger'
  return 'wm-badge'
}

export default function Dashboard() {
  const { me } = useAuth()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    const run = async () => {
      if (!me) return
      setApiError('')
      setLoading(true)
      try {
        const res = await api.get('/api/dashboard')
        setData(res?.data?.dashboard || null)
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load dashboard.'
        setApiError(msg)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [me])

  const user = data?.user
  const goal = data?.goal
  const today = data?.today

  const bmiText = useMemo(() => {
    if (!user?.bmi) return '—'
    return String(user.bmi)
  }, [user?.bmi])

  return (
    <div className="wm-container">
      <div className="wm-card">
        <div className="wm-header">
          <div>
            <h1>Dashboard</h1>
            <p className="wm-subtitle">Your health summary, goal, and today’s estimated calories.</p>
          </div>
        </div>

        {!me ? (
          <div className="wm-alert">
            You are not logged in. Please <Link to="/login">log in</Link> to view your dashboard.
          </div>
        ) : null}

        {apiError ? <div className="wm-alert error">{apiError}</div> : null}

        {me && loading ? (
          <div className="wm-panel">Loading…</div>
        ) : null}

        {me && !loading && data ? (
          <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="wm-panel">
              <div className="wm-kpi-label">Current weight</div>
              <div className="wm-kpi">{user?.weight_kg ? `${user.weight_kg} kg` : '—'}</div>
              <div className="wm-muted">Update it in your profile.</div>
            </div>

            <div className="wm-panel">
              <div className="wm-kpi-label">Height</div>
              <div className="wm-kpi">{user?.height_cm ? `${user.height_cm} cm` : '—'}</div>
              <div className="wm-muted">Used to compute BMI.</div>
            </div>

            <div className="wm-panel">
              <div className="wm-kpi-label">BMI</div>
              <div className="wm-kpi">{bmiText}</div>
              <div style={{ marginTop: 10 }}>
                <span className={bmiBadgeClass(user?.bmi_status)}>{user?.bmi_status || '—'}</span>
              </div>
            </div>

            <div className="wm-panel">
              <div className="wm-kpi-label">Weight goal</div>
              {goal ? (
                <>
                  <div className="wm-kpi">{goal.direction} → {goal.target_weight_kg} kg</div>
                  <div className="wm-muted">You can change it anytime.</div>
                </>
              ) : (
                <>
                  <div className="wm-kpi">No goal yet</div>
                  <div className="wm-muted">Get a recommendation and save it.</div>
                </>
              )}
            </div>

            <div className="wm-panel">
              <div className="wm-kpi-label">Today calories (est.)</div>
              <div className="wm-kpi">{typeof today?.total_calories === 'number' ? today.total_calories : '—'}</div>
              <div className="wm-muted">From meals saved today.</div>
            </div>

            <div className="wm-panel">
              <div className="wm-kpi-label">Quick actions</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                <Link className="wm-btn" to="/profile">Update profile</Link>
                <Link className="wm-btn secondary" to="/health">Health</Link>
              </div>
              <div className="wm-muted" style={{ marginTop: 10 }}>Meals & Goals pages are next in Sprint 3.</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
