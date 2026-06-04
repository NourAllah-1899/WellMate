import { useTheme } from '../context/ThemeContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'

export default function AuthLayout({ children }) {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className="wm-auth-layout">
      <div className="wm-auth-topbar">
        <div className="wm-auth-toggles">
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
      <main className="wm-auth-main">
        {children}
      </main>
    </div>
  )
}
