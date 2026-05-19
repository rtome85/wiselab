# Sábio

## Problem Statement
How might we give Portuguese high school students a self-directed,
gamified learning experience — while giving their teachers an AI-powered
studio that generates structured curricula in minutes, not hours?

## Recommended Direction
A classroom-scoped, two-profile web platform forked from WiseLab.

Teachers create a class (get a join code), then use an AI content studio
to generate a map-style learning path: Ollama structures topics and
exercises, Gemini Nano Banana 2 (`gemini-3.1-flash-image-preview`)
generates visual assets only for exercises where visual information aids
comprehension (geometry diagrams, circuit schematics, biological
structures, etc.). Teacher reviews and publishes. Students join their
class, progress through the Aprende map, use Pergunta for AI Q&A, and
earn XP/streaks.

The classroom-as-unit model keeps permissions simple and gives teachers
ownership. The teacher-studio-first build order ensures content exists
before the student experience is polished.

## Tech Stack
- Fork of WiseLab (React 19, Vite 7, Tailwind CSS 3)
- Backend: Supabase (auth + database + storage for generated images)
- AI text: Ollama API (OpenAI-compatible, `VITE_OLLAMA_MODEL`)
- AI images: Gemini API — `gemini-3.1-flash-image-preview` (Nano Banana 2)
  via `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Responsive web — desktop-first, mobile-friendly, no native app

## Student Side — Three Tabs
- **Pergunta:** port from WiseLab — AI Q&A on any topic
- **Aprende:** map-style learning path (teacher-defined, node-by-node
  unlock), Duolingo-inspired visual structure
- **Pratica:** per-topic exercises to strengthen skills (v2)

## Professor Side — Content Studio
- Create class → shareable join code
- Input: subject + topic list
- Ollama generates structured path (nodes, lesson content, exercises)
- Teacher flags exercises that benefit from visual context
- Nano Banana 2 generates images for flagged exercises
- Teacher reviews full path → publishes to class
- Dashboard: student progress per node

## Gamification
- XP per completed node
- Daily streaks
- Class leaderboard

## Key Assumptions to Validate
- [ ] Teachers will review and trust AI-generated exercises after seeing
      output quality (test: show 5 teachers a sample generated path,
      measure acceptance rate)
- [ ] Ollama can produce structured lesson/exercise JSON reliably
      (test: spike prompt engineering for path generation before
      committing to the architecture)
- [ ] Nano Banana 2 generates educationally appropriate images from
      curriculum prompts (test: run 20 subject prompts, evaluate output)

## MVP Scope
- Auth: two roles (student / professor), email+password via Supabase
- Professor: create class → class code → AI content studio → review →
  publish
- Student: join class → Aprende map → Pergunta → XP + streak
- Responsive web, one subject per class
- Images only where teacher deems visual context necessary

## Not Doing (and Why)
- Pratica tab — ship in v2 once core two tabs are validated
- AI-adaptive paths — requires Pratica data first; v3
- Cross-school content sharing — different product/business model
- Native mobile app — responsive web covers the use case
- Real-time features (live class, chat) — out of scope for MVP
- Student-generated questions — moderation complexity, unclear payoff

## Decisions
- **Image storage:** Supabase Storage — generated images are uploaded and
  served via URL, not regenerated at runtime. Keeps Gemini API costs
  predictable and enables caching.
- **Classes per professor:** Multiple classes from day one (e.g. different
  year groups for the same subject). One-class-per-professor is too
  restrictive to retrofit later.
- **First subject:** Physics — one exact science to stress-test AI
  exercise correctness and the teacher review workflow under the highest
  stakes conditions.
