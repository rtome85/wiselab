import { Sun, Moon } from 'lucide-react'
import { useI18n } from '../i18n/index.jsx'

export function ThemeToggle({ theme, onToggle }) {
  const { t } = useI18n()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? t('app.switchToLightMode') : t('app.switchToDarkMode')}
      className="w-9 h-9 rounded-[14px] flex items-center justify-center
                 bg-surface border border-border text-muted
                 hover:text-ink transition-colors duration-150 focus-ring"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
