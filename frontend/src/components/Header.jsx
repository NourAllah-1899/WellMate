import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import logoLight from '../assets/WellMate_light.png'
import logoDark from '../assets/WellMate_dark.png'

const initials = (name) => {
  const s = String(name || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join('')
}

export default function Header() {
  const navigate = useNavigate()
  const { me, logout } = useAuth()
  const { t } = useLanguage()
  const { isDarkMode, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const displayName = me?.full_name || me?.username || 'User'

  return (
    <header className="wm-topbar">
      <div className="wm-topbar-inner">
        <NavLink to="/" className="wm-brand" aria-label="WellMate Home">
          <img key={isDarkMode ? 'dark' : 'light'} className="wm-logo" src={isDarkMode ? logoDark : logoLight} alt="WellMate" />
        </NavLink>

        <nav className="hidden md:flex wm-nav-center" aria-label="Main navigation">
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/">{t('common.home')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/health">{t('common.health')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/physical-activity">{t('common.physicalActivity')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/events">{t('common.events')}</NavLink>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex wm-auth">
          {me ? (
            <div className="wm-user" ref={menuRef}>
              <button className="wm-user-btn" type="button" onClick={() => setOpen((v) => !v)}>
                <span className="wm-avatar" aria-hidden="true">{initials(displayName)}</span>
                <span className="wm-user-name">{displayName}</span>
              </button>

              {open ? (
                <div className="wm-menu" role="menu">
                  {me?.role === 'admin' && (
                    <button
                      type="button"
                      className="wm-menu-item"
                      style={{ color: 'var(--brand-primary)', fontWeight: '900' }}
                      onClick={() => {
                        setOpen(false)
                        navigate('/admin')
                      }}
                    >
                      🛡️ Espace Admin
                    </button>
                  )}
                  <button
                    type="button"
                    className="wm-menu-item"
                    onClick={() => {
                      setOpen(false)
                      navigate('/profile')
                    }}
                  >
                    {t('header.myProfile')}
                  </button>
                  <button
                    type="button"
                    className="wm-menu-item danger"
                    onClick={() => {
                      setOpen(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="wm-auth-links">
              <NavLink className="wm-link-btn" to="/register">{t('common.register')}</NavLink>
              <NavLink className="wm-link-btn primary" to="/login">{t('common.login')}</NavLink>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        </div>

        {/* Mobile controls (hamburger menu + quick toggles) */}
        <div className="md:hidden flex items-center gap-2">
          <button 
            type="button" 
            className="wm-lang-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <LanguageSelector />
          <button
            type="button"
            className="text-2xl px-2 py-1 focus:outline-none leading-none hover:opacity-75 transition-opacity"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1999] transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar Panel */}
          <div 
            className="fixed inset-y-0 right-0 w-[280px] h-full shadow-2xl z-[2000] p-6 flex flex-col justify-between transition-transform duration-300 transform translate-x-0 bg-white dark:bg-slate-900"
            style={{ 
              backgroundColor: isDarkMode ? '#111827' : '#ffffff', 
              borderLeft: '1px solid var(--border-main)',
            }}
          >
            <div className="space-y-8">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between">
                <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-heading)' }}>
                  Menu
                </span>
                <button
                  type="button"
                  className="text-xl p-2 font-bold hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links inside drawer */}
              <nav className="flex flex-col gap-2">
                <NavLink 
                  className={({ isActive }) => `px-4 py-3 rounded-xl font-bold transition-all text-base no-underline ${isActive ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
                >
                  {t('common.home')}
                </NavLink>
                <NavLink 
                  className={({ isActive }) => `px-4 py-3 rounded-xl font-bold transition-all text-base no-underline ${isActive ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                  to="/health"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
                >
                  {t('common.health')}
                </NavLink>
                <NavLink 
                  className={({ isActive }) => `px-4 py-3 rounded-xl font-bold transition-all text-base no-underline ${isActive ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                  to="/physical-activity"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
                >
                  {t('common.physicalActivity')}
                </NavLink>
                <NavLink 
                  className={({ isActive }) => `px-4 py-3 rounded-xl font-bold transition-all text-base no-underline ${isActive ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} 
                  to="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
                >
                  {t('common.events')}
                </NavLink>
              </nav>
            </div>

            {/* Auth / Account Section at the bottom of the drawer */}
            <div className="pt-6 border-t" style={{ borderColor: 'var(--border-main)' }}>
              {me ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="wm-avatar text-sm">{initials(displayName)}</span>
                    <div>
                      <p className="font-black text-sm text-ellipsis overflow-hidden max-w-[170px] whitespace-nowrap m-0" style={{ color: 'var(--text-heading)' }}>
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 capitalize m-0 mt-0.5">{me.role}</p>
                    </div>
                  </div>

                  {me?.role === 'admin' && (
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-black transition-colors"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        navigate('/admin')
                      }}
                    >
                      Espace Admin
                    </button>
                  )}

                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/profile')
                    }}
                  >
                    {t('header.myProfile')}
                  </button>

                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <NavLink 
                    className="w-full text-center py-3 rounded-xl font-extrabold transition-colors border no-underline"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-primary)' }}
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.register')}
                  </NavLink>
                  <NavLink 
                    className="w-full text-center py-3 rounded-xl font-extrabold text-white transition-all no-underline"
                    style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-action))' }}
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.login')}
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
