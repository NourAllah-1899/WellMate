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

        <nav className="wm-nav-center" aria-label="Main navigation">
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/">{t('common.home')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/health">{t('common.health')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/physical-activity">{t('common.physicalActivity')}</NavLink>
          <NavLink className={({ isActive }) => `wm-nav-link ${isActive ? 'is-active' : ''}`} to="/events">{t('common.events')}</NavLink>
        </nav>

        <div className="wm-auth">
          {me ? (
            <div className="wm-user" ref={menuRef}>
              <button className="wm-user-btn" type="button" onClick={() => setOpen((v) => !v)}>
                <span className="wm-avatar" aria-hidden="true">{initials(displayName)}</span>
                <span className="wm-user-name">{displayName}</span>
              </button>

              {open ? (
                <div className="wm-menu" role="menu">
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
      </div>
    </header>
  )
}
