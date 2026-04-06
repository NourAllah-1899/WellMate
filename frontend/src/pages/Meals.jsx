import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Meals() {
  const { me } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const [description, setDescription] = useState('')
  const [estimate, setEstimate] = useState(null)
  const [editingMealId, setEditingMealId] = useState(null)

  const [listLoading, setListLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [meals, setMeals] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)

  const [historyMeals, setHistoryMeals] = useState([])

  const lastMealId = useMemo(() => {
    let max = -1;
    for (const m of meals) {
      if (m.id > max) max = m.id;
    }
    for (const m of historyMeals) {
      if (m.id > max) max = m.id;
    }
    return max;
  }, [meals, historyMeals]);

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

  const canEstimate = useMemo(() => {
    return !!me && description.trim().length >= 2 && !actionLoading
  }, [me, description, actionLoading])

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
        await api.post('/api/meals', { description })
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
      <div className="wm-card" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div className="wm-header">
          <div>
            <h1>{editingMealId ? 'Modifier le repas' : t('meals.title')}</h1>
            <p className="wm-subtitle">{t('meals.subtitle')}</p>
          </div>
        </div>

        {apiError ? <div className="wm-alert error">{apiError}</div> : null}

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

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="wm-btn secondary" type="button" onClick={onEstimate} disabled={!canEstimate}>
            {actionLoading ? t('meals.working') : t('meals.estimate')}
          </button>
          <button className="wm-btn" type="button" onClick={onSave} disabled={!canEstimate}>
            {actionLoading ? t('meals.working') : editingMealId ? 'Mettre à jour' : t('meals.saveMeal')}
          </button>
          {editingMealId ? (
            <button className="wm-btn secondary" type="button" onClick={onCancelEdit} disabled={actionLoading}>
              Annuler
            </button>
          ) : null}
        </div>

        {estimate ? (
          <div className="wm-panel" style={{ marginTop: 14 }}>
            <div className="wm-kpi-label">{t('meals.estimatedCalories')}</div>
            <div className="wm-kpi">{estimate.totalCalories} kcal</div>
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
                <div key={m.id} className="wm-panel" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 900 }}>{m.description}</div>
                    <div className="wm-badge">{m.estimated_calories} kcal</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div className="wm-muted">
                      {m.eaten_at ? new Date(m.eaten_at).toLocaleString() : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {m.id === lastMealId && (
                        <>
                          <button className="wm-btn secondary small" onClick={() => onEdit(m)}>Éditer</button>
                          <button className="wm-btn error small" onClick={() => onDelete(m.id)}>Supprimer</button>
                        </>
                      )}
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
                <div key={m.id} className="wm-panel" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 900 }}>{m.description}</div>
                    <div className="wm-badge">{m.estimated_calories} kcal</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div className="wm-muted">
                      {m.eaten_at ? new Date(m.eaten_at).toLocaleString() : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {m.id === lastMealId && (
                        <>
                          <button className="wm-btn secondary small" onClick={() => onEdit(m)}>Éditer</button>
                          <button className="wm-btn error small" onClick={() => onDelete(m.id)}>Supprimer</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
