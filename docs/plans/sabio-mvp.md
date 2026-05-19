# Implementation Plan: Sábio MVP

## Overview

Build a Duolingo-inspired e-learning platform for Portuguese high school
students. Two profiles (student / professor), classroom-scoped, with an
AI content studio for professors and a map-style learning experience for
students. Spec: `docs/specs/sabio.md`.

## Architecture Decisions

- **Vertical slices over horizontal layers** — each phase delivers a
  working, testable user flow, not a partial layer.
- **Professor studio is built before student map** — content must exist
  before consumption. Studio validates the Ollama prompt strategy early.
- **Ollama path generation is the highest-risk item** — it is a phase of
  its own (Phase 2) with an explicit spike task before any UI is built.
  If the JSON output is unreliable, we catch it before investing in the
  studio UI.
- **Auth is Phase 1** — every subsequent task depends on knowing who the
  user is and their role.
- **Cookie-based auth, no token passing** — server functions read the
  session from request cookies via `createUserClient()` (`@supabase/ssr`
  + `getRequest()`). No `accessToken` is ever passed explicitly between
  client and server. Route loaders (`loader` + `useLoaderData`) replace
  `useEffect` data fetching, eliminating loading flash and enabling SSR.
  Branch: `refactor/auth-route-loaders`.
- **RLS helpers are `SECURITY DEFINER`** — `professor_class_ids()`,
  `my_class_ids()`, and `my_published_class_ids()` bypass RLS internally
  to prevent circular policy evaluation (classes ↔ class_members).
  Migration: `003_fix_rls_recursion.sql`.

---

## Task List

### Phase 1: Foundation

---

#### Task 1: Scaffold project

**Description:** Create a new TanStack Start project from the official
template. Set up Tailwind CSS v3 with WiseLab design tokens (background
`#07070c`, Space Mono + DM Sans fonts, card conventions). Configure
TypeScript strict mode and ESLint.

**Acceptance criteria:**
- [x] `npm run dev` starts without errors on `localhost:3000`
- [x] `npm run build` and `npm run typecheck` pass clean
- [x] Background is `#07070c`, Space Mono renders in headings
- [x] Tailwind `rounded-2xl bg-white/[0.04] backdrop-blur-sm` card class
      produces visible output

**Verification:**
- [x] `npm run typecheck` — zero errors
- [x] `npm run build` — zero errors
- [x] Manual: open browser, confirm dark background + fonts

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `app.config.ts`
- `tsconfig.json`
- `app/styles/index.css`
- `app/routes/__root.tsx`

**Estimated scope:** Medium

---

#### Task 2: Supabase schema + types

**Description:** Initialise Supabase locally. Write and apply the full
migration from the spec (7 tables: `profiles`, `classes`, `class_members`,
`nodes`, `exercises`, `student_progress`, `streaks`). Add RLS policies.
Generate TypeScript types.

**Acceptance criteria:**
- [x] `npx supabase start` runs the local stack
- [x] `npx supabase db push` applies the migration without errors
- [x] RLS: students can only read nodes/exercises for classes they belong to
- [x] RLS: professors can only read/write their own classes
- [x] `supabase.types.ts` is generated and committed

**Verification:**
- [x] `npx supabase db push` — no errors
- [x] Manual: Supabase Studio → confirm all 7 tables exist with correct columns
- [x] `npm run typecheck` — types resolve without errors

**Dependencies:** Task 1

**Files likely touched:**
- `supabase/migrations/001_initial_schema.sql`
- `app/lib/supabase.ts`
- `app/lib/supabase.server.ts`
- `app/lib/supabase.types.ts`

**Estimated scope:** Medium

---

#### Task 3: Auth — login / signup with role toggle

**Description:** Single auth page (`/`) with a student/professor toggle.
Sign-up form: email, password, display name. Students additionally enter
a class join code (validated against `classes` table on submit). On
success, insert into `profiles` with role and redirect to the appropriate
shell (`/student/$classId/aprende` or `/professor/dashboard`). Add auth
guard in `__root.tsx` to redirect unauthenticated users to `/`.

**Acceptance criteria:**
- [x] Professor can sign up → lands on `/professor/dashboard`
- [x] Student can sign up with a valid join code → lands on the class
      Aprende map
- [x] Student sign-up with an invalid/unknown join code shows an inline
      error and does not create an account
- [x] Logged-in user visiting `/` is redirected to their shell
- [x] Unauthenticated user visiting any protected route is redirected to `/`

