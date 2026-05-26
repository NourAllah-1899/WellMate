import { useEffect, useState, useCallback } from 'react'
import api from '../../api/client.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { t, language } = useLanguage()

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/users', {
        params: { page, limit: 10, search, sort: 'created_at', order: 'DESC' }
      })
      setUsers((res.data.users || []).filter((u) => u?.email !== 'admin@wellmate.com'))
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const handleDelete = async (userId, username) => {
    if (!window.confirm(t('admin.confirmDeleteUser', { username }, `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ? Cette action est irréversible.`))) return

    setActionLoading(true)
    try {
      await api.delete(`/api/admin/users/${userId}`)
      setMessage({ type: 'success', text: t('admin.deleteSuccess', { username }, `Utilisateur "${username}" supprimé avec succès.`) })
      fetchUsers(pagination.page)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('admin.deleteError', 'Erreur lors de la suppression.') })
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
            {t('admin.usersTitle', 'Gestion des Utilisateurs')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.usersCount', { count: pagination.total }, `${pagination.total} utilisateur(s) au total`)}
          </p>
        </div>
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

      {/* Filters */}
      <div className="wm-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('admin.searchUsers', 'Rechercher par nom, email ou username...')}
              className="wm-input !mt-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="wm-card overflow-hidden !p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold" style={{ color: 'var(--text-muted)' }}>{t('admin.noUsersFound', 'Aucun utilisateur trouvé')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-main)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colUser', 'Utilisateur')}</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colEmail', 'Email')}</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colJoined', 'Inscrit le')}</th>
                  <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('admin.colActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30" style={{ borderColor: 'var(--border-main)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="wm-avatar text-xs">{user.username?.charAt(0)?.toUpperCase()}</div>
                        <div>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.full_name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
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
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
              >
                ← {t('admin.prev', 'Précédent')}
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
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
    </div>
  )
}
