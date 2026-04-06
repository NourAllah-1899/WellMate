import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json' // Not used anymore but kept file
import api from '../api/client.js'

const LanguageContext = createContext()

const translations = {
  en,
  fr,
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(true)

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved && translations[saved]) {
      setLanguage(saved)
      document.documentElement.lang = saved
      document.documentElement.dir = 'ltr'
    }
    setLoading(false)
  }, [])

  const changeLanguage = async (newLanguage) => {
    if (!translations[newLanguage]) return

    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    document.documentElement.lang = newLanguage
    document.documentElement.dir = 'ltr'

    // Save to database if user is authenticated
    try {
      await api.put('/api/auth/language', { language: newLanguage })
    } catch (err) {
      console.error('Failed to save language preference:', err)
    }
  }

  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return value || key
  }, [language])

  const translate = useCallback((key, replacements = {}) => {
    let text = t(key)
    
    // Replace placeholders
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, value)
    })
    
    return text
  }, [t])

  const contextValue = useMemo(() => ({
    language,
    changeLanguage,
    t: translate,
    translations,
  }), [language, changeLanguage, translate])

  if (loading) {
    return null
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
