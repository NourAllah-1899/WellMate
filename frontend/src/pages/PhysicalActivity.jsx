import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { value: 'running',    label: 'Course à pied' },
  { value: 'walking',    label: 'Marche' },
  { value: 'cycling',    label: 'Vélo' },
  { value: 'swimming',   label: 'Natation' },
  { value: 'gym',        label: 'Musculation' },
  { value: 'yoga',       label: 'Yoga' },
  { value: 'football',   label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis',     label: 'Tennis' },
  { value: 'boxing',     label: 'Boxe' },
  { value: 'hiit',       label: 'HIIT' },
  { value: 'pilates',    label: 'Pilates' },
  { value: 'other',      label: 'Autre' },
]

const INTENSITY_LABELS = { low: 'Faible', medium: 'Modérée', high: 'Élevée' }

const INTENSITY_COLORS = {
  low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high:   'bg-red-50 text-red-700 border-red-200',
}

const OBJECTIVES = [
  { value: 'perte_de_poids',      label: 'Perte de poids' },
  { value: 'prise_de_masse',      label: 'Prise de masse musculaire' },
  { value: 'endurance',           label: 'Améliorer l\'endurance' },
  { value: 'flexibilite',         label: 'Flexibilité & mobilité' },
  { value: 'maintien',            label: 'Maintien de la forme' },
]

