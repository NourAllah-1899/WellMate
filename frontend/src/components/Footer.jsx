import { NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import logoLight from '../assets/WellMate_light.png'
import logoDark from '../assets/WellMate_dark.png'

export default function Footer() {
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()

  return (
    <footer className="wm-footer">
      <div className="wm-footer-inner">
        <div className="wm-footer-grid">
          {/* Brand Section */}
          <div className="wm-footer-brand">
            <img 
              src={isDarkMode ? logoDark : logoLight} 
              alt="WellMate" 
              className="wm-footer-logo" 
            />
            <p className="wm-footer-desc">
              {t('footer.aboutDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="wm-footer-links">
            <h4>{t('footer.quickLinks')}</h4>
            <nav>
              <NavLink to="/">{t('common.home')}</NavLink>
              <NavLink to="/health">{t('common.health')}</NavLink>
              <NavLink to="/physical-activity">{t('common.physicalActivity')}</NavLink>
              <NavLink to="/events">{t('common.events')}</NavLink>
            </nav>
          </div>

          {/* Contact Section */}
          <div className="wm-footer-contact" id="contact">
            <h4>{t('footer.contactUs')}</h4>
            <ul>
              <li>
                <span className="icon">📍</span>
                {t('footer.address')}
              </li>
              <li>
                <span className="icon">📞</span>
                <a href={`tel:${t('footer.phone')}`}>{t('footer.phone')}</a>
              </li>
              <li>
                <span className="icon">✉️</span>
                <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="wm-footer-bottom">
          <p>&copy; {new Date().getFullYear()} WellMate. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
