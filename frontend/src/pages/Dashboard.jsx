import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Dashboard.css'

const bmiBadgeClass = (status) => {
  if (!status) return 'wm-badge'
  const s = String(status).toLowerCase()
  if (s.includes('normal')) return 'wm-badge success'
  if (s.includes('under')) return 'wm-badge warn'
  if (s.includes('over') || s.includes('obesity')) return 'wm-badge danger'
  return 'wm-badge'
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const { me } = useAuth()
  const { t } = useLanguage()
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
  const weekly = data?.weekly
  const weightProgress = data?.weightProgress || []
  const healthEvents = data?.healthEvents || []


  const bmiText = useMemo(() => {
    if (!user?.bmi) return '—'
    return String(user.bmi)
  }, [user?.bmi])

  const weightChange = useMemo(() => {
    if (weightProgress.length < 2) return null
    const first = weightProgress[0]?.weight_kg
    const last = weightProgress[weightProgress.length - 1]?.weight_kg
    if (!first || !last) return null
    const diff = last - first
    return {
      value: diff.toFixed(1),
      direction: diff > 0 ? '↑' : diff < 0 ? '↓' : '→',
      isPositive: diff > 0,
    }
  }, [weightProgress])

  return (
    <div className="wm-container">
      {!me ? (
        <div className="wm-card">
          <div className="wm-alert">
            {t('dashboard.notLoggedIn', { logIn: t('dashboard.logIn') })} / <Link to="/login">{t('common.login')}</Link> to view your dashboard.
          </div>
        </div>
      ) : null}

      {apiError ? <div className="wm-card error-card"><div className="wm-alert error">{apiError}</div></div> : null}

      {me && loading ? (
        <div className="wm-card loading-card">
          <div className="wm-panel">{t('dashboard.loading')}</div>
        </div>
      ) : null}

      {me && !loading && data ? (
        <>
          {/* Welcome Header */}
          <div className="wm-card header-card">
            <div className="wm-header">
              <div>
                <h1>{t('dashboard.welcome')}, {user?.full_name || user?.username}! 👋</h1>
                <p className="wm-subtitle">{t('dashboard.personalHealthDashboard')}</p>
              </div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="dashboard-grid">
            {/* Health Profile Card */}
            <div className="wm-card stat-card">
              <h3>💪 {t('dashboard.healthProfile')}</h3>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.age')}</span>
                  <span className="stat-value">{user?.age || '—'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.height')}</span>
                  <span className="stat-value">{user?.height_cm ? `${user.height_cm} cm` : '—'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.weight')}</span>
                  <span className="stat-value">{user?.weight_kg ? `${user.weight_kg} kg` : '—'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.bmi')}</span>
                  <div>
                    <span className="stat-value">{bmiText}</span>
                    <div style={{ marginTop: 6 }}>
                      <span className={bmiBadgeClass(user?.bmi_status)}>{user?.bmi_status || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/profile" className="wm-btn small" style={{ marginTop: 12 }}>{t('dashboard.updateProfile')}</Link>
            </div>

            {/* Weight Progress Card */}
            <div className="wm-card stat-card">
              <h3>⚖️ {t('dashboard.progression')}</h3>
              {weightProgress.length > 0 ? (
                <>
                  <div className="weight-list">
                    {weightProgress.slice(-3).reverse().map((w, i) => (
                      <div key={i} className="weight-entry">
                        <span className="weight-date">{formatDate(w.recorded_date)}</span>
                        <span className="weight-val">{w.weight_kg} kg</span>
                      </div>
                    ))}
                  </div>
                  {weightChange && (
                    <div className={`change-indicator ${weightChange.isPositive ? 'gain' : 'loss'}`}>
                      {weightChange.direction} {Math.abs(weightChange.value)} kg
                    </div>
                  )}
                </>
              ) : (
                <p className="wm-muted">{t('dashboard.noWeightHistory')}</p>
              )}
            </div>

            {/* Today's Calories Card */}
            <div className="wm-card stat-card">
              <h3>🍽️ {t('dashboard.todaysCalories')}</h3>
              <div className="calorie-display">
                <div className="calorie-value">{today?.total_calories || 0}</div>
                <div className="calorie-label">{t('dashboard.caloriesConsumed')}</div>
              </div>
              <Link to="/meals" className="wm-btn small" style={{ marginTop: 12 }}>{t('dashboard.viewMeals')}</Link>
            </div>

            {/* Weekly Stats Card */}
            <div className="wm-card stat-card">
              <h3>📊 {t('dashboard.thisWeek')}</h3>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.avgCalories')}</span>
                  <span className="stat-value">{weekly?.average_calories || 0}</span>
                  <span className="stat-sublabel">{t('dashboard.kcalPerDay')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('dashboard.mealsLogged')}</span>
                  <span className="stat-value">{weekly?.meals_count || 0}</span>
                  <span className="stat-sublabel">{t('dashboard.thisWeekSuffix')}</span>
                </div>
              </div>
            </div>

            {/* Weight Goal Card */}
            <div className="wm-card stat-card">
              <h3>🎯 {t('dashboard.weightGoal')}</h3>
              {goal ? (
                <>
                  <div className="goal-display">
                    <div className="goal-direction">{goal.direction}</div>
                    <div className="goal-target">{goal.target_weight_kg} kg</div>
                  </div>
                  <p className="wm-muted">{goal.ai_summary || t('dashboard.workingTowards')}</p>
                </>
              ) : (
                <>
                  <p className="wm-muted">{t('dashboard.noGoalSet')}</p>
                  <Link to="/goals" className="wm-btn small">{t('dashboard.setGoal')}</Link>
                </>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="wm-card stat-card">
              <h3>⚡ {t('dashboard.quickActions')}</h3>
              <div className="action-grid">
                <Link to="/meals" className="wm-btn small">{t('dashboard.addMeal')}</Link>
                <Link to="/health" className="wm-btn small">{t('dashboard.logHealth')}</Link>
                <Link to="/events" className="wm-btn small">{t('common.events')}</Link>
                <Link to="/goals" className="wm-btn small">{t('common.goals')}</Link>
              </div>
            </div>
          </div>

          {/* Health Events Section */}
          {healthEvents.length > 0 && (
            <div className="wm-card section-card">
              <h3>📋 {t('dashboard.recentHealthEvents')}</h3>
              <div className="events-list">
                {healthEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-type">{event.event_type}</div>
                    <div className="event-desc">{event.description}</div>
                    <div className="event-date">{formatDate(event.recorded_at)}</div>
                  </div>
                ))}
              </div>
              <Link to="/health" className="wm-btn secondary small" style={{ marginTop: 12 }}>{t('dashboard.viewAllEvents')}</Link>
            </div>
          )}


        </>
      ) : null}
    </div>
  )
}
