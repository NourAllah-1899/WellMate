import { useEffect, useState, useCallback } from 'react'
import api from '../../api/client.js'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/users', {
        params: { page, limit: 10, search, role: roleFilter, sort: 'created_at', order: 'DESC' }
      })
      setUsers(res.data.users)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ? Cette action est irréversible.`)) return

    setActionLoading(true)
    try {
      await api.delete(`/api/admin/users/${userId}`)
      setMessage({ type: 'success', text: `Utilisateur "${username}" supprimé avec succès.` })
      fetchUsers(pagination.page)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' })
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      age: user.age || '',
      height_cm: user.height_cm || '',
      weight_kg: user.weight_kg || '',
      role: user.role || 'user',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.put(`/api/admin/users/${editingUser.id}`, editForm)
      setMessage({ type: 'success', text: 'Utilisateur modifié avec succès.' })
      setEditingUser(null)
      fetchUsers(pagination.page)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la modification.' })
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
            👥 Gestion des Utilisateurs
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au total
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
              placeholder="🔍 Rechercher par nom, email ou username..."
              className="wm-input !mt-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="wm-input !mt-0 !w-auto min-w-[150px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
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
            <p className="font-bold" style={{ color: 'var(--text-muted)' }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-main)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Utilisateur</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rôle</th>
                  <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Inscrit le</th>
                  <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
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
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                        >
                          🗑️ Supprimer
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
              Page {pagination.page} sur {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
              >
                ← Précédent
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingUser(null)}>
          <div className="wm-card w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>
                ✏️ Modifier l'utilisateur
              </h2>
              <button onClick={() => setEditingUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Nom complet</span>
                  <input type="text" className="wm-input" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Email</span>
                  <input type="email" className="wm-input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Âge</span>
                  <input type="number" className="wm-input" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Rôle</span>
                  <select className="wm-input" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Taille (cm)</span>
                  <input type="number" className="wm-input" value={editForm.height_cm} onChange={(e) => setEditForm({ ...editForm, height_cm: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Poids (kg)</span>
                  <input type="number" className="wm-input" value={editForm.weight_kg} onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading} className="wm-btn flex-1">
                  {actionLoading ? 'Enregistrement...' : '💾 Enregistrer'}
                </button>
                <button type="button" onClick={() => setEditingUser(null)} className="wm-btn secondary flex-1">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
