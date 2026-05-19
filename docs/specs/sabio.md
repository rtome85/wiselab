# Spec: Sábio

## Objective

A Duolingo-inspired e-learning web platform for Portuguese high school
students. Two profiles: **student** and **professor**.

**Student experience:**
- **Pergunta** — AI Q&A on any topic (ported from WiseLab)
- **Aprende** — map-style learning path created by their professor,
  nodes unlock linearly as the student progresses
- **Pratica** — per-topic exercises (v2, out of scope for MVP)

**Professor experience:**
- Create classes (multiple per professor), each with a shareable join code
- AI content studio: input subject + topics → Ollama generates structured
  path (nodes with lesson content + exercises) → professor flags exercises
  that benefit from visual context → Gemini generates those images →
  professor reviews the full path → publishes to class
- Dashboard: view student progress per node

**Gamification:** XP per completed node, daily streak, class leaderboard.

**First subject:** Physics — chosen to stress-test AI exercise correctness
under the highest-stakes conditions.

**Success criteria:**
- A professor can create a class, generate a Physics path, review it,
  and publish in a single session without touching code
- A student can join a class with a code, view the Aprende map, complete
  a node, and see their XP update
- Pergunta answers Physics questions accurately (same quality bar as WiseLab)
- All AI API keys are server-side only — zero secrets in the browser
- UI is usable on a 375px-wide phone screen without horizontal scroll

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | TanStack Start (latest) | Full-stack React, file-based routing, server functions |
| Router | TanStack Router | Bundled with Start |
| Runtime | Vite (via Vinxi) | Bundled with Start |
| Styling | Tailwind CSS v4 | Token-based via `@theme {}` in CSS — no tailwind.config.js |
| Auth + DB | Supabase | Email + password, two roles: `student` / `professor` |
| Storage | Supabase Storage | Generated images uploaded and served via URL |
| AI text | Ollama API (OpenAI-compatible) | Called via server function; model from env |
| AI images | Gemini `gemini-3.1-flash-image-preview` | Called via server function; key never in client |
| Language | TypeScript | Strict mode |

**Project base:** Scaffolded via `npx @tanstack/cli@latest create sabio`.
Do not fork WiseLab's codebase — port Pergunta logic manually.

---

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Build & Preview
npm run build        # Production build
npm run start        # Preview production build

# Type checking & Linting
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src/

# Supabase
npx supabase start   # Local Supabase instance
npx supabase db push # Apply migrations
npx supabase gen types typescript --local > src/lib/supabase.types.ts
```

---

## Project Structure

```
src/
  routes/
    __root.tsx              → Root layout (fonts, global styles, auth guard)
    index.tsx               → Landing page + auth (login/signup)
    student/
      _layout.tsx           → Student shell (tab bar: Pergunta, Aprende)
      $classId/
        aprende.tsx         → Learning map view
        pergunta.tsx        → AI Q&A (ported from WiseLab)
    professor/
      _layout.tsx           → Professor shell (nav: Dashboard, Classes)
      dashboard.tsx         → Class list + student progress overview
      classes/
        new.tsx             → Create class form
        $classId/
          studio.tsx        → AI content studio (generate + review path)
          students.tsx      → Student progress per node
  server/                   → Server functions (API keys live here only)
    ollama.ts               → generatePath(subject, topics) → PathJSON
    gemini.ts               → generateImage(prompt) → StorageURL
  components/
    student/
      AprenderMap.tsx       → Map-style node path (Duolingo-inspired)
      NodeCard.tsx          → Individual map node (locked/active/done)
      XPBar.tsx             → XP counter + streak display
    professor/
      PathStudio.tsx        → Step-by-step path generation UI
      NodeEditor.tsx        → Review/edit individual node content
      ImageToggle.tsx       → Flag exercise as needing visual
    shared/
      SubjectSelector.tsx   → Segmented control (port from WiseLab)
      LessonView.tsx        → Step cards (port from WiseLab)
      SkeletonCard.tsx      → Shimmer placeholder (port from WiseLab)
  lib/
    supabase.ts             → Supabase client (browser)
    supabase.server.ts      → Supabase client (server, uses service key)
    supabase.types.ts       → Generated types from schema
  styles.css                → Tailwind v4 @theme tokens + animations
public/
supabase/
  migrations/               → SQL migration files
  seed.sql                  → Dev seed data (sample Physics path)
```

---

## Database Schema

```sql
-- Professors and students both live in auth.users (Supabase Auth)
-- role is stored in a profiles table

profiles (
  id          uuid PK → auth.users.id,
  role        text NOT NULL CHECK (role IN ('student', 'professor')),
  display_name text NOT NULL,
  created_at  timestamptz DEFAULT now()
)