const LEVELS = [
  { value: 'debutant',     label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance',       label: 'Avancé' },
]

const TODAY = new Date().toISOString().split('T')[0]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <div className="text-2xl leading-none mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

function ActivityCard({ activity, onDelete, onEdit }) {
  const label = ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label || activity.activity_type
  const intensityClass = INTENSITY_COLORS[activity.intensity] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-slate-900 capitalize">{label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${intensityClass}`}>
            {INTENSITY_LABELS[activity.intensity] || activity.intensity}
          </span>
        </div>
        <div className="text-sm text-slate-500">
          {activity.duration_minutes} min
          {activity.calories_burned ? ` · ${activity.calories_burned} kcal` : ''}
          {activity.activity_date ? ` · ${activity.activity_date}` : ''}
        </div>
        {activity.description && (
          <div className="text-sm text-slate-600 mt-1 italic">{activity.description}</div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            Modifier
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-bold text-slate-700 mb-1">{title}</div>
      <div className="text-sm text-slate-400 max-w-xs">{desc}</div>
    </div>
  )
}

function DayCard({ day, activities }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-indigo-600 px-4 py-2">
        <span className="text-sm font-black text-white tracking-wide">{day}</span>
      </div>
      <div className="p-4">
        {activities && activities.length > 0 ? (
          <ul className="space-y-1.5">
            {activities.map((act, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                {act}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">Repos</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PhysicalActivity() {
  const { me } = useAuth()
  const [activeTab, setActiveTab] = useState('suivi')

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
      setActError('Veuillez remplir le type d\'activité et la durée.')
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
      setActError(err?.response?.data?.message || 'Erreur lors de l\'enregistrement.')
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
    if (!window.confirm('Supprimer cette activité ?')) return
    try {
      await api.delete(`/api/activities/${id}`)
      await fetchActivities()
    } catch {
      setActError('Erreur lors de la suppression.')
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
      setProgError(err?.response?.data?.message || 'Erreur lors de la génération.')
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
      setProgError('Erreur lors de la sauvegarde.')
    } finally {
      setProgLoading(false)
    }
  }

  // ── Guard
  if (!me) {
    return (
      <div className="wm-container">
        <div className="wm-card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1>Activité physique</h1>
          <p className="wm-muted mt-2">Veuillez vous connecter pour accéder à cette section.</p>
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
          <h1 className="text-2xl font-black text-slate-900">Activité physique</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Suivez vos séances et générez un programme sportif personnalisé.
          </p>
        </div>

        {/* ── Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { key: 'suivi',     label: '🏃 Suivi d\'activité' },
            { key: 'programme', label: '📋 Programme sportif' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
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
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                {actError}
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
              <StatCard
                icon="🏅"
                label="Séances aujourd'hui"
                value={activities.length}
                sub="activités enregistrées"
              />
              <StatCard
                icon="⏱️"
                label="Durée totale"
                value={`${totalDuration} min`}
                sub="session du jour"
              />
              <StatCard
                icon="🔥"
                label="Calories brûlées"
                value={`${totalCalories} kcal`}
                sub="estimation du jour"
              />
            </div>

            {/* Add / Edit form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-black text-slate-800 mb-4">
                {editingId ? '✏️ Modifier l\'activité' : '➕ Enregistrer une activité'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="wm-field">Type d'activité *</label>
                  <select
                    className="wm-input"
                    value={activityType}
                    onChange={e => setActivityType(e.target.value)}
                  >
                    <option value="">— Choisir —</option>
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-field">Durée (minutes) *</label>
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
                  <label className="wm-field">Intensité</label>
                  <select
                    className="wm-input"
                    value={intensity}
                    onChange={e => setIntensity(e.target.value)}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Modérée</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>

                <div>
                  <label className="wm-field">Date</label>
                  <input
                    className="wm-input"
                    type="date"
                    value={activityDate}
                    onChange={e => setActivityDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="wm-field">Notes (optionnel)</label>
                <textarea
                  className="wm-input"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex. 5 km en forêt, séance difficile…"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  className="wm-btn small"
                  onClick={onSaveActivity}
                  disabled={actLoading}
                >
                  {actLoading ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="wm-btn small secondary"
                    onClick={resetActivityForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-black text-slate-800 mb-4">
                📅 Activités d'aujourd'hui
              </h2>

              {activities.length === 0 ? (
                <EmptyState
                  icon="🏋️"
                  title="Aucune activité enregistrée"
                  desc="Commencez par ajouter votre première séance du jour ci-dessus."
                />
              ) : (
                <div className="space-y-3">
                  {activities.map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={onDeleteActivity}
                      onEdit={onEditActivity}
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
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                {progError}
              </div>
            )}
            {progSaved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl px-4 py-3">
                ✅ Programme sauvegardé avec succès.
              </div>
            )}

            {/* Preferences form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-black text-slate-800 mb-1">⚙️ Vos préférences</h2>
              <p className="text-sm text-slate-400 mb-4">
                Configurez vos objectifs pour générer un programme adapté.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="wm-field">Objectif</label>
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
                  <label className="wm-field">Niveau</label>
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
                  <label className="wm-field">Séances / semaine</label>
                  <select
                    className="wm-input"
                    value={sessionsPerWeek}
                    onChange={e => setSessionsPerWeek(e.target.value)}
                  >
                    {[2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} jours</option>
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
                {progLoading ? '⏳ Génération en cours…' : '✨ Générer mon programme'}
              </button>
            </div>

            {/* Generated program */}
            {progLoading && !sportProgram && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-slate-500 text-sm">Génération du programme en cours…</p>
              </div>
            )}

            {!progLoading && !sportProgram && !progError && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <EmptyState
                  icon="📋"
                  title="Aucun programme généré"
                  desc={'Configurez vos préférences ci-dessus et cliquez sur \u00ab\u00a0Générer mon programme\u00a0\u00bb.'}
                />
              </div>
            )}

            {sportProgram && (
              <div className="space-y-5">
                {/* Program header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{sportProgram.program_name}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{sportProgram.target_objective}</p>
                    </div>
                    {sportProgram.difficulty_level && (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0">
                        {sportProgram.difficulty_level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <StatCard
                      icon="📅"
                      label="Séances / semaine"
                      value={sportProgram.weekly_sessions}
                      sub="jours d'entraînement"
                    />
                    <StatCard
                      icon="⏱️"
                      label="Durée / séance"
                      value={`${sportProgram.session_duration_minutes} min`}
                      sub="par entraînement"
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
                      {progSaved ? '✓ Sauvegardé' : '💾 Sauvegarder'}
                    </button>
                    <button
                      type="button"
                      className="wm-btn small secondary"
                      onClick={onGenerateProgram}
                      disabled={progLoading}
                    >
                      🔄 Régénérer
                    </button>
                  </div>
                </div>

                {/* Weekly schedule day cards */}
                {Array.isArray(sportProgram.exercises) && sportProgram.exercises.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-base font-black text-slate-800 mb-4">📆 Planning hebdomadaire</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sportProgram.exercises.map((ex, idx) => (
                        <DayCard key={idx} day={ex.day} activities={ex.activities} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {Array.isArray(sportProgram.recommendations) && sportProgram.recommendations.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-base font-black text-slate-800 mb-3">💡 Recommandations</h2>
                    <ul className="space-y-2">
                      {sportProgram.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
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