**Verification:**
- [x] Manual: complete professor sign-up flow end-to-end
- [x] Manual: complete student sign-up with valid code end-to-end
- [x] Manual: student sign-up with bad code shows error, no account created
- [x] `npm run typecheck` — no errors

**Dependencies:** Task 2

**Files likely touched:**
- `app/routes/index.tsx`
- `app/routes/__root.tsx`
- `app/routes/student/_layout.tsx`
- `app/routes/professor/_layout.tsx`
- `app/lib/supabase.ts`

**Estimated scope:** Medium

---

### Checkpoint: Foundation ✅
- [x] `npm run typecheck` — clean
- [x] `npm run build` — clean
- [x] Auth round-trip works for both roles
- [x] **Review with human before proceeding to Phase 2**

---

### Phase 2: AI Path Generation (Spike)

> **Why a spike?** Ollama producing reliable structured JSON is the
> highest-risk assumption in the entire project. We validate it in
> isolation before building any UI around it.

---

#### Task 4: Ollama server function — generate path JSON

**Description:** Implement `app/server/ollama.ts` with a `generatePath`
server function. Input: `{ subject: string, topics: string[] }`. Output:
a validated `PathJSON` object (array of nodes, each with title, lesson
markdown, and 3–5 MCQ exercises). Design and iterate the prompt until
output passes the schema consistently across 5 Physics test runs.

`PathJSON` shape:
```ts
type PathJSON = {
  nodes: Array<{
    title: string
    content: string        // lesson markdown, ~200 words
    exercises: Array<{
      question: string
      options: Array<{ label: string; text: string; correct: boolean }>
      explanation: string
      needsImage: false    // always false at generation time
    }>
  }>
}
```

**Acceptance criteria:**
- [x] `generatePath({ subject: 'physics', topics: ['Cinemática', 'Dinâmica'] })`
      returns valid `PathJSON` with at least 2 nodes
- [x] Every exercise has exactly one `correct: true` option
- [x] Lesson content is in Portuguese
- [x] Function throws a typed error (not crashes) if Ollama is unreachable
- [x] API key (`OLLAMA_API_KEY`) is only read inside the server function —
      confirm by grepping client bundle for the key name

**Verification:**
- [x] Vitest: test `generatePath` with a mocked Ollama response, assert
      schema shape
- [x] Manual: call the function from a test route, inspect raw output for
      5 Physics topic sets
- [x] `grep -r "OLLAMA_API_KEY" dist/` — zero matches

**Dependencies:** Task 1

**Files likely touched:**
- `app/server/ollama.ts`
- `app/server/ollama.test.ts`

**Estimated scope:** Medium

---

#### Task 5: Gemini server function — generate image → Storage URL

**Description:** Implement `app/server/gemini.ts` with a `generateImage`
server function. Input: `{ prompt: string }`. Calls
`gemini-3.1-flash-image-preview`, receives base64 image, uploads to
Supabase Storage bucket `exercise-images`, returns the public URL.

**Acceptance criteria:**
- [x] `generateImage({ prompt: 'diagram of a simple pendulum, physics, clean white background, educational' })`
      returns a Supabase Storage public URL
- [x] Image is accessible via the returned URL without auth
- [x] `GEMINI_API_KEY` does not appear in the client bundle
- [x] Function throws a typed error if Gemini returns a non-image response

**Verification:**
- [x] Manual: call with 3 Physics prompts, confirm URLs resolve to images
- [x] Supabase Studio → Storage → `exercise-images` bucket contains uploads
- [x] `grep -r "GEMINI_API_KEY" dist/` — zero matches

**Dependencies:** Task 2

**Files likely touched:**
- `app/server/gemini.ts`
- `app/server/gemini.test.ts`
- `supabase/migrations/002_storage_bucket.sql`

**Estimated scope:** Small

---

### Checkpoint: AI Spike ✅
- [x] `generatePath` produces valid Portuguese Physics JSON reliably
- [x] `generateImage` returns accessible Storage URLs
- [x] Zero AI keys in client bundle (grep confirmed)
- [x] **Review AI output quality with human before building studio UI**

---

### Phase 3: Professor Studio

---

#### Task 6: Class creation

**Description:** Professor dashboard (`/professor/dashboard`) lists their
classes. "Nova turma" button opens `/professor/classes/new` — a form for
class name and subject. On submit: insert into `classes`, generate a
6-char alphanumeric join code, redirect to the class studio page. Display
the join code prominently on the studio page (copy button).

