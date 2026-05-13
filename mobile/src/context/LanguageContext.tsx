import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'fr' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, paramsOrFallback?: Record<string, any> | string, params?: Record<string, any>) => string;
};

const translations: Record<Language, any> = {
  fr: require('../locales/fr.json'),
  en: require('../locales/en.json'),
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang === 'en' || savedLang === 'fr') {
        setLanguageState(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const t = (path: string, paramsOrFallback?: Record<string, any> | string, params?: Record<string, any>) => {
    const fallback = typeof paramsOrFallback === 'string' ? paramsOrFallback : undefined;
    const replacements = (typeof paramsOrFallback === 'object' && paramsOrFallback !== null)
      ? paramsOrFallback
      : (params && typeof params === 'object' ? params : undefined);

    const keys = path.split('.');
    let value = translations[language];
    
    for (const key of keys) {
      value = value?.[key];
    }

    if (typeof value !== 'string') return fallback ?? path;

    if (replacements) {
      Object.entries(replacements).forEach(([key, val]) => {
        value = (value as string).replace(`{${key}}`, String(val));
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