classes (
  id          uuid PK DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL → profiles.id,
  name        text NOT NULL,         -- e.g. "10º Física"
  subject     text NOT NULL,         -- e.g. "physics"
  join_code   text UNIQUE NOT NULL,  -- 6-char alphanumeric
  published   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

class_members (
  class_id    uuid → classes.id,
  student_id  uuid → profiles.id,
  joined_at   timestamptz DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
)

nodes (
  id          uuid PK DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL → classes.id,
  position    integer NOT NULL,      -- order in the map (1-based)
  title       text NOT NULL,
  content     text NOT NULL,         -- lesson markdown
  created_at  timestamptz DEFAULT now()
)

exercises (
  id          uuid PK DEFAULT gen_random_uuid(),
  node_id     uuid NOT NULL → nodes.id,
  question    text NOT NULL,
  options     jsonb NOT NULL,        -- [{label, text, correct}]
  explanation text NOT NULL,
  image_url   text,                  -- null if no image
  position    integer NOT NULL,
  created_at  timestamptz DEFAULT now()
)

student_progress (
  student_id  uuid → profiles.id,
  node_id     uuid → nodes.id,
  completed   boolean DEFAULT false,
  completed_at timestamptz,
  xp_earned   integer DEFAULT 0,
  PRIMARY KEY (student_id, node_id)
)

streaks (
  student_id  uuid PK → profiles.id,
  current     integer DEFAULT 0,
  last_active date
)
```

---

## Code Style

TypeScript strict mode. Components are `.tsx`, server functions are `.ts`.
Name files with the component they export. No default barrel exports.

```tsx
// app/components/student/NodeCard.tsx
import type { Node } from '~/lib/supabase.types'

interface NodeCardProps {
  node: Node
  status: 'locked' | 'active' | 'completed'
  onClick?: () => void
}

export function NodeCard({ node, status, onClick }: NodeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className={cn(
        'rounded-2xl border p-4 transition-all',
        status === 'active' && 'border-amber-400/50 shadow-amber-400/20',
        status === 'completed' && 'border-white/20 opacity-70',
        status === 'locked' && 'border-white/[0.08] opacity-40 cursor-not-allowed',
      )}
    >
      {node.title}
    </button>
  )
}
```

Design tokens carried from WiseLab:
- Background: `#07070c`
- Cards: `rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]`
- Fonts: Space Mono (headings/mono), DM Sans (body)
- Physics accent: `amber-400` (matches WiseLab's physics color)

Server functions use `createServerFn`:

```ts
// app/server/ollama.ts
import { createServerFn } from '@tanstack/start'

export const generatePath = createServerFn({ method: 'POST' })
  .validator((data: { subject: string; topics: string[] }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(process.env.OLLAMA_BASE_URL + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL, messages: [...] }),
    })
    return res.json()
  })
```

---

## Testing Strategy

- **Framework:** Vitest + React Testing Library
- **Tests live next to source:** `NodeCard.test.tsx` alongside `NodeCard.tsx`
- **E2E:** Playwright for critical paths (auth, class join, node completion)
- **Coverage target:** 80% on `lib/` and `server/` — lower bar on UI components

| Layer | What to test |
|---|---|
| Server functions | Ollama prompt → valid PathJSON shape; Gemini → returns URL |
| DB queries | Supabase RLS policies — student can't read another class's nodes |
| Components | NodeCard status variants; XPBar increments; map node ordering |
| E2E | Professor creates class → student joins → student completes node |

---

## Boundaries

**Always:**
- Run `npm run typecheck` before committing
- All AI API calls go through server functions — never `fetch` to Ollama
  or Gemini directly from a component
- Professor must explicitly publish a class before students can see it
- Images are always served from Supabase Storage URLs, never as base64
  in the DB or component state

**Ask first:**
- Schema changes (migrations are hard to undo)
- Adding npm dependencies
- Changing the AI prompt templates in `server/ollama.ts`
- Changing the join code generation algorithm (affects existing codes)

**Never:**
- Store `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, or `OLLAMA_API_KEY`
  in client-side env vars (`VITE_` prefix)
- Allow students to access unpublished class content
- Call Gemini for an image if the professor hasn't flagged the exercise
  as needing one (cost control)

---

## Decisions

1. **Auth flow UX:** Single login page with a student/professor toggle.
   One URL, one form — role is selected before submitting.

2. **Join code entry:** Students enter the class join code as part of
   the registration form. They are immediately assigned to a class on
   account creation.

3. **Node completion trigger:** A node is marked complete when the
   student answers all exercises correctly. Incorrect answers allow
   unlimited retries within the session. XP is awarded on first
   completion only.

4. **Image generation in studio:** Gemini generates the image
   automatically the moment a professor flags an exercise as needing
   visual context. The image appears inline in the node editor. The
   professor can re-generate or remove it before publishing.
