import { StepCard } from './StepCard'
import { FinalAnswer } from './FinalAnswer'
import { ProgressBar } from './ProgressBar'

/* Skeleton loading — skeleton screens > spinners (component.gallery best practice) */
function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full skeleton flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2.5 pt-0.5">
          <div className="h-3 rounded skeleton w-3/5" />
          <div className="h-2 rounded skeleton w-full" />
          <div className="h-2 rounded skeleton w-4/5" />
          <div className="h-2 rounded skeleton w-2/3" />
        </div>
      </div>
    </div>
  )
}

function SkeletonView() {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-4 rounded skeleton w-2/5" />
        <div className="h-0.5 rounded skeleton w-full mt-3" />
      </div>
      <SkeletonCard delay={0} />
      <SkeletonCard delay={80} />
      <SkeletonCard delay={160} />
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
  error,
  activeStep,
  completedSteps,
  showAnswer,
  onNextStep,
  onReset,
  accentClasses,
}) {
  if (loading) return <SkeletonView />
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
