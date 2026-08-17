export const DEFAULT_MODEL = 'gemini-3-flash-preview:cloud'

export const ESTIMATED_LESSON_CHARS = 1500

export const DEFAULT_SETTINGS = { language: 'PT', difficulty: 'intermediate' }

export const LANGUAGE_OPTIONS = [
  { code: 'PT', label: 'PT', title: 'Português' },
  { code: 'EN', label: 'EN', title: 'English' },
  { code: 'ES', label: 'ES', title: 'Español' },
  { code: 'FR', label: 'FR', title: 'Français' },
  { code: 'DE', label: 'DE', title: 'Deutsch' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', tKey: 'settings.beginner' },
  { value: 'intermediate', tKey: 'settings.intermediate' },
  { value: 'advanced', tKey: 'settings.advanced' },
]

export const LANGUAGE_NAMES = {
  PT: 'European Portuguese (Portugal). Do not use Brazilian Portuguese variants.',
  EN: 'English.',
  ES: 'Spanish (Castilian).',
  FR: 'French.',
  DE: 'German.',
}

export const DIFFICULTY_INSTRUCTIONS = {
  beginner: 'Use simple language, avoid technical jargon, and rely on everyday analogies. Target audience: middle school student.',
  intermediate: 'Use clear explanations with moderate technical terms. Target audience: high school or early university student.',
  advanced: 'Use precise technical language and include deeper mathematical or conceptual rigour. Target audience: university or advanced student.',
}
