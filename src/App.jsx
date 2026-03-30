import { useState } from 'react'
import { Settings } from 'lucide-react'
import { getAccentClasses } from './components/SubjectSelector'
import { ProblemInput } from './components/ProblemInput'
import { LessonView } from './components/LessonView'
import { HistoryDrawer } from './components/HistoryDrawer'
import { SettingsDrawer } from './components/SettingsDrawer'
import { useLesson } from './hooks/useLesson'
import { useHistory } from './hooks/useHistory'
import { useApiKey } from './hooks/useApiKey'

const accentClasses = getAccentClasses('math')

export default function App() {
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const {
    lesson, loading, progress, error,
    activeStep, completedSteps, showAnswer,
    challengeCompleted, canProceed,
    generate, restore, nextStep, reset, completeChallenge,
  } = useLesson()

  const { history, saveLesson, deleteLesson, clearHistory } = useHistory()
  const { apiKey, setApiKey, clearApiKey, hasEnvKey, isConfigured } = useApiKey()

  function handleSubmit(problem) {
    generate(problem, (lessonData) => {
      saveLesson({
        id: Date.now().toString(),
        problem,
        lesson: lessonData,
        createdAt: new Date().toISOString(),
      })
    })
  }

  function handleRestore(entry) {
    restore(entry.lesson)
  }

  const isIdle = !lesson && !loading && !error

  return (
    <div className="min-h-dvh flex flex-col">

      {/* Static radial glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${accentClasses.gradientBg} 0%, transparent 65%)`,
        }}
      />

      {/* History drawer */}
      <HistoryDrawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleRestore}
        onDelete={deleteLesson}
        onClear={clearHistory}
      />

      {/* Settings drawer */}
      <SettingsDrawer
        open={showSettings}
        onOpenChange={setShowSettings}
        apiKey={apiKey}
        onSetApiKey={setApiKey}
        onClearApiKey={clearApiKey}
        hasEnvKey={hasEnvKey}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#07070c]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white/90 text-sm tracking-tight">
              WiseLab
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              aria-label="Abrir histórico de lições"
              className="relative w-8 h-8 rounded-xl flex items-center justify-center
                         text-white/35 hover:text-white/70 hover:bg-white/8
                         transition-colors duration-150 focus-ring"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {history.length > 0 && (
                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
              className="w-8 h-8 rounded-xl flex items-center justify-center
                         text-white/35 hover:text-white/70 hover:bg-white/8
                         transition-colors duration-150 focus-ring"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Warning banner for missing API key ── */}
        {isIdle && !isConfigured && (
          <div className="mb-6">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-amber-400 font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-amber-300 text-sm font-semibold mb-1">API Key Required</p>
                <p className="text-amber-400/60 text-xs leading-relaxed">
                  Add your Ollama Cloud API key in settings to start generating lessons.
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors flex-shrink-0"
              >
                Configure
              </button>
            </div>
          </div>
        )}

        {/* ── Hero + input ── */}
        {(isIdle || (loading && !lesson)) && (
          <div className="mb-10 space-y-8">
            <div className="space-y-3">
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentClasses.text}`}>
                Tutor de IA
              </p>
              <h1 className="font-mono font-bold text-3xl sm:text-4xl text-white leading-tight tracking-tight">
                Qual é o teu
                <br />
                <span className={accentClasses.text}>problema?</span>
              </h1>
              <p className="text-white/35 text-sm sm:text-base leading-relaxed max-w-md">
                Descreve o que precisas de aprender — a IA gera uma lição interativa passo a passo.
              </p>
            </div>

            <ProblemInput
              onSubmit={handleSubmit}
              onCancel={reset}
              loading={loading}
              accentClasses={accentClasses}
            />
          </div>
        )}

        {/* ── Error state ── */}
        {error && !lesson && (
          <div className="space-y-5 mb-8">
            <div className="rounded-2xl border border-red-500/25 bg-red-500/8 p-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-red-400 font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-300 text-sm font-semibold mb-1">Erro ao gerar a lição</p>
                  <p className="text-red-400/60 text-xs leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/65 transition-colors focus-ring"
            >
              <span>↩</span>
              <span>Tentar novamente</span>
            </button>
          </div>
        )}

        {/* ── Lesson ── */}
        <LessonView
          lesson={lesson}
          loading={loading}
          progress={progress}
          error={null}
          activeStep={activeStep}
          completedSteps={completedSteps}
          showAnswer={showAnswer}
          challengeCompleted={challengeCompleted}
          canProceed={canProceed}
          onNextStep={nextStep}
          onReset={reset}
          onCompleteChallenge={completeChallenge}
          accentClasses={accentClasses}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-white/15">© 2025 WiseLab</span>
          <span className="text-xs text-white/15">
            Powered by Ollama · usar proxy em produção
          </span>
        </div>
      </footer>
    </div>
  )
}