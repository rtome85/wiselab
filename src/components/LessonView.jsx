import { StepCard } from './StepCard'
import { FinalAnswer } from './FinalAnswer'
import { ProgressBar } from './ProgressBar'

const PHASES = [
  { max: 20, label: 'A analisar o problema...' },
  { max: 50, label: 'A estruturar os passos...' },
  { max: 80, label: 'A gerar explicações...' },
  { max: 99, label: 'A finalizar a lição...' },
  { max: 100, label: 'Pronto!' },
]

function GeneratingView({ progress = 0, accentClasses }) {
  const phase = PHASES.find((p) => progress <= p.max)?.label ?? 'A gerar...'

  return (
    <div className="animate-fadeIn rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">{phase}</p>
        <span className={`text-sm font-mono font-semibold tabular-nums ${accentClasses.text}`}>
          {progress}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${accentClasses.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/8 p-5 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] text-red-400 font-bold">!</span>
        </div>
        <div>
          <p className="text-red-300 text-sm font-semibold mb-1">Erro ao gerar a lição</p>
          <p className="text-red-400/60 text-xs leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  )
}

export function LessonView({
  lesson,
  loading,
  progress = 0,
  error,
  activeStep,
  completedSteps,
  showAnswer,
  onNextStep,
  onReset,
  accentClasses,
}) {
  if (loading) return <GeneratingView progress={progress} accentClasses={accentClasses} />
  if (error) return <ErrorCard message={error} />
  if (!lesson) return null

  const totalSteps = lesson.steps.length
  const completedCount = completedSteps.size

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Lesson title + progress */}
      <div className="space-y-4">
        <h2 className="text-white/90 font-semibold text-lg leading-snug">{lesson.title}</h2>
        <ProgressBar
          current={completedCount}
          total={totalSteps}
          accentClasses={accentClasses}
        />
      </div>

      {/* Steps — vertical stepper layout */}
      <div className="relative space-y-3">
        {/* Vertical connector line behind the cards */}
        <div className="absolute left-[22px] top-7 bottom-7 w-px bg-white/[0.07] pointer-events-none" />

        {lesson.steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            isActive={index === activeStep && !showAnswer}
            isCompleted={completedSteps.has(index)}
            accentClasses={accentClasses}
          />
        ))}
      </div>

      {/* Next step button */}
      {!showAnswer && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onNextStep}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                        transition-all duration-200 focus-ring shadow-lg
                        ${accentClasses.button} ${accentClasses.glow}`}
          >
            {activeStep < totalSteps - 1 ? (
              <>Próximo passo <span className="opacity-70">→</span></>
            ) : (
              <>Ver resposta final <span className="opacity-70">→</span></>
            )}
          </button>
        </div>
      )}

      {/* Final answer */}
      {showAnswer && (
        <FinalAnswer
          lesson={lesson}
          accentClasses={accentClasses}
          onReset={onReset}
        />
      )}
    </div>
  )
}
