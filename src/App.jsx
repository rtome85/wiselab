import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Settings } from "lucide-react";
import { DEFAULT_ACCENT_CLASSES } from "./constants/subjects";
import { ProblemInput } from "./components/ProblemInput";
import { LessonView } from "./components/LessonView";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { ThemeToggle } from "./components/ThemeToggle";
import { useLesson } from "./hooks/useLesson";
import { useHistory } from "./hooks/useHistory";
import { useApiKey } from "./hooks/useApiKey";
import { useTheme } from "./hooks/useTheme";
import { useI18n } from "./i18n/index.jsx";

export default function App() {
  const { t } = useI18n();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    lesson,
    loading,
    progress,
    error,
    activeStep,
    maxStepReached,
    completedSteps,
    showAnswer,
    challengeCompleted,
    canProceed,
    generate,
    restore,
    nextStep,
    goToStep,
    reset,
    completeChallenge,
  } = useLesson();

  const { history, saveLesson, deleteLesson, clearHistory } = useHistory();
  const { apiKey, setApiKey, clearApiKey, isConfigured } = useApiKey();

  function handleSubmit(problem) {
    generate(problem, (lessonData) => {
      saveLesson({
        id: Date.now().toString(),
        problem,
        lesson: lessonData,
        createdAt: new Date().toISOString(),
      });
    });
  }

  function handleRestore(entry) {
    restore(entry.lesson);
  }

  const isIdle = !lesson && !loading && !error;

  return (
    <div className="min-h-dvh flex flex-col bg-app">
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
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-header backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-[14px] flex items-center justify-center bg-accent-soft dark:bg-gradient-to-b dark:from-[var(--color-logo-from)] dark:to-[var(--color-logo-to)]">
              <img src="/logo.png" alt="" className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-ink text-sm tracking-tight">
              WiseLab
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              aria-label={t("app.openHistory")}
              className="relative w-9 h-9 rounded-[14px] flex items-center justify-center
                         bg-surface border border-border text-muted
                         hover:text-ink transition-colors duration-150 focus-ring"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <circle
                  cx="8"
                  cy="8"
                  r="6.25"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path
                  d="M8 5v3.5l2 1.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {history.length > 0 && (
                <span
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${DEFAULT_ACCENT_CLASSES.dot}`}
                />
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              aria-label={t("app.openSettings")}
              className="w-9 h-9 rounded-[14px] flex items-center justify-center
                         bg-surface border border-border text-muted
                         hover:text-ink transition-colors duration-150 focus-ring"
            >
              <Settings className="w-4 h-4" />
            </button>

            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        {/* ── Warning banner for missing API key ── */}
        {isIdle && !isConfigured && (
          <div className="mb-6">
            <div className="rounded-3xl border border-red-500/25 bg-red-500/8 p-4 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">
                  {t("app.apiKeyRequired")}
                </p>
                <p className="text-red-700 dark:text-red-300 text-xs leading-relaxed">
                  {t("app.apiKeyRequiredDesc")}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-xs text-accent hover:opacity-80 font-medium transition-opacity flex-shrink-0"
              >
                {t("app.configure")}
              </button>
            </div>
          </div>
        )}

        {/* ── Hero + input ── */}
        {(isIdle || (loading && !lesson)) && (
          <div className="mb-10 space-y-8">
            <div className="space-y-3">
              <p
                className={`text-xs font-extrabold uppercase tracking-[0.2em] ${DEFAULT_ACCENT_CLASSES.text}`}
              >
                {t("app.aiTutor")}
              </p>
              <h1 className="font-extrabold text-3xl sm:text-4xl text-ink leading-tight tracking-tight">
                {t("app.heroTitle1")}
                <br />
                <span className={DEFAULT_ACCENT_CLASSES.text}>
                  {t("app.heroTitle2")}
                </span>
              </h1>
              <p className="text-muted text-sm sm:text-base leading-relaxed max-w-md">
                {t("app.heroDesc")}
              </p>
            </div>

            <ProblemInput
              onSubmit={handleSubmit}
              onCancel={reset}
              loading={loading}
              accentClasses={DEFAULT_ACCENT_CLASSES}
            />
          </div>
        )}

        {/* ── Error state ── */}
        {error && !lesson && (
          <div className="space-y-5 mb-8">
            <div role="alert" className="rounded-3xl border border-red-500/25 bg-red-500/8 p-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">
                    {t("app.errorTitle")}
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-xs leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors focus-ring"
            >
              <span>↩</span>
              <span>{t("app.tryAgain")}</span>
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
          maxStepReached={maxStepReached}
          completedSteps={completedSteps}
          showAnswer={showAnswer}
          challengeCompleted={challengeCompleted}
          canProceed={canProceed}
          onNextStep={nextStep}
          onGoToStep={goToStep}
          onReset={reset}
          onCompleteChallenge={completeChallenge}
          accentClasses={DEFAULT_ACCENT_CLASSES}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-muted">
            © {new Date().getFullYear()} WiseLab
          </span>
          <span className="text-xs text-muted">
            {t("app.footerPowered")}
          </span>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