**Acceptance criteria:**
- [x] Professor can create a class and see the join code immediately
- [x] Join code is unique (retry on collision)
- [x] Empty class name is rejected with an inline error
- [x] Class appears in the professor dashboard list after creation

**Verification:**
- [x] Manual: create two classes, confirm different join codes
- [x] Manual: attempt empty form submit, confirm error
- [x] `npm run typecheck` — clean

**Dependencies:** Task 3

**Files likely touched:**
- `app/routes/professor/dashboard.tsx`
- `app/routes/professor/classes/new.tsx`
- `app/routes/professor/classes/$classId/studio.tsx`
- `app/server/classes.ts`

**Estimated scope:** Medium

---

#### Task 7: Path generation UI in studio

**Description:** On the studio page (unpublished class), show a topic
input UI — professor enters a comma-separated list of topics and clicks
"Gerar caminho". Calls `generatePath` server function, shows a loading
skeleton while waiting, then renders the generated nodes and exercises
in a reviewable list. Store the generated `PathJSON` in the `nodes` and
`exercises` tables.

**Acceptance criteria:**
- [x] Professor enters topics → clicks generate → skeleton appears →
      nodes render within ~30s
- [x] Each node shows: title, lesson content preview, exercise list
- [x] Generated content is persisted to DB (page reload retains it)
- [x] Error state shown if Ollama call fails (with retry button)

**Verification:**
- [x] Manual: generate a Physics path with 3 topics, reload page,
      confirm data persists
- [x] Supabase Studio → `nodes` and `exercises` tables contain rows
- [x] `npm run typecheck` — clean

**Dependencies:** Tasks 4, 6

**Files likely touched:**
- `app/routes/professor/classes/$classId/studio.tsx`
- `app/components/professor/PathStudio.tsx`
- `app/components/professor/NodeEditor.tsx`
- `app/server/classes.ts`

**Estimated scope:** Medium

---

#### Task 8: Image flagging + auto-generation

**Description:** Each exercise in the node editor has an "Adicionar
imagem" toggle. When toggled on, immediately call `generateImage` with an
auto-constructed prompt (`"{exercise question}, physics diagram, educational,
clean"`), show a spinner inline, then display the returned image. Professor
can toggle off to remove the image. Image URL is persisted to
`exercises.image_url`.

**Acceptance criteria:**
- [x] Toggling image on → spinner → image appears (within ~15s)
- [x] Image URL is saved to `exercises.image_url` in DB
- [x] Toggling image off sets `image_url` to null in DB
- [x] Multiple exercises can have images simultaneously
- [x] If Gemini fails, toggle resets to off with an error message

**Verification:**
- [ ] Manual: flag 2 exercises, confirm images appear and URLs persist
      on reload
- [ ] Supabase Studio → `exercises.image_url` contains Storage URLs
- [x] `npm run typecheck` — clean

**Dependencies:** Tasks 5, 7

**Files likely touched:**
- `app/components/professor/NodeEditor.tsx`
- `app/components/professor/ImageToggle.tsx`
- `app/server/classes.ts`

**Estimated scope:** Small

---

#### Task 9: Publish class

**Description:** A "Publicar turma" button appears in the studio when
the class has at least one node. On click: show a confirmation modal
("Tens a certeza? Os alunos poderão ver este conteúdo."), then set
`classes.published = true`. After publish: studio shows a read-only
view of the path; editing is disabled; the professor dashboard shows a
"Publicada" badge.

**Acceptance criteria:**
- [x] Publish button absent when class has zero nodes
- [x] Confirmation modal blocks accidental publish
- [x] After publish, students with the join code can see the class
- [x] After publish, node editor inputs are disabled
- [x] `classes.published` is `true` in DB

**Verification:**
- [ ] Manual: publish a class, then sign in as a student with the join
      code — confirm the class appears in the student's Aprende map
- [ ] Manual: confirm node editor is read-only after publish
- [x] `npm run typecheck` — clean

**Dependencies:** Task 7

**Files likely touched:**
- `app/routes/professor/classes/$classId/studio.tsx`
- `app/server/classes.ts`

**Estimated scope:** Small

---

### Checkpoint: Professor Studio
- [ ] Full professor flow works end-to-end: create class → generate path
      → flag images → publish
- [ ] `npm run build` — clean
- [ ] **Review with human before building student side**

---

### Phase 4: Student Experience

