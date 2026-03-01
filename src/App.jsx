import { useState } from 'react'
import { SubjectSelector, getAccentClasses } from './components/SubjectSelector'
import { ProblemInput } from './components/ProblemInput'
import { LessonView } from './components/LessonView'
import { useLesson } from './hooks/useLesson'

export default function App() {
  const [subject, setSubject] = useState('math')
  const {
    lesson, loading, error,
    activeStep, completedSteps, showAnswer,
    generate, nextStep, reset,
  } = useLesson()

  const accentClasses = getAccentClasses(subject)

  function handleSubmit(problem) {
    generate(subject, problem)
  }

  const isIdle = !lesson && !loading && !error

  return (
    <div className="min-h-dvh flex flex-col">

      {/* Dynamic radial glow — transitions per subject */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${accentClasses.gradientBg} 0%, transparent 65%)`,
          transition: 'background 800ms ease',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#07070c]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white/90 text-sm tracking-tight">
              WiseLab
            </span>
            {/* Active subject badge */}
            <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest ${accentClasses.badge}`}>
              {subject === 'math' ? 'Matemática' : subject === 'physics' ? 'Física' : 'Química'}
            </span>
          </div>

          <SubjectSelector subject={subject} onChange={setSubject} />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Hero + input ── */}
        {(isIdle || (loading && !lesson)) && (
          <div className="mb-10 space-y-8">
            {/* Typographic hero */}
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
              loading={loading}
              accentClasses={accentClasses}
            />
          </div>
        )}

        {/* ── Error state (no lesson) ── */}
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
          error={null}
          activeStep={activeStep}
          completedSteps={completedSteps}
          showAnswer={showAnswer}
          onNextStep={nextStep}
          onReset={reset}
          accentClasses={accentClasses}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-white/15">
            © 2025 WiseLab
          </span>
          <span className="text-xs text-white/15">
            Powered by Ollama · chave exposta no bundle — usar proxy em produção
          </span>
        </div>
      </footer>
    </div>
  )
}
