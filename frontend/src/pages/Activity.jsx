import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Activity() {
  const { me } = useAuth()
  const [activeTab, setActiveTab] = useState('activity') // 'activity', 'smoking', 'program'
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Activity state
  const [activityType, setActivityType] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [intensity, setIntensity] = useState('medium')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0])
  const [activities, setActivities] = useState([])
  const [totalCaloriesToday, setTotalCaloriesToday] = useState(0)

  // Smoking state
  const [cigarettes, setCigarettes] = useState('')
  const [smokingLog, setSmokingLog] = useState(null)
  const [quitTargetDate, setQuitTargetDate] = useState('')
  const [smokingStats, setSmokingStats] = useState([])
  const [statsRange, setStatsRange] = useState('daily')

  // Program state
  const [sportProgram, setSportProgram] = useState(null)
  const [programLoading, setProgramLoading] = useState(false)

  // ─── Activity Functions ───────────────────────────────────────────────────
  const fetchActivitiesToday = async () => {
    try {
      const res = await api.get('/api/activities/today')
      setActivities(res?.data?.activities || [])
      setTotalCaloriesToday(res?.data?.totalCalories || 0)
    } catch (err) {
      console.error('Error fetching activities:', err)
    }
  }

  const onRecordActivity = async () => {
    setApiError('')
    if (!activityType || !durationMinutes) {
      setApiError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/activities', {
        activityType,
        description,
        durationMinutes: Number(durationMinutes),
        intensity,
        activityDate,
      })
      setActivityType('')
      setDescription('')
      setDurationMinutes('')
      await fetchActivitiesToday()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to record activity'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/api/activities/${activityId}`)
      await fetchActivitiesToday()
    } catch (err) {
      setApiError('Failed to delete activity')
    }
  }

  // ─── Smoking Functions ───────────────────────────────────────────────────
  const fetchSmokingToday = async () => {
    try {
      const res = await api.get('/api/smoking/today')
      setSmokingLog(res?.data?.log || null)
    } catch (err) {
      console.error('Error fetching smoking log:', err)
    }
  }

  const onLogSmoking = async () => {
    setApiError('')
    if (cigarettes === '') {
      setApiError('Please enter number of cigarettes')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/smoking', {
        cigarettesCount: Number(cigarettes),
        logDate: new Date().toISOString().split('T')[0],
      })
      setCigarettes('')
      await fetchSmokingToday()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to log smoking'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onSetQuitTarget = async () => {
    setApiError('')
    if (!quitTargetDate) {
      setApiError('Please select a quit date')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/smoking/target', { quitTargetDate })
      setQuitTargetDate('')
      await fetchSmokingStats()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to set quit target'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fetchSmokingStats = async () => {
    try {
      const res = await api.get('/api/smoking/stats', { params: { range: statsRange } })
      setSmokingStats(res?.data?.stats || [])
    } catch (err) {
      console.error('Error fetching smoking stats:', err)
    }
  }

  // ─── Program Functions ───────────────────────────────────────────────────
  const fetchActiveProgram = async () => {
    setProgramLoading(true)
    try {
      const res = await api.get('/api/programs/active')
      setSportProgram(res?.data?.program || null)
    } catch (err) {
      console.error('Error fetching program:', err)
    } finally {
      setProgramLoading(false)
    }
  }

  const onGenerateProgram = async () => {
    setApiError('')
    setProgramLoading(true)
    try {
      const res = await api.post('/api/programs/generate', {})
      setSportProgram(res?.data?.program || null)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to generate program'
      setApiError(msg)
    } finally {
      setProgramLoading(false)
    }
  }

  // ─── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return
    fetchActivitiesToday()
    fetchSmokingToday()
    fetchActiveProgram()
  }, [me])

  useEffect(() => {
    if (!me || activeTab !== 'smoking') return
    fetchSmokingStats()
  }, [me, statsRange, activeTab])

  if (!me) {
    return (
      <div className="wm-container">
        <div className="wm-card">
          <h1>Physical Activity</h1>
          <div className="wm-alert">Please log in to track your activities.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="wm-container">
      <div className="wm-card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="wm-header">
          <h1>Health & Fitness</h1>
          <p className="wm-subtitle">Track your activities, smoking, and personalized programs.</p>
        </div>

        {apiError ? <div className="wm-alert error">{apiError}</div> : null}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '10px 16px',
              borderNone: true,
              background: activeTab === 'activity' ? '#007bff' : 'transparent',
              color: activeTab === 'activity' ? '#fff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'activity' ? 'bold' : 'normal',
            }}
          >
            🏃 Activities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('smoking')}
            style={{
              padding: '10px 16px',
              borderNone: true,
              background: activeTab === 'smoking' ? '#007bff' : 'transparent',
              color: activeTab === 'smoking' ? '#fff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'smoking' ? 'bold' : 'normal',
            }}
          >
            🚭 Smoking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('program')}
            style={{
              padding: '10px 16px',
              borderNone: true,
              background: activeTab === 'program' ? '#007bff' : 'transparent',
              color: activeTab === 'program' ? '#fff' : '#666',
              cursor: 'pointer',
              fontWeight: activeTab === 'program' ? 'bold' : 'normal',
            }}
          >
            📋 Program
          </button>
        </div>

        {/* ─── Activities Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div>
            <div className="wm-panel" style={{ marginBottom: 20 }}>
              <h3>Record Activity</h3>
              <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <label className="wm-field">
                  Activity Type *
                  <select className="wm-input" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                    <option value="">Select activity</option>
                    <option value="running">Running</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="gym">Gym</option>
                    <option value="yoga">Yoga</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="tennis">Tennis</option>
                    <option value="boxing">Boxing</option>
                    <option value="hiit">HIIT</option>
                    <option value="pilates">Pilates</option>
                  </select>
                </label>

                <label className="wm-field">
                  Duration (minutes) *
                  <input
                    className="wm-input"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="e.g. 30"
                  />
                </label>

                <label className="wm-field">
                  Intensity
                  <select className="wm-input" value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="wm-field">
                  Date
                  <input
                    className="wm-input"
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </label>
              </div>

              <label className="wm-field">
                Description (optional)
                <textarea
                  className="wm-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Add notes about your activity..."
                />
              </label>

              <button className="wm-btn" type="button" onClick={onRecordActivity} disabled={loading}>
                {loading ? 'Recording...' : 'Record Activity'}
              </button>
            </div>

            {/* Today's Activities */}
            <div className="wm-panel">
              <div className="wm-header" style={{ marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>Today's Activities</h3>
                <div className="wm-badge">Total: {totalCaloriesToday} kcal</div>
              </div>

              {activities.length === 0 ? (
                <div className="wm-muted">No activities recorded yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {activities.map((activity) => (
                    <div key={activity.id} className="wm-grid" style={{ gridTemplateColumns: '1fr auto', gap: 10, padding: 10, border: '1px solid #ddd', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 900, textTransform: 'capitalize' }}>{activity.activity_type}</div>
                        <div className="wm-muted">{activity.duration_minutes} min • {activity.intensity}</div>
                        {activity.description && <div className="wm-muted" style={{ marginTop: 6 }}>{activity.description}</div>}
                        <div style={{ marginTop: 6, fontWeight: 700, color: '#ff6b6b' }}>{activity.calories_burned} kcal</div>
                      </div>
                      <button
                        className="wm-btn secondary"
                        type="button"
                        onClick={() => onDeleteActivity(activity.id)}
                        style={{ padding: 8, height: 'fit-content' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Smoking Tab ────────────────────────────────────────────────────── */}
        {activeTab === 'smoking' && (
          <div>
            <div className="wm-panel" style={{ marginBottom: 20 }}>
              <h3>Log Today's Cigarettes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <label className="wm-field">
                  Number of Cigarettes
                  <input
                    className="wm-input"
                    type="number"
                    value={cigarettes}
                    onChange={(e) => setCigarettes(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </label>

                <label className="wm-field">
                  Quit Target Date
                  <input
                    className="wm-input"
                    type="date"
                    value={quitTargetDate}
                    onChange={(e) => setQuitTargetDate(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="wm-btn" type="button" onClick={onLogSmoking} disabled={loading}>
                  {loading ? 'Saving...' : 'Log Cigarettes'}
                </button>
                <button className="wm-btn secondary" type="button" onClick={onSetQuitTarget} disabled={loading}>
                  {loading ? 'Saving...' : 'Set Quit Date'}
                </button>
              </div>
            </div>

            {/* Today's Log */}
            {smokingLog && (
              <div className="wm-panel" style={{ marginBottom: 20 }}>
                <h3>Today's Log</h3>
                <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                  <div className="wm-kpi">
                    <div className="wm-kpi-label">Cigarettes</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{smokingLog.cigarettes_count}</div>
                  </div>
                  {smokingLog.quit_target_date && (
                    <div className="wm-kpi">
                      <div className="wm-kpi-label">Quit Target</div>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{smokingLog.quit_target_date}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="wm-panel">
              <h3>Statistics</h3>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  Range:
                  <select
                    className="wm-input"
                    value={statsRange}
                    onChange={(e) => setStatsRange(e.target.value)}
                    style={{ flex: 1, maxWidth: 150 }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
              </div>

              {smokingStats.length === 0 ? (
                <div className="wm-muted">No statistics available yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {smokingStats.map((stat, idx) => (
                    <div key={idx} style={{ padding: 10, background: '#f5f5f5', borderRadius: 8 }}>
                      <div style={{ fontWeight: 900 }}>Period: {stat.period}</div>
                      <div className="wm-muted">Avg: {Math.round(stat.avg_cigarettes)} • Min: {stat.min_cigarettes} • Max: {stat.max_cigarettes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Program Tab ────────────────────────────────────────────────────── */}
        {activeTab === 'program' && (
          <div>
            {programLoading ? (
              <div className="wm-panel">Loading program...</div>
            ) : sportProgram ? (
              <div>
                <div className="wm-panel" style={{ marginBottom: 20 }}>
                  <div className="wm-header" style={{ marginBottom: 10 }}>
                    <h2 style={{ margin: 0 }}>{sportProgram.program_name}</h2>
                    <div className="wm-badge">{sportProgram.difficulty_level.toUpperCase()}</div>
                  </div>
                  <div className="wm-muted">{sportProgram.target_objective}</div>
                  <div style={{ marginTop: 15, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div className="wm-kpi">
                      <div className="wm-kpi-label">Sessions/Week</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{sportProgram.weekly_sessions}</div>
                    </div>
                    <div className="wm-kpi">
                      <div className="wm-kpi-label">Duration</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{sportProgram.session_duration_minutes} min</div>
                    </div>
                  </div>
                </div>

                {/* Exercises */}
                <div className="wm-panel" style={{ marginBottom: 20 }}>
                  <h3>Weekly Schedule</h3>
                  {Array.isArray(sportProgram.exercises) && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {sportProgram.exercises.map((exercise, idx) => (
                        <div key={idx} style={{ padding: 10, background: '#f5f5f5', borderRadius: 8 }}>
                          <div style={{ fontWeight: 900, marginBottom: 6 }}>{exercise.day}</div>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {exercise.activities.map((activity, aIdx) => (
                              <li key={aIdx} className="wm-muted">{activity}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="wm-panel">
                  <h3>Recommendations</h3>
                  {Array.isArray(sportProgram.recommendations) && (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {sportProgram.recommendations.map((rec, idx) => (
                        <li key={idx} className="wm-muted" style={{ marginBottom: 8 }}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="wm-panel">
                  <p className="wm-muted">No active program. Generate one based on your profile and activities.</p>
                  <button className="wm-btn" type="button" onClick={onGenerateProgram} disabled={programLoading}>
                    {programLoading ? 'Generating...' : 'Generate Program'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
