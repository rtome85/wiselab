import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getSettings, saveSettings, hasStoredSettings } from '../lib/ollama'
import { BROWSER_LANG_MAP, LOCALES } from '../constants/i18n'

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
    if (hasStoredSettings()) return getSettings().language
    return detectBrowserLanguage()
  })

  const setLanguage = useCallback((code) => {
    setLanguageState(code)
    saveSettings({ ...getSettings(), language: code })
  }, [])

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase()
  }, [language])

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
