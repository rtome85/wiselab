import { createContext, useContext, useState, useCallback } from 'react'
import { getSettings, saveSettings } from '../lib/ollama'
import { en } from './locales/en'
import { pt } from './locales/pt'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { de } from './locales/de'

const LOCALES = { EN: en, PT: pt, ES: es, FR: fr, DE: de }

// Map browser language codes (BCP 47 prefix) to our language codes
const BROWSER_LANG_MAP = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR', de: 'DE' }

export const DATE_LOCALES = {
  PT: 'pt-PT',
  EN: 'en-GB',
  ES: 'es-ES',
  FR: 'fr-FR',
  DE: 'de-DE',
}

function detectBrowserLanguage() {
  const nav = navigator.language || navigator.languages?.[0] || 'en'
  const prefix = nav.slice(0, 2).toLowerCase()
  return BROWSER_LANG_MAP[prefix] || 'EN'
}

function resolvePath(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = getSettings().language
    // If stored language is the default (PT from env default), treat it as stored
    // but if nothing is stored yet, fall back to browser locale
    if (stored) return stored
    return detectBrowserLanguage()
  })

  const setLanguage = useCallback((code) => {
    setLanguageState(code)
    saveSettings({ ...getSettings(), language: code })
  }, [])

  const t = useCallback((key, vars = {}) => {
    const locale = LOCALES[language] ?? LOCALES.EN
    let str = resolvePath(locale, key) ?? resolvePath(LOCALES.EN, key) ?? key
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      str
    )
  }, [language])

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
