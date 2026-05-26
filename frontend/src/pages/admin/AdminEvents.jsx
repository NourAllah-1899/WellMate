import { useEffect, useState, useCallback } from 'react'
import api from '../../api/client.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

import RunningImg from '../../assets/Events/Running.png'
import WalkingImg from '../../assets/Events/Walking.png'
import CyclingImg from '../../assets/Events/Cycling.png'
import YogaImg from '../../assets/Events/Yoga.png'
import BasketballImg from '../../assets/Events/Basketball.png'
import SwimmingImg from '../../assets/Events/Swimming.png'
import FitnessImg from '../../assets/Events/Fitness.png'
import FootballImg from '../../assets/Events/Football.png'

const activityImages = {
  running: RunningImg,
  walking: WalkingImg,
  cycling: CyclingImg,
  yoga: YogaImg,
  basketball: BasketballImg,
  swimming: SwimmingImg,
  fitness: FitnessImg,
  football: FootballImg,
  other: RunningImg,
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewingEvent, setViewingEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { t, language } = useLanguage()

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/events', {
        params: { page, limit: 10, search, sort: 'created_at', order: 'DESC' }
      })
      setEvents(res.data.events)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchEvents(1)
  }, [fetchEvents])

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(t('admin.confirmDeleteEvent', { title }, `Êtes-vous sûr de vouloir supprimer l'événement "${title}" ? Cette action est irréversible.`))) return

    setActionLoading(true)
    try {
      await api.delete(`/api/admin/events/${eventId}`)
      setMessage({ type: 'success', text: t('admin.deleteEventSuccess', { title }, `Événement "${title}" supprimé avec succès.`) })
      fetchEvents(pagination.page)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('admin.deleteError', 'Erreur lors de la suppression.') })
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      max_participants: event.max_participants || '',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.put(`/api/admin/events/${editingEvent.id}`, editForm)
      setMessage({ type: 'success', text: t('admin.editEventSuccess', 'Événement modifié avec succès.') })
      setEditingEvent(null)
      fetchEvents(pagination.page)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('admin.editError', 'Erreur lors de la modification.') })
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const openView = async (eventId) => {
    try {
      const res = await api.get(`/api/admin/events/${eventId}`)
      setViewingEvent(res.data.event)
      setParticipants(res.data.participants || [])
    } catch (err) {
      console.error('Failed to fetch event details:', err)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
          {t('admin.eventsTitle', 'Gestion des Événements')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('admin.eventsCount', { count: pagination.total }, `${pagination.total} événement(s) au total`)}
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl border-l-4 text-sm font-bold animate-shake ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
        }`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Search */}
      <div className="wm-card">
        <input
          type="text"
          placeholder={t('admin.searchEvents', 'Rechercher par titre, description ou créateur...')}
          className="wm-input !mt-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Events Table */}
      <div className="wm-card overflow-hidden !p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-bold" style={{ color: 'var(--text-muted)' }}>{t('admin.noEventsFound', 'Aucun événement trouvé')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-main)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colEvent', 'Événement')}</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colCreator', 'Créateur')}</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colDate', 'Date')}</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colLocation', 'Lieu')}</th>
                  <th className="text-center px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colParticipants', 'Participants')}</th>
                  <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30" style={{ borderColor: 'var(--border-main)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={activityImages[event.activity_type?.toLowerCase()] || activityImages.other}
                            alt={event.activity_type}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {event.activity_type || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="wm-avatar text-[10px] w-6 h-6">{event.creator_username?.charAt(0)?.toUpperCase() || '?'}</div>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{event.creator_username || t('admin.unknownCreator', 'Inconnu')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(event.date)}
                      {event.time && <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>⏰ {event.time}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      📍 {event.location || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {event.participant_count || 0}{event.max_participants ? `/${event.max_participants}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(event.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                          👁️ {t('admin.btnView', 'Voir')}
                        </button>
                        <button
                          onClick={() => openEdit(event)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          ✏️ {t('admin.btnEdit', 'Modifier')}
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                        >
                          🗑️ {t('admin.btnDelete', 'Supprimer')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('admin.pageOf', { page: pagination.page, totalPages: pagination.totalPages }, `Page ${pagination.page} sur ${pagination.totalPages}`)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchEvents(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
              >
                ← {t('admin.prev', 'Précédent')}
              </button>
              <button
                onClick={() => fetchEvents(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
              >
                {t('admin.next', 'Suivant')} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setViewingEvent(null)}>
          <div className="wm-card w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>
                📋 {t('admin.eventDetails', "Détails de l'événement")}
              </h2>
              <button onClick={() => setViewingEvent(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{viewingEvent.title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{viewingEvent.description || t('admin.noDescription', 'Aucune description.')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.colDate', 'Date')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatDate(viewingEvent.date)}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.time', 'Heure')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{viewingEvent.time || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.colLocation', 'Lieu')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>📍 {viewingEvent.location || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.colCreator', 'Créateur')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{viewingEvent.creator_username || t('admin.unknownCreator', 'Inconnu')}</p>
                </div>
              </div>

              {/* Participants List */}
              <div>
                <h4 className="text-sm font-black mb-3" style={{ color: 'var(--text-heading)' }}>
                  👥 {t('admin.participantsTitle', { count: participants.length }, `Participants (${participants.length})`)}{viewingEvent.max_participants ? `/${viewingEvent.max_participants}` : ''}
                </h4>
                {participants.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('admin.noParticipants', 'Aucun participant pour le moment.')}</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <div className="wm-avatar text-[10px] w-6 h-6">{p.username?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{p.username}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(p.joined_at).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingEvent(null)}>
          <div className="wm-card w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>
                ✏️ {t('admin.editEvent', "Modifier l'événement")}
              </h2>
              <button onClick={() => setEditingEvent(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.eventTitleLabel', 'Titre')}</span>
                <input type="text" className="wm-input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.description', 'Description')}</span>
                <textarea className="wm-input" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.colDate', 'Date')}</span>
                  <input type="date" className="wm-input" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.time', 'Heure')}</span>
                  <input type="time" className="wm-input" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.colLocation', 'Lieu')}</span>
                  <input type="text" className="wm-input" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{t('admin.maxParticipants', 'Max participants')}</span>
                  <input type="number" className="wm-input" value={editForm.max_participants} onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading} className="wm-btn flex-1">
                  {actionLoading ? t('admin.saving', 'Enregistrement...') : `💾 ${t('admin.save', 'Enregistrer')}`}
                </button>
                <button type="button" onClick={() => setEditingEvent(null)} className="wm-btn secondary flex-1">
                  {t('admin.cancel', 'Annuler')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
