# WiseLab

**AI-powered step-by-step learning for Math, Physics, and Chemistry.**

WiseLab takes any problem — typed or photographed — and generates a structured, interactive lesson with LaTeX-rendered formulas, progressive step reveal, and real-world context. Powered by Ollama Cloud models.

---

## Features

- **Step-by-step lesson generation** — AI produces 3-6 structured steps with explanations, formulas, visuals, and tips
- **LaTeX math rendering** — Inline (`$...$`) and display-level math via KaTeX
- **Image-based input** — Photograph or upload an exercise; OCR extracts the problem automatically
- **Multi-subject theming** — Math (indigo), Physics (amber), Chemistry (emerald) with per-subject accent colors
- **Progressive step reveal** — Locked → Active → Completed stepper; each step unlocks on demand
- **Lesson history** — Up to 10 recent lessons persisted in localStorage with one-click restore
- **Dark glassmorphic UI** — `#07070c` background with dynamic radial glow per subject, 800ms transitions
- **Keyboard shortcut** — `Ctrl+Cmd+Enter` to submit a problem

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3 |
| Math rendering | KaTeX 0.16 |
| AI API | Ollama Cloud (OpenAI-compatible) |
| Fonts | DM Sans (body), Space Mono (headings/mono) |

No router, no state management library — all state is local React hooks + localStorage.

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Ollama Cloud](https://ollama.ai) API key

### Installation

```bash
git clone https://github.com/your-username/wiselab.git
cd wiselab
npm install
```

### Environment

Create a `.env` file at the project root:

```env
VITE_OLLAMA_API_KEY=your_api_key_here
VITE_OLLAMA_MODEL=ministral-3:14b-cloud
```

| Variable | Description | Default |
|---|---|---|
| `VITE_OLLAMA_API_KEY` | Ollama Cloud API key | — |
| `VITE_OLLAMA_MODEL` | Model used for lesson generation | `llama3.1:8b` |

> **Security note:** Vite exposes `VITE_*` variables in the client bundle. For production, proxy API requests through a server-side function (Cloudflare Worker, Vercel Edge, etc.) so the key is never shipped to the browser.

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/v1/*` requests to `https://ollama.com` to avoid CORS issues.

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

---

## Project Structure

```
wiselab/
├── index.html                    # App entry point (lang="pt")
├── vite.config.js                # Vite config with /v1 proxy
├── tailwind.config.js            # Custom fonts (DM Sans, Space Mono)
├── src/
│   ├── main.jsx                  # React root + KaTeX CSS import
│   ├── App.jsx                   # Root component, subject/history state
│   ├── styles/
│   │   └── index.css             # Tailwind directives + .skeleton, .glass, keyframes
│   ├── components/
│   │   ├── SubjectSelector.jsx   # Segmented control; exports getAccentClasses()
│   │   ├── ProblemInput.jsx      # Textarea + image toggle + submit button
│   │   ├── ImageInput.jsx        # Drag-drop / camera modal
│   │   ├── LessonView.jsx        # Vertical stepper + skeleton + error states
│   │   ├── StepCard.jsx          # Single step (locked / active / completed)
│   │   ├── MathBlock.jsx         # Display-mode KaTeX renderer
│   │   ├── MathText.jsx          # Inline KaTeX renderer (parses $...$)
│   │   ├── FinalAnswer.jsx       # Solution + real-world application
│   │   ├── ProgressBar.jsx       # Animated step progress bar
│   │   └── HistoryDrawer.jsx     # Slide-out drawer with saved lessons
│   ├── hooks/
│   │   ├── useLesson.js          # generate / restore / nextStep / reset
│   │   ├── useHistory.js         # localStorage CRUD (max 10 items)
│   │   └── useImageInput.js      # File validation, compression, OCR pipeline
│   └── lib/
│       ├── ollama.js             # generateLesson() — API call + JSON repair
│       ├── vision.js             # extractTextFromImage() — OCR via vision model
│       └── imageUtils.js         # validateImageFile() + fileToBase64() (Canvas)
```

---

## How It Works

### 1. Problem input

The user types a problem or uploads a photo. Images are validated (JPEG/PNG/WebP, max 10 MB), compressed via Canvas API to max 1024px width at 0.85 quality, then sent to a vision model (`ministral-3:3b-cloud`) for OCR. The extracted text auto-populates the textarea.

### 2. Lesson generation

`generateLesson(subject, problem)` in `src/lib/ollama.js`:

1. Posts to `/v1/chat/completions` with a structured system prompt
2. The model returns a JSON lesson:

```json
{
  "title": "Newton's Second Law",
  "steps": [
    {
      "title": "Identify the forces",
      "explanation": "Apply $F = ma$ to find acceleration.",
      "formula": "F = ma",
      "visual": "→ F\n[m] ───►",
      "tip": "Always draw a free-body diagram first."
    }
  ],
  "final_answer": "a = \\frac{F}{m} = 5 \\, \\text{m/s}^2",
  "real_world": "This is how car engines are sized for performance."
}
```

3. A custom JSON repair function handles common model quirks: escapes bare LaTeX backslashes (`\frac` → `\\frac`), normalises embedded newlines, and strips markdown code fences.

### 3. Lesson display

- Steps start locked (skeleton placeholders, `opacity-35`)
- The first step is immediately active (glowing accent border)
- "Next step" marks the current step complete and activates the next
- After the last step, the final answer and real-world section appear
- A vertical connector line runs between all cards (`absolute left-[22px]`)

### 4. History

Each completed lesson is saved to `localStorage` under `wiselab_history` (max 10 entries). The history drawer shows subject badge, title, problem snippet, and timestamp. Click any entry to restore the lesson; hover to reveal a delete button.

---

## Accent Theme System

`getAccentClasses(subjectId)` in `SubjectSelector.jsx` returns a map of Tailwind classes per subject:

| Key | Math (indigo) | Physics (amber) | Chemistry (emerald) |
|---|---|---|---|
| `button` | `bg-indigo-500 ...` | `bg-amber-500 ...` | `bg-emerald-500 ...` |
| `border` | `border-indigo-500/40` | `border-amber-500/40` | `border-emerald-500/40` |
| `text` | `text-indigo-400` | `text-amber-400` | `text-emerald-400` |
| `progress` | `bg-indigo-500` | `bg-amber-500` | `bg-emerald-500` |
| `glow` | `shadow-indigo-500/25` | `shadow-amber-500/25` | `shadow-emerald-500/25` |

The dynamic background glow in `App.jsx` is an inline-styled `div` that transitions its `background` radial gradient over 800ms when the subject changes.

---

## Styling Conventions

- **Background:** `#07070c`
- **Cards:** `rounded-2xl bg-white/[0.04..0.07] backdrop-blur-sm border border-white/[0.08]`
- **Skeleton:** `.skeleton` class — shimmer gradient animation at 200% background-size
- **Custom keyframes:** `shimmer`, `fadeIn`, `slideDown`, `spin`, `pulse-ring` (defined in `index.css`)
- **KaTeX dark mode:** `.katex` text set to `rgba(255,255,255,0.85)` globally

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a pull request

Please keep PRs focused. Run `npm run lint` before submitting.

---

## License

MIT
