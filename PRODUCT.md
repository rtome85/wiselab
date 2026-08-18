# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

International students of any level (middle school through university), self-directed and studying independently, working in math, physics, or chemistry. Not anchored to one country — the product supports five interface/lesson languages (EN, PT, ES, FR, DE) rather than defaulting to a single locale's audience. They arrive stuck on a specific problem (homework, exam prep, a worksheet) and want to understand it, not just see the final answer.

## Product Purpose

WiseLab turns a single math/science problem — typed or photographed — into an interactive, step-by-step lesson the student works through themselves. Success means the student ends the lesson understanding the reasoning, not just holding an answer.

## Positioning

Lessons are gated: steps unlock one at a time, and inline multiple-choice challenges must be answered correctly before the next step is revealed. This is WiseLab's mechanism, not incidental UI — it is what a plain "explain this problem" chatbot prompt cannot truthfully claim to do, since a chat response exposes everything at once and lets a student skip straight to the final answer. "Simplify for me" (on-demand analogy) and the "I'm confused" assistant exist to unstick a student without breaking the gate — they never reveal the answer directly.

## Operating Context

- Student opens WiseLab, types a problem or uploads/drags one or more photos of an exercise sheet (multi-image OCR, extracted texts combined into a single lesson).
- Picks a subject (math / physics / chemistry) and, in Settings, a language and difficulty (beginner / intermediate / advanced).
- Works through the generated lesson step by step; challenges every 3-4 steps gate progress.
- Can ask for a simpler explanation or open a conversational "I'm confused" hint flow at any step, without it revealing the answer.
- Sees the final answer and a real-world application only after completing all steps.
- Past lessons are saved locally and can be reopened from a history drawer, or exported (copy/download as text).

## Capabilities and Constraints

- No backend, no database, no accounts — all persistence is `localStorage` (lesson history, settings, API key).
- Each user supplies their own Ollama Cloud API key at runtime via the Settings drawer; the built bundle ships no credentials. This BYO-key, no-auth model is open — not yet confirmed as a permanent constraint the product must keep (see Evidence/undecided below).
- Lesson generation model is configurable (`VITE_OLLAMA_MODEL`, defaults to a Gemini-family Ollama Cloud model); the vision/OCR model is fixed in code, not user-configurable.
- Lesson responses are validated against a strict JSON schema (title, sequential steps with explanation/formula/visual/tip/optional challenge, final answer, real-world application) before rendering.

## Evidence on Hand

None. No real testimonials, case studies, benchmarks, or press exist yet — future work must not fabricate them. No logo or brand guide beyond the "WiseLab" name and the visual system already in the codebase.

## Product Principles

1. Understanding over answers: every mechanic (step-gating, hint assistant, simplify) protects the student from shortcutting to the final answer before reasoning through it.
2. No account, no backend: the product works entirely client-side with a user-supplied API key; don't introduce server-side state as a default solution.
3. Input flexibility: typing and photographing a problem are equally first-class paths into a lesson.
4. Language and difficulty are user-controlled, not assumed — the product serves learners across levels and languages, not one fixed curriculum.

## Open / Undecided

- Monetization model: unconfirmed. BYO-key/no-backend is the current architecture but not yet locked in as a permanent business constraint — could change if a hosted/paid tier is introduced later.
- No accessibility standard has been established as a product requirement yet.