---

#### Task 10: Aprende map

**Description:** Student's Aprende route (`/student/$classId/aprende`)
fetches the class's published nodes ordered by `position`. Renders a
vertical winding map (Duolingo-style): completed nodes show a checkmark,
the active node glows with the amber accent, locked nodes are greyed out.
Only the first incomplete node is active at any time.

**Acceptance criteria:**
- [x] Nodes render in correct order with correct status (locked / active /
      completed) based on `student_progress`
- [x] Tapping a locked node does nothing
- [x] Tapping the active node navigates to the node lesson view
- [x] Tapping a completed node navigates to it in read-only mode
- [x] Map is scrollable and usable at 375px width

**Verification:**
- [ ] Manual: complete node 1, confirm node 2 becomes active
- [ ] Manual: resize to 375px, confirm no horizontal scroll
- [x] `npm run typecheck` — clean

**Dependencies:** Tasks 3, 9

**Files likely touched:**
- `src/routes/student/$classId/aprende.tsx`
- `src/components/student/AprenderMap.tsx`
- `src/components/student/NodeCard.tsx`
- `src/server/progress.ts`

**Estimated scope:** Medium

---

#### Task 11: Node lesson + exercise flow

**Description:** Clicking an active node opens the lesson view: lesson
content (rendered markdown) followed by the node's exercises one at a
time. Each exercise is an MCQ: select an option → submit → show
correct/incorrect feedback + explanation. Incorrect answers allow retry.
When all exercises are answered correctly, mark the node complete in
`student_progress`, award XP (10 XP per node), and redirect back to
the map with the next node now active.

**Acceptance criteria:**
- [ ] Lesson content renders as formatted markdown
- [ ] Exercises appear one at a time with 4 options
- [ ] Correct answer: green feedback + explanation shown + advance
- [ ] Wrong answer: red feedback + explanation shown + retry same exercise
- [ ] Exercises with `image_url` display the image above the question
- [ ] On final exercise correct: `student_progress.completed = true`,
      `xp_earned = 10`, redirect to map
- [ ] XP total visible on map screen increments after completion

**Verification:**
- [ ] Manual: complete a full node (all exercises correct), confirm
      progress row in DB and map updates
- [ ] Manual: answer incorrectly, confirm retry works
- [ ] Manual: exercise with image — confirm image renders
- [ ] `npm run typecheck` — clean

**Dependencies:** Task 10

**Files likely touched:**
- `app/routes/student/$classId/aprende/$nodeId.tsx`
- `app/components/student/ExerciseCard.tsx`
- `app/components/student/XPBar.tsx`
- `app/server/progress.ts`

**Estimated scope:** Medium

---

#### Task 12: Pergunta tab (port from WiseLab)

**Description:** Port WiseLab's Pergunta feature to
`/student/$classId/pergunta`. Recreate `generateLesson` as a server
function (same Ollama call, keys now server-side). Port `LessonView`,
`SkeletonCard`, and `SubjectSelector` components, adapting them to
TypeScript. Subject list pre-filtered to Physics for MVP but selector
still shown.

**Acceptance criteria:**
- [x] Student can select Physics, enter a problem, generate a lesson
- [x] Step cards render: locked → active → completed progression
- [x] Skeleton loading state appears while Ollama is responding
- [x] `OLLAMA_API_KEY` not in client bundle
- [ ] UI matches WiseLab's quality at 375px width

**Verification:**
- [ ] Manual: generate a Physics lesson end-to-end
- [x] `grep -r "OLLAMA_API_KEY" dist/` — zero matches
- [x] `npm run typecheck` — clean

**Dependencies:** Tasks 3, 4

**Files touched:**
- `src/routes/student/$classId/pergunta.tsx`
- `src/components/shared/LessonView.tsx`
- `src/components/shared/StepCard.tsx`
- `src/components/shared/SubjectSelector.tsx`
- `src/components/shared/MathText.tsx`
- `src/components/shared/MathBlock.tsx`
- `src/server/ollama.ts` (added `generateLesson` fn + types)

**Notes:**
- `SimplifyButton` and `ConfusedChat` omitted — require browser-side API key,
  out of scope for MVP
- Skeleton loading uses animated progress ticker (server fn is non-streaming)

**Estimated scope:** Medium

---

### Checkpoint: Student Experience
- [ ] Full student flow: join → map → complete node → XP updates
- [ ] Pergunta generates Physics lessons
- [ ] `npm run build` — clean
- [ ] **Review with human before gamification phase**

---

### Phase 5: Gamification + Professor Dashboard

---

#### Task 13: Streak tracking

**Description:** On each node completion, update `streaks` for the
student: if `last_active` is yesterday, increment `current`; if today,
no change; if older, reset to 1. Display current streak and total XP
in a persistent bar in the student shell layout.

**Acceptance criteria:**
- [x] Streak increments when completing a node on a new day
- [x] Streak does not double-increment if two nodes completed same day
- [x] Streak resets to 1 if no activity for 2+ days
- [x] Streak and XP total visible in student shell on all pages

**Verification:**
- [ ] Manual: complete nodes on simulated consecutive days (update
      `last_active` in DB directly), confirm streak logic
- [x] Vitest: `calculateNextStreak` covers first activity, consecutive day,
      same day, and 2+ day reset
- [x] `npm test` — 21 tests passed
- [x] `npm run typecheck` — clean
- [x] `npm run build` — clean
- [ ] `npm run lint` — blocked by pre-existing project-wide lint debt;
      touched Task 13 files pass targeted ESLint

**Dependencies:** Task 11

**Files touched:**
- `src/server/progress.ts`
- `src/server/progress.test.ts`
- `src/components/student/XPBar.tsx`
- `src/routes/student/$classId.tsx`
- `src/routes/student/$classId/aprende/$nodeId.tsx`
- `src/routeTree.gen.ts`

**Commits:**
- `9d7fcfe feat: update streaks on node completion`
- `d7ef1c7 feat: show student xp and streak bar`

**Estimated scope:** Small

---

#### Task 14: Class leaderboard

**Description:** A leaderboard tab in the student shell shows all
students in the class ranked by total XP. Display rank, display name,
and XP total. The current student's row is highlighted. Leaderboard
is read-only.

**Acceptance criteria:**
- [ ] Students ranked by descending XP total
- [ ] Current student's row is visually highlighted
- [ ] Leaderboard updates after node completion (re-fetch on mount)
- [ ] Empty state shown if class has only one student

**Verification:**
- [ ] Manual: two student accounts in same class — complete different
      nodes, confirm ranking order
- [ ] `npm run typecheck` — clean

**Dependencies:** Task 11

**Files likely touched:**
- `app/routes/student/$classId/leaderboard.tsx`
- `app/routes/student/_layout.tsx`

**Estimated scope:** Small

---

#### Task 15: Professor progress dashboard

**Description:** `/professor/classes/$classId/students` lists every
student in the class with a per-node progress grid: rows = students,
columns = nodes, cell = completed (checkmark) or not (empty). Clicking
a student row shows their total XP and streak.

**Acceptance criteria:**
- [ ] All enrolled students are listed
- [ ] Grid accurately reflects `student_progress` rows
- [ ] XP and streak visible per student
- [ ] Empty state if no students have joined yet

**Verification:**
- [ ] Manual: 2 students with different progress — confirm grid accuracy
- [ ] `npm run typecheck` — clean

**Dependencies:** Tasks 11, 6

**Files likely touched:**
- `app/routes/professor/classes/$classId/students.tsx`

**Estimated scope:** Small

---

### Checkpoint: Complete MVP
- [ ] `npm run typecheck` — clean
- [ ] `npm run build` — clean
- [ ] Professor flow: create → generate → review → publish ✓
- [ ] Student flow: join → map → complete nodes → XP + streak ✓
- [ ] Pergunta: Physics Q&A works ✓
- [ ] All AI keys absent from client bundle (grep) ✓
- [ ] UI usable at 375px ✓
- [ ] **Final review with human before any deployment**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ollama generates invalid/incomplete JSON | High | Strict JSON schema prompt + Zod validation + retry up to 3x; spike in Task 4 catches this early |
| Gemini images inappropriate for school content | Medium | Professor reviews every image before publish; can remove with one click |
| TanStack Start + Supabase SSR auth complexity | Medium | Auth is Task 3 — fails fast before any feature work |
| Ollama latency too high for path generation | Low | Show skeleton UI; set 60s timeout with clear error + retry |
| Join code collision at scale | Low | Retry on unique constraint violation; 6-char alphanumeric = 2.1B combinations |

---

## Parallelization Notes

Once **Task 4** (Ollama spike) and **Task 5** (Gemini spike) pass
checkpoint review, they are independent of each other and can be run
in parallel. All other tasks are sequential within their phase.
