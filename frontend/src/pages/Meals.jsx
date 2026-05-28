import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import MealPlanGenerator from '../components/meals/MealPlanGenerator.jsx'

export default function Meals() {
  const { me } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [activeTab, setActiveTab] = useState('log')

  const [description, setDescription] = useState('')
  const [estimate, setEstimate] = useState(null)
  const [editingMealId, setEditingMealId] = useState(null)

  const [listLoading, setListLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [meals, setMeals] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)

  const [historyMeals, setHistoryMeals] = useState([])


  const fetchAll = async () => {
    const resToday = await api.get('/api/meals/today')
    setMeals(resToday?.data?.meals || [])
    setTotalCalories(resToday?.data?.total_calories || 0)

    const resHistory = await api.get('/api/meals/history')
    const todayIds = new Set((resToday?.data?.meals || []).map(m => m.id))
    const historyFiltered = (resHistory?.data?.meals || []).filter(m => !todayIds.has(m.id))
    setHistoryMeals(historyFiltered)
  }

  useEffect(() => {
    const run = async () => {
      if (!me) return
      setApiError('')
      setListLoading(true)
      try {
        await fetchAll()
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load meals.'
        setApiError(msg)
      } finally {
        setListLoading(false)
      }
    }
    run()
  }, [me])

  const canEstimate = !!me && description.trim().length >= 2 && !actionLoading

  const onEstimate = async () => {
    setApiError('')
    setActionLoading(true)
    try {
      const res = await api.post('/api/meals/estimate', { description })
      setEstimate(res?.data?.estimate || null)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to estimate calories.'
      setApiError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const onSave = async () => {
    setApiError('')
    setActionLoading(true)
    try {
      if (editingMealId) {
        await api.put(`/api/meals/${editingMealId}`, { 
          description, 
          estimatedCalories: estimate?.totalCalories 
        })
      } else {
        await api.post('/api/meals', { 
          description,
          estimatedCalories: estimate?.totalCalories
        })
      }
      setDescription('')
      setEstimate(null)
      setEditingMealId(null)
      await fetchAll()
      if (!editingMealId) {
        navigate('/')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save meal.'
      setApiError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const onEdit = (m) => {
    setEditingMealId(m.id);
    setDescription(m.description);
    setEstimate(null);
    setActiveTab('log');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCancelEdit = () => {
    setEditingMealId(null);
    setDescription('');
    setEstimate(null);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce repas ?')) return;
    setApiError('');
    setListLoading(true);
    try {
      await api.delete(`/api/meals/${id}`);
      await fetchAll();
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to delete.');
      setListLoading(false);
    }
  };

  const MealMacros = ({ breakdownJson }) => {
    let data = null;
    try {
      data = typeof breakdownJson === 'string' ? JSON.parse(breakdownJson) : breakdownJson;
    } catch (e) {}
    if (!data || (!data.protein_g && !data.carbs_g && !data.fat_g)) return null;
    const macros = [
      { label: t('meals.protein'), value: data.protein_g || 0, tint: 'color-mix(in srgb, #3b82f6 10%, transparent)', text: '#3b82f6' },
      { label: t('meals.carbs'), value: data.carbs_g || 0, tint: 'color-mix(in srgb, #f59e0b 10%, transparent)', text: '#d97706' },
      { label: t('meals.fat'), value: data.fat_g || 0, tint: 'color-mix(in srgb, #ec4899 10%, transparent)', text: '#db2777' },
    ];
    return (
      <div className="grid grid-cols-3 gap-2 mt-2">
        {macros.map((macro, i) => (
          <div key={i} className="wm-panel p-2 text-center" style={{ backgroundColor: macro.tint, borderColor: macro.tint }}>
            <div className="text-sm font-black" style={{ color: macro.text }}>{macro.value}g</div>
            <div className="text-[9px] font-bold uppercase" style={{ color: macro.text, opacity: 0.7 }}>{macro.label}</div>
          </div>
        ))}
      </div>
    );
  };

  if (!me) {
    return (
      <div className="wm-container">
        <div className="wm-card">
          <h1>{t('meals.title')}</h1>
          <div className="wm-alert">{t('dashboard.notLoggedIn', { logIn: t('common.login') })}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="wm-container">
        <div className="wm-header-card">
          <h1>{editingMealId ? 'Modifier le repas' : t('meals.title')}</h1>
          <p className="wm-subtitle">{t('meals.subtitle')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex-1 ${
              activeTab === 'log'
                ? 'text-white shadow-lg dark:shadow-none'
                : 'hover:opacity-80'
            }`}
            style={activeTab === 'log'
              ? { background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-action))', borderColor: 'transparent' }
              : { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-main)' }
            }
          >
            🍽️ {t('meals.title')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex-1 ${
              activeTab === 'plan'
                ? 'text-white shadow-lg dark:shadow-none'
                : 'hover:opacity-80'
            }`}
            style={activeTab === 'plan'
              ? { background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-action))', borderColor: 'transparent' }
              : { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-main)' }
            }
          >
            🤖 Plan IA
          </button>
        </div>

        {/* Tab: Log Meals */}
        {activeTab === 'log' && (
          <div className="wm-card">
            {apiError ? (
              <div className="p-3 rounded-xl text-sm font-bold border mb-4" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)', color: '#ef4444', borderColor: 'color-mix(in srgb, #ef4444 20%, transparent)' }}>
                ⚠️ {apiError}
              </div>
            ) : null}

            <label className="wm-field">
              {t('meals.description')}
              <textarea
                className="wm-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder='e.g. "2 eggs, bread, and a glass of milk"'
              />
            </label>
            <div className="flex gap-3 flex-wrap mt-4">
              <button className="wm-btn secondary flex-1" type="button" onClick={onEstimate} disabled={!canEstimate}>
                {actionLoading ? t('meals.working') : '⚡ ' + t('meals.estimate')}
              </button>
              <button className="wm-btn flex-1" type="button" onClick={onSave} disabled={!canEstimate}>
                {actionLoading ? t('meals.working') : editingMealId ? '💾 Mettre à jour' : '💾 ' + t('meals.saveMeal')}
              </button>
              {editingMealId ? (
                <button className="wm-btn secondary" type="button" onClick={onCancelEdit} disabled={actionLoading}>
                  ❌ Annuler
                </button>
              ) : null}
            </div>

            {estimate ? (
              <div className="wm-panel" style={{ marginTop: 14 }}>
                <div className="wm-kpi-label">{t('meals.estimatedCalories')}</div>
                <div className="wm-kpi">{estimate.totalCalories} kcal</div>
                {/* Macros */}
                {(estimate.protein_g || estimate.carbs_g || estimate.fat_g) ? (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: t('meals.protein'), value: estimate.protein_g || 0, tint: 'color-mix(in srgb, #3b82f6 10%, transparent)', text: '#3b82f6' },
                      { label: t('meals.carbs'), value: estimate.carbs_g || 0, tint: 'color-mix(in srgb, #f59e0b 10%, transparent)', text: '#d97706' },
                      { label: t('meals.fat'), value: estimate.fat_g || 0, tint: 'color-mix(in srgb, #ec4899 10%, transparent)', text: '#db2777' },
                    ].map((macro, i) => (
                      <div key={i} className="wm-panel p-2 text-center" style={{ backgroundColor: macro.tint, borderColor: macro.tint }}>
                        <div className="text-sm font-black" style={{ color: macro.text }}>{macro.value}g</div>
                        <div className="text-[9px] font-bold uppercase" style={{ color: macro.text, opacity: 0.7 }}>{macro.label}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {Array.isArray(estimate.items) && estimate.items.length ? (
                  <div style={{ marginTop: 10 }}>
                    <div className="wm-muted" style={{ fontWeight: 900, marginBottom: 6 }}>{t('meals.breakdown')}</div>
                    <div className="wm-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                      {estimate.items.map((it, idx) => (
                        <div key={idx} className="wm-panel" style={{ padding: 10 }}>
                          <div style={{ fontWeight: 900 }}>{it.name}</div>
                          <div className="wm-muted">{it.quantity}</div>
                          <div style={{ marginTop: 6, fontWeight: 900 }}>{it.calories} kcal</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {estimate.assumptions ? (
                  <div className="wm-muted" style={{ marginTop: 10 }}>{estimate.assumptions}</div>
                ) : null}
              </div>
            ) : null}

            <div className="wm-panel" style={{ marginTop: 18 }}>
              <div className="wm-header" style={{ marginBottom: 10 }}>
                <h2 style={{ margin: 0 }}>{t('meals.today')}</h2>
                <div className="wm-badge">Total: {totalCalories} kcal</div>
              </div>

              {listLoading ? <div className="wm-muted">{t('common.loading')}</div> : null}

              {!listLoading && meals.length === 0 ? (
                <div className="wm-muted">{t('meals.noMeals')}</div>
              ) : null}

              {!listLoading && meals.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {meals.map((m) => (
                    <div key={m.id} className="wm-panel" style={{ padding: 12, borderLeft: '3px solid var(--brand-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0, fontWeight: 900, color: 'var(--text-heading)' }}>{m.description}</div>
                        <div className="wm-badge" style={{ flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--brand-primary)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>{m.estimated_calories} kcal</div>
                      </div>
                      <MealMacros breakdownJson={m.breakdown_json} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <div className="wm-muted">
                          {m.eaten_at ? new Date(m.eaten_at).toLocaleString() : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="wm-btn small" style={{ background: 'none', border: '1px solid var(--border-main)', color: 'var(--text-secondary)' }} onClick={() => onEdit(m)}>Edit</button>
                          <button className="wm-btn small error" style={{ background: 'none', border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)', color: '#ef4444' }} onClick={() => onDelete(m.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="wm-panel" style={{ marginTop: 18 }}>
              <div className="wm-header" style={{ marginBottom: 10 }}>
                <h2 style={{ margin: 0 }}>Historique (30 jours)</h2>
              </div>

              {listLoading ? <div className="wm-muted">{t('common.loading')}</div> : null}

              {!listLoading && historyMeals.length === 0 ? (
                <div className="wm-muted">Aucun repas dans l'historique récent.</div>
              ) : null}

              {!listLoading && historyMeals.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {historyMeals.map((m) => (
                    <div key={m.id} className="wm-panel" style={{ padding: 12, borderLeft: '3px solid var(--brand-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0, fontWeight: 900, color: 'var(--text-heading)' }}>{m.description}</div>
                        <div className="wm-badge" style={{ flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--brand-primary)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>{m.estimated_calories} kcal</div>
                      </div>
                      <MealMacros breakdownJson={m.breakdown_json} />
                      <div style={{ marginTop: 10 }}>
                        <div className="wm-muted">
                          {m.eaten_at ? new Date(m.eaten_at).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Tab: AI Meal Plan */}
        {activeTab === 'plan' && (
          <MealPlanGenerator />
        )}
    </div>
  )
}

