import { StepCard, CollapsedStepCard } from './StepCard'
import { collapsedOverlap } from '../lib/collapsedStepLayout'
import { FinalAnswer } from './FinalAnswer'
import { ProgressBar } from './ProgressBar'
import { useI18n } from '../i18n/useI18n'

function GeneratingView({ progress = 0, accentClasses }) {
  const { t } = useI18n()
  const PHASES = [
    { max: 20, label: t('lesson.phase1') },
    { max: 50, label: t('lesson.phase2') },
    { max: 80, label: t('lesson.phase3') },
    { max: 99, label: t('lesson.phase4') },
    { max: 100, label: t('lesson.phase5') },
  ]
  const phase = PHASES.find((p) => progress <= p.max)?.label ?? t('lesson.generating')

  return (
    <div className="animate-fadeIn rounded-3xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">{phase}</p>
        <span className={`text-sm font-semibold tabular-nums ${accentClasses.text}`}>
          {progress}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-accent-soft overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${accentClasses.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function ErrorCard({ message }) {
  const { t } = useI18n()
  return (
    <div className="rounded-3xl border border-red-500/25 bg-red-500/8 p-5 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">!</span>
        </div>
        <div>
          <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">{t('lesson.error')}</p>
          <p className="text-red-600/80 dark:text-red-400/70 text-xs leading-relaxed">{message}</p>
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
  maxStepReached,
  completedSteps,
  showAnswer,
  challengeCompleted,
  canProceed,
  onNextStep,
  onGoToStep,
  onReset,
  onCompleteChallenge,
  accentClasses,
}) {
  const { t } = useI18n()

  if (loading) return <GeneratingView progress={progress} accentClasses={accentClasses} />
  if (error) return <ErrorCard message={error} />
  if (!lesson) return null

  const totalSteps = lesson.steps.length
  const completedCount = completedSteps.size

  // Steps already visited before the active one (fanned above it) and steps already visited
  // after it — including the step you were just on — fanned below it after navigating back.
  const beforeIndices = Array.from({ length: activeStep }, (_, i) => i)
  const afterIndices = Array.from(
    { length: Math.max(maxStepReached - activeStep, 0) },
    (_, i) => activeStep + 1 + i
  )

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Lesson title + progress */}
      <div className="space-y-4">
        <h2 className="text-ink font-extrabold text-lg leading-snug">{lesson.title}</h2>
        <ProgressBar
          current={completedCount}
          total={totalSteps}
          accentClasses={accentClasses}
        />
      </div>

      {/* Steps — stacked deck layout: active card in the middle, completed cards fanned out
          above (earlier steps) and below (later steps you've already done but navigated away from) */}
      <div className="relative">
        {beforeIndices.map((index) => (
          <CollapsedStepCard
            key={index}
            step={lesson.steps[index]}
            index={index}
            depth={activeStep - index}
            isFirst={index === 0}
            side="above"
            isCompleted={completedSteps.has(index)}
            accentClasses={accentClasses}
            onClick={() => onGoToStep?.(index)}
          />
        ))}

        <div
          className="relative"
          style={{ zIndex: 50, marginTop: beforeIndices.length ? collapsedOverlap(1) : 0 }}
        >
          <StepCard
            step={lesson.steps[activeStep]}
            index={activeStep}
            isActive={!showAnswer}
            isCompleted={completedSteps.has(activeStep)}
            accentClasses={accentClasses}
            challengeCompleted={challengeCompleted}
            onCompleteChallenge={onCompleteChallenge}
          />
        </div>

        {afterIndices.map((index) => (
          <CollapsedStepCard
            key={index}
            step={lesson.steps[index]}
            index={index}
            depth={index - activeStep}
            isFirst={false}
            side="below"
            isCompleted={completedSteps.has(index)}
            accentClasses={accentClasses}
            onClick={() => onGoToStep?.(index)}
          />
        ))}
      </div>

      {/* Next step button */}
      {!showAnswer && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onNextStep}
            disabled={!canProceed?.(activeStep)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-sm font-semibold text-white
                        transition-all duration-200 focus-ring shadow-lg
                        ${canProceed?.(activeStep)
                          ? `${accentClasses.button} ${accentClasses.glow}`
                          : 'bg-control text-faint cursor-not-allowed'
                        }`}
          >
            {activeStep < totalSteps - 1 ? (
              <>{t('lesson.nextStep')} <span className="opacity-70">→</span></>
            ) : (
              <>{t('lesson.viewAnswer')} <span className="opacity-70">→</span></>
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
