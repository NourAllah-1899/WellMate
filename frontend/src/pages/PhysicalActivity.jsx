import { useEffect, useState, useMemo } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="wm-card flex items-start gap-4">
      <div className="text-2xl leading-none mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</div>
        <div className="text-2xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{value}</div>
        {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
    </div>
  )
}

function ActivityCard({ activity, onDelete, onEdit, t }) {
  const intensityClass = {
    low:    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    high:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  }[activity.intensity] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'

  return (
    <div className="wm-panel flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold capitalize" style={{ color: 'var(--text-heading)' }}>
            {t(`physicalActivity.types.${activity.activity_type}`) || activity.activity_type}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${intensityClass}`}>
            {t(`physicalActivity.intensities.${activity.intensity}`) || activity.intensity}
          </span>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {activity.duration_minutes} min
          {activity.calories_burned ? ` · ${activity.calories_burned} kcal` : ''}
          {activity.activity_date ? ` · ${activity.activity_date}` : ''}
        </div>
        {activity.description && (
          <div className="text-sm mt-1 italic" style={{ color: 'var(--text-muted)' }}>{activity.description}</div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
          >
            {t('common.edit')}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-bold mb-1" style={{ color: 'var(--text-heading)' }}>{title}</div>
      <div className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  )
}

function DayCard({ day, activities, t }) {
  return (
    <div className="wm-panel overflow-hidden p-0" style={{ padding: 0 }}>
      <div style={{ backgroundColor: 'var(--brand-primary)' }} className="px-4 py-2">
        <span className="text-sm font-black text-white tracking-wide">{day}</span>
      </div>
      <div className="p-4">
        {activities && activities.length > 0 ? (
          <ul className="space-y-1.5">
            {activities.map((act, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--brand-action)' }} />
                {act}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{t('programs.rest')}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0]

export default function PhysicalActivity() {
  const { me } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('suivi')

  // ── Memos for translated options
  const ACTIVITY_TYPES = useMemo(() => [
    { value: 'running',    label: t('physicalActivity.types.running') },
    { value: 'walking',    label: t('physicalActivity.types.walking') },
    { value: 'cycling',    label: t('physicalActivity.types.cycling') },
    { value: 'swimming',   label: t('physicalActivity.types.swimming') },
    { value: 'gym',        label: t('physicalActivity.types.gym') },
    { value: 'yoga',       label: t('physicalActivity.types.yoga') },
    { value: 'football',   label: t('physicalActivity.types.football') },
    { value: 'basketball', label: t('physicalActivity.types.basketball') },
    { value: 'tennis',     label: t('physicalActivity.types.tennis') },
    { value: 'boxing',     label: t('physicalActivity.types.boxing') },
    { value: 'hiit',       label: t('physicalActivity.types.hiit') },
    { value: 'pilates',    label: t('physicalActivity.types.pilates') },
    { value: 'other',      label: t('physicalActivity.types.other') },
  ], [t])

  const OBJECTIVES = useMemo(() => [
    { value: 'perte_de_poids',      label: t('programs.objectives.weight_loss') },
    { value: 'prise_de_masse',      label: t('programs.objectives.muscle_gain') },
    { value: 'endurance',           label: t('programs.objectives.endurance') },
    { value: 'flexibilite',         label: t('programs.objectives.flexibility') },
    { value: 'maintien',            label: t('programs.objectives.maintenance') },
  ], [t])

  const LEVELS = useMemo(() => [
    { value: 'debutant',     label: t('programs.levels.beginner') },
    { value: 'intermediaire', label: t('programs.levels.intermediate') },
    { value: 'avance',       label: t('programs.levels.advanced') },
  ], [t])

  // ── Activity state
  const [activityType, setActivityType]       = useState('')
  const [description, setDescription]         = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [intensity, setIntensity]             = useState('medium')
  const [activityDate, setActivityDate]       = useState(TODAY)
  const [activities, setActivities]           = useState([])
  const [totalCalories, setTotalCalories]     = useState(0)
  const [actLoading, setActLoading]           = useState(false)
  const [actError, setActError]               = useState('')
  const [editingId, setEditingId]             = useState(null)

  // ── Program state
  const [objective, setObjective]             = useState('maintien')
  const [level, setLevel]                     = useState('debutant')
  const [sessionsPerWeek, setSessionsPerWeek] = useState('3')
  const [sportProgram, setSportProgram]       = useState(null)
  const [progLoading, setProgLoading]         = useState(false)
  const [progError, setProgError]             = useState('')
  const [progSaved, setProgSaved]             = useState(false)

  // ── Fetch activities
  const fetchActivities = async () => {
    try {
      const res = await api.get('/api/activities/today')
      setActivities(res?.data?.activities || [])
      setTotalCalories(res?.data?.totalCalories || 0)
    } catch {
      /* silently handled */
    }
  }

  // ── Fetch active program
  const fetchProgram = async () => {
    setProgLoading(true)
    try {
      const res = await api.get('/api/programs/active')
      setSportProgram(res?.data?.program || null)
    } catch {
      setSportProgram(null)
    } finally {
      setProgLoading(false)
    }
  }

  useEffect(() => {
    if (!me) return
    fetchActivities()
    fetchProgram()
  }, [me])

  // ── Record / edit activity
  const onSaveActivity = async () => {
    setActError('')
    if (!activityType || !durationMinutes) {
      setActError(t('physicalActivity.form.errorFill'))
      return
    }
    setActLoading(true)
    try {
      if (editingId) {
        await api.put(`/api/activities/${editingId}`, {
          activityType, description,
          durationMinutes: Number(durationMinutes),
          intensity, activityDate,
        })
        setEditingId(null)
      } else {
        await api.post('/api/activities', {
          activityType, description,
          durationMinutes: Number(durationMinutes),
          intensity, activityDate,
        })
      }
      resetActivityForm()
      await fetchActivities()
    } catch (err) {
      setActError(err?.response?.data?.message || t('physicalActivity.form.errorSave'))
    } finally {
      setActLoading(false)
    }
  }

  const resetActivityForm = () => {
    setActivityType('')
    setDescription('')
    setDurationMinutes('')
    setIntensity('medium')
    setActivityDate(TODAY)
    setEditingId(null)
  }

  const onEditActivity = (activity) => {
    setEditingId(activity.id)
    setActivityType(activity.activity_type)
    setDescription(activity.description || '')
    setDurationMinutes(String(activity.duration_minutes))
    setIntensity(activity.intensity || 'medium')
    setActivityDate(activity.activity_date || TODAY)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDeleteActivity = async (id) => {
    if (!window.confirm(t('physicalActivity.form.confirmDelete'))) return
    try {
      await api.delete(`/api/activities/${id}`)
      await fetchActivities()
    } catch {
      setActError(t('physicalActivity.form.errorDelete'))
    }
  }

  // ── Generate program
  const onGenerateProgram = async () => {
    setProgError('')
    setProgSaved(false)
    setProgLoading(true)
    try {
      const res = await api.post('/api/programs/generate', {
        objective, level,
        sessionsPerWeek: Number(sessionsPerWeek),
      })
      setSportProgram(res?.data?.program || null)
    } catch (err) {
      setProgError(err?.response?.data?.message || t('programs.actions.errorGenerate'))
    } finally {
      setProgLoading(false)
    }
  }

  const onSaveProgram = async () => {
    if (!sportProgram) return
    setProgLoading(true)
    try {
      await api.post('/api/programs/save', { program: sportProgram })
      setProgSaved(true)
    } catch {
      setProgError(t('programs.actions.errorSave'))
    } finally {
      setProgLoading(false)
    }
  }

  // ── Guard
  if (!me) {
    return (
      <div className="wm-container">
        <div className="wm-card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1>{t('physicalActivity.title')}</h1>
          <p className="wm-muted mt-2">{t('dashboard.notLoggedIn').replace('{logIn}', t('dashboard.logIn'))}</p>
        </div>
      </div>
    )
  }

  // ── Summary stats
  const totalDuration = activities.reduce((s, a) => s + (a.duration_minutes || 0), 0)

  return (
    <div className="wm-container">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>{t('physicalActivity.title')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('physicalActivity.subtitle')}
          </p>
        </div>

        {/* ── Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          {[
            { key: 'suivi',     label: t('physicalActivity.tabSuivi') },
            { key: 'programme', label: t('physicalActivity.tabProgram') },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════ SUIVI D'ACTIVITÉ ════════════════════ */}
        {activeTab === 'suivi' && (
          <div className="space-y-5">

            {/* Error */}
            {actError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                {actError}
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                icon="🏅"
                label={t('physicalActivity.summary.sessions')}
                value={activities.length}
                sub={t('physicalActivity.summary.recorded')}
              />
              <StatCard
                icon="⏱️"
                label={t('physicalActivity.summary.duration')}
                value={`${totalDuration} min`}
                sub={t('physicalActivity.summary.sessionDay')}
              />
              <StatCard
                icon="🔥"
                label={t('physicalActivity.summary.calories')}
                value={`${totalCalories} kcal`}
                sub={t('physicalActivity.summary.estimation')}
              />
            </div>

            {/* Add / Edit form */}
            <div className="wm-card">
              <h2 className="text-base font-black mb-4">
                {editingId ? t('physicalActivity.form.editTitle') : t('physicalActivity.form.addTitle')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="wm-field">{t('physicalActivity.form.type')}</label>
                  <select
                    className="wm-input"
                    value={activityType}
                    onChange={e => setActivityType(e.target.value)}
                  >
                    <option value="">{t('physicalActivity.form.choose')}</option>
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-field">{t('physicalActivity.form.duration')}</label>
                  <input
                    className="wm-input"
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(e.target.value)}
                    placeholder="ex. 45"
                  />
                </div>

                <div>
                  <label className="wm-field">{t('physicalActivity.form.intensity')}</label>
                  <select
                    className="wm-input"
                    value={intensity}
                    onChange={e => setIntensity(e.target.value)}
                  >
                    <option value="low">{t('physicalActivity.intensities.low')}</option>
                    <option value="medium">{t('physicalActivity.intensities.medium')}</option>
                    <option value="high">{t('physicalActivity.intensities.high')}</option>
                  </select>
                </div>

                <div>
                  <label className="wm-field">{t('physicalActivity.form.date')}</label>
                  <input
                    className="wm-input"
                    type="date"
                    value={activityDate}
                    onChange={e => setActivityDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="wm-field">{t('physicalActivity.form.notes')}</label>
                <textarea
                  className="wm-input"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('physicalActivity.form.notesPlaceholder')}
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  className="wm-btn small"
                  onClick={onSaveActivity}
                  disabled={actLoading}
                >
                  {actLoading ? t('common.loading') : editingId ? t('physicalActivity.form.update') : t('physicalActivity.form.save')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="wm-btn small secondary"
                    onClick={resetActivityForm}
                  >
                    {t('physicalActivity.form.cancel')}
                  </button>
                )}
              </div>
            </div>

            {/* History */}
            <div className="wm-card">
              <h2 className="text-base font-black mb-4">
                {t('physicalActivity.history.title')}
              </h2>

              {activities.length === 0 ? (
                <EmptyState
                  icon="🏋️"
                  title={t('physicalActivity.history.emptyTitle')}
                  desc={t('physicalActivity.history.emptyDesc')}
                />
              ) : (
                <div className="space-y-3">
                  {activities.map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={onDeleteActivity}
                      onEdit={onEditActivity}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ PROGRAMME SPORTIF ════════════════════ */}
        {activeTab === 'programme' && (
          <div className="space-y-5">

            {/* Error */}
            {progError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                {progError}
              </div>
            )}
            {progSaved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl px-4 py-3 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
                {t('programs.actions.successSave')}
              </div>
            )}

            {/* Preferences form */}
            <div className="wm-card">
              <h2 className="text-base font-black mb-1">{t('programs.preferences')}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {t('programs.prefDesc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="wm-field">{t('programs.objective')}</label>
                  <select
                    className="wm-input"
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                  >
                    {OBJECTIVES.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-field">{t('programs.level')}</label>
                  <select
                    className="wm-input"
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                  >
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-field">{t('programs.sessionsPerWeek')}</label>
                  <select
                    className="wm-input"
                    value={sessionsPerWeek}
                    onChange={e => setSessionsPerWeek(e.target.value)}
                  >
                    {[2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {t('programs.header.trainingDays')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="wm-btn small"
                onClick={onGenerateProgram}
                disabled={progLoading}
              >
                {progLoading ? t('programs.generating') : t('programs.generate')}
              </button>
            </div>

            {/* Generated program */}
            {progLoading && !sportProgram && (
              <div className="wm-card text-center">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('programs.generating')}</p>
              </div>
            )}

            {!progLoading && !sportProgram && !progError && (
              <div className="wm-card">
                <EmptyState
                  icon="📋"
                  title={t('programs.emptyTitle')}
                  desc={t('programs.emptyDesc')}
                />
              </div>
            )}

            {sportProgram && (
              <div className="space-y-5">
                {/* Program header */}
                <div className="wm-card">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-lg font-black">{sportProgram.program_name}</h2>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sportProgram.target_objective}</p>
                    </div>
                    {sportProgram.difficulty_level && (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 shrink-0">
                        {sportProgram.difficulty_level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <StatCard
                      icon="📅"
                      label={t('programs.header.sessions')}
                      value={sportProgram.weekly_sessions}
                      sub={t('programs.header.trainingDays')}
                    />
                    <StatCard
                      icon="⏱️"
                      label={t('programs.header.duration')}
                      value={`${sportProgram.session_duration_minutes} min`}
                      sub={t('programs.header.perTraining')}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-5 flex-wrap">
                    <button
                      type="button"
                      className="wm-btn small success"
                      onClick={onSaveProgram}
                      disabled={progLoading || progSaved}
                    >
                      {progSaved ? t('programs.actions.saved') : t('programs.actions.save')}
                    </button>
                    <button
                      type="button"
                      className="wm-btn small secondary"
                      onClick={onGenerateProgram}
                      disabled={progLoading}
                    >
                      {t('programs.actions.regenerate')}
                    </button>
                  </div>
                </div>

                {/* Weekly schedule day cards */}
                {Array.isArray(sportProgram.exercises) && sportProgram.exercises.length > 0 && (
                  <div className="wm-card">
                    <h2 className="text-base font-black mb-4">{t('programs.schedule')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sportProgram.exercises.map((ex, idx) => (
                        <DayCard key={idx} day={ex.day} activities={ex.activities} t={t} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {Array.isArray(sportProgram.recommendations) && sportProgram.recommendations.length > 0 && (
                  <div className="wm-card">
                    <h2 className="text-base font-black mb-3">{t('programs.recommendations')}</h2>
                    <ul className="space-y-2">
                      {sportProgram.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
