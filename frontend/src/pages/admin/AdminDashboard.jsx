import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const { t, language } = useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, eventsRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users?limit=5&sort=created_at&order=DESC'),
          api.get('/api/admin/events?limit=5&sort=created_at&order=DESC'),
        ])
        setStats(statsRes.data.stats)
        setRecentUsers(usersRes.data.users)
        setRecentEvents(eventsRes.data.events)
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const statCards = [
    { label: t('admin.totalUsers', 'Total Utilisateurs'), value: stats?.totalUsers || 0, icon: '👥', color: 'from-violet-500 to-purple-600', change: `+${stats?.newUsersThisWeek || 0} ${t('admin.thisWeek', 'cette semaine')}` },
    { label: t('admin.totalEvents', 'Total Événements'), value: stats?.totalEvents || 0, icon: '📅', color: 'from-blue-500 to-cyan-600', change: `+${stats?.newEventsThisWeek || 0} ${t('admin.thisWeek', 'cette semaine')}` },
    { label: t('admin.totalMeals', 'Total Repas'), value: stats?.totalMeals || 0, icon: '🍽️', color: 'from-emerald-500 to-teal-600', change: t('admin.allMeals', 'Tous les repas enregistrés') },
    { label: t('admin.totalActivities', 'Total Activités'), value: stats?.totalActivities || 0, icon: '🏃', color: 'from-amber-500 to-orange-600', change: t('admin.allActivities', 'Toutes les activités') },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
          {t('admin.dashboard', 'Tableau de bord')} <span className="opacity-50">Admin</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('admin.subtitle', "Vue d'ensemble de la plateforme WellMate")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl"
               style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">{card.change}</span>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <p className="text-sm font-medium opacity-90 mt-1">{card.label}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
          </div>
        ))}
      </div>

      {/* Recent Users & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="wm-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span>👥</span> {t('admin.recentUsers', 'Derniers Utilisateurs')}
            </h2>
            <Link to="/admin/users" className="text-xs font-bold text-violet-600 hover:text-violet-800 no-underline">
              {t('admin.viewAll', 'Voir tout')} →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('admin.noUsers', 'Aucun utilisateur trouvé.')}</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                     style={{ borderColor: 'var(--border-main)' }}>
                  <div className="flex items-center gap-3">
                    <div className="wm-avatar text-xs">{user.username?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="wm-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span>📅</span> {t('admin.recentEvents', 'Derniers Événements')}
            </h2>
            <Link to="/admin/events" className="text-xs font-bold text-violet-600 hover:text-violet-800 no-underline">
              {t('admin.viewAll', 'Voir tout')} →
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('admin.noEvents', 'Aucun événement trouvé.')}</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                     style={{ borderColor: 'var(--border-main)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {event.participant_count || 0} {t('admin.participants', 'participants')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {event.location || 'N/A'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📆 {event.date ? new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR') : 'N/A'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('admin.by', 'par')} {event.creator_username || t('admin.unknown', 'Inconnu')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
