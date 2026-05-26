import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import logoLight from '../assets/WellMate_light.png'
import logoDark from '../assets/WellMate_dark.png'

export default function AdminLayout({ children }) {
  const { me, logout } = useAuth()
  const { t } = useLanguage()
  const { isDarkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const navItems = [
    { path: '/admin', label: t('admin.dashboard', 'Tableau de bord') },
    { path: '/admin/users', label: t('admin.users', 'Utilisateurs') },
    { path: '/admin/events', label: t('admin.events', 'Événements') },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Admin Top Bar */}
      <header className="wm-topbar sticky top-0">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 no-underline">
              <img key={isDarkMode ? 'dark' : 'light'} className="wm-logo" src={isDarkMode ? logoDark : logoLight} alt="WellMate" />
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                ADMIN
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 no-underline flex items-center gap-1.5 ${
                  isActive(item.path)
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{ color: isActive(item.path) ? undefined : 'var(--text-secondary)' }}
              >
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                className="wm-lang-btn" 
                onClick={toggleTheme} 
                aria-label="Toggle theme"
              >
                {isDarkMode ? '🌙' : '☀️'}
              </button>
              <LanguageSelector />
            </div>

            <div className="relative" ref={menuRef}>
              <button 
                type="button" 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
              >
                <div className="wm-avatar text-xs">{me?.username?.charAt(0)?.toUpperCase() || 'A'}</div>
                <span className="text-sm font-bold hidden md:inline" style={{ color: 'var(--text-primary)' }}>
                  {me?.username}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>▼</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setOpen(false)
                      logout()
                      navigate('/login')
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    {t('admin.logout', 'Se déconnecter')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
