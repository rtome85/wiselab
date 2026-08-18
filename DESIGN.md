---
name: WiseLab
description: A calm, coral-and-teal study companion that turns one problem into a step-by-step lesson.
colors:
  ink: "#142238"
  muted: "#6d7a89"
  faint: "#9aa9b6"
  app-bg: "#f8fbfc"
  surface: "#ffffff"
  control: "#eff7f7"
  border: "#e6edf1"
  coral-spark: "#ff654c"
  coral-spark-from: "#ff7b63"
  coral-spark-to: "#ff5b43"
  seafoam-calm: "#26a9a7"
  seafoam-calm-soft: "#ddf5f3"
  challenge-peach: "#fff2e2"
  active-surface: "#f4fefe"
  warning-accent: "#ff8a4c"
  success: "#10b981"
  error: "#ef4444"
  tip-amber: "#f59e0b"
  assistant-violet: "#8b5cf6"
typography:
  display:
    fontFamily: "Inter, DM Sans, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, DM Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.35
  title:
    fontFamily: "Inter, DM Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
    lineHeight: 1.4
  body:
    fontFamily: "Inter, DM Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, DM Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.15em"
  mono:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  control: "8px"
  panel: "12px"
  badge: "16px"
  card: "24px"
  cta: "18px"
  icon-button: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.coral-spark}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-cta:
    backgroundColor: "{colors.coral-spark}"
    textColor: "#ffffff"
    rounded: "{rounded.cta}"
    padding: "10px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-active:
    backgroundColor: "{colors.active-surface}"
    rounded: "{rounded.card}"
    padding: "20px"
---

# Design System: WiseLab

## Overview

**Creative North Star: "The Study Companion"**

WiseLab reads as a calm, encouraging companion sitting next to a student working through one problem — never a clinical AI console. The surface is quiet and light-first (white cards on a near-white app background, with a fully-realized dark theme as an equal citizen, not an afterthought): generous rounded corners, soft borders instead of shadows, and a two-hue accent pairing that keeps the interface warm without becoming loud. Structure carries most of the personality — a vertical stepper of cards, one revealed at a time — while small emoji glyphs (🎯 🌍 🧠 🧒 ❓ 💡) act as friendly signposts on section headers, the way a tutor's handwritten margin notes would.

Depth is used sparingly and meaningfully: almost everything at rest is flat, separated only by a hairline border. The one visual reward — a warm coral glow — is reserved for whatever the student should do next (the primary call-to-action, the active step). That restraint is deliberate: it keeps the "next action" legible even as lessons grow to 6 steps with inline challenges, tips, and an assistant chat nested inside each card.

**Key Characteristics:**
- Two-hue brand accent: **Coral Spark** for action, **Seafoam Calm** for highlight/informational state — never swapped.
- Flat-by-default surfaces; shadows exist only as an "active/primary" marker, not ambient decoration.
- Large, soft radii throughout (12–24px on panels and cards, pill-shaped 18px CTAs) — no sharp corners anywhere.
- Four fixed semantic hues (emerald / red / amber / violet) each locked to one meaning across the whole app.
- Full light/dark parity via CSS custom properties — dark is a tuned second theme, not an inverted filter.

## Colors

The palette is deliberately narrow: one warm action color, one cool highlight color, a quiet neutral scale, and four fixed semantic hues borrowed from the Tailwind default palette. Every color token exists in both a light value (`:root`) and a tuned dark value (`:root.dark`); the frontmatter above carries the light (default) values.

### Primary
- **Coral Spark** (`#ff654c`, CTA gradient `#ff7b63 → #ff5b43` / dark `#e95445 → #ff715c`): the only color used for primary calls to action — the flow-level "Generate," "Next Step," and the `ui/Button` default variant. It appears on nothing else; its rarity is what makes it legible as "the next action."

### Secondary
- **Seafoam Calm** (`#26a9a7` / dark `#69d6f5`, soft tint `#ddf5f3` / dark `#12365a`): the highlight and informational accent — focus rings, progress bars, badges, borders on the active step, the logo mark, links. Never used as a solid CTA fill.

### Tertiary
- **Challenge Peach** (`#fff2e2` / dark `#12365a`): the background for the inline multiple-choice challenge block only — a distinct warm tint that marks "this card wants interaction," separate from both brand hues.

### Neutral
- **Ink** (`#142238` / dark `#f5f9ff`): primary text.
- **Muted** (`#6d7a89` / dark `#a9bad0`): secondary text — explanations, descriptions, timestamps.
- **Faint** (`#9aa9b6` / dark `#6f88a8`): placeholder text, disabled labels, least-emphasis captions.
- **App** (`#f8fbfc` / dark `#071426`): page background.
- **Surface** (`#ffffff` / dark `#101f35`): card and panel background.
- **Control** (`#eff7f7` / dark `#12365a`): input fields, skeleton base, secondary button fill, kbd chips.
- **Border** (`#e6edf1` / dark `#263b59`): the single hairline that separates every flat surface from its background.
- **Active surface** (`#f4fefe` / dark `#101f35`): the tinted background reserved for the currently-active lesson step card.

### Semantic (fixed, one meaning each)
- **Success** (`#10b981`, Tailwind emerald-500): correct challenge answers only.
- **Error** (`#ef4444`, Tailwind red-500): validation/API errors and wrong challenge answers only.
- **Tip** (`#f59e0b`, Tailwind amber-500): the 💡 tip callout inside a step, and nothing else.
- **Assistant** (`#8b5cf6`, Tailwind violet-500): the "I'm confused" tutor chat only — its own persona color, distinct from both brand hues.

### Named Rules
**The Single Ignition Rule.** Coral Spark fires on exactly one element per screen state: the button the student should press next. It never appears as a background tint, a badge, or a secondary accent.

**The Locked-Palette Rule.** No fifth semantic hue is introduced for a new state. Success/error/tip/assistant are closed — a new kind of callout reuses the nearest existing meaning rather than picking a new color.

## Typography

**Body & Display Font:** Inter, with DM Sans and system sans-serif as fallback.
**Mono/Label Font:** Space Mono (with `monospace` fallback), reserved for literal or technical fragments.

**Character:** Confident but not shouty — bold, tight-tracked headings paired with relaxed, generously-leaded body text, so dense lesson content stays easy to scan.

### Hierarchy
- **Display** (800, `clamp(1.875rem, 4vw, 2.25rem)`, 1.15 line-height, −0.01em tracking): the idle-state hero question ("What's your challenge?").
- **Headline** (800, 18px, 1.35 line-height): the generated lesson's title.
- **Title** (800, 15px, 1.4 line-height): each step card's heading.
- **Body** (400, 14px, 1.625 line-height): explanations, tips, chat messages, descriptions. No max-width constraint is enforced beyond the 2xl (42rem) page container.
- **Label** (700, 12px, 0.15em uppercase tracking): section eyebrows ("AI TUTOR," "FINAL ANSWER," "REAL WORLD," challenge/tip headers).
- **Mono** (400, 12px): keyboard-shortcut chips (⌘↵), the history-count badge, and ASCII step visuals.

### Named Rules
**The Mono-Is-Literal Rule.** Space Mono only renders things that are literally typed or counted (shortcuts, counts, ASCII diagrams, raw LaTeX fallback) — never prose, never a heading.

## Layout

Single-column, content-first: a `max-w-2xl` (42rem) container centered under a sticky, blurred glass header (`bg-header` at ~90% opacity + `backdrop-blur-xl`) and above a plain text footer. There is no sidebar and no grid system — the product is one linear flow (idle → generating → lesson steps → final answer), so layout is a vertical rhythm problem, not a spatial one.

Lesson steps render as a **vertical stepper**: a 1px `border-border` line runs behind the cards (`absolute left-[22px]`), connecting the numbered/checked circle badges at the top-left of each card. Locked (not-yet-reached) steps collapse to a shimmer skeleton at the same card shape, so the total step count is always visible without spoiling content.

Density is comfortable, not compact: cards use 20px internal padding (`px-5 py-5`), sections stack with 12–20px gaps, and drawers (history, settings) are fixed-width side panels (`w-72 sm:w-80`) rather than full-screen takeovers on mobile.

## Elevation & Depth

Flat by default. Surfaces are separated by a single `border-border` hairline against the app background — no ambient drop shadows on resting cards, inputs, or panels. Depth exists only as a state signal: the active lesson step and every primary CTA carry a warm coral-tinted glow (`box-shadow: 0 18px 40px -14px rgba(255,101,76,0.45)`, dark: `rgba(255,113,92,0.3)`), and the active step additionally gets `shadow-xl`. A neutral `shadow-lg`/backdrop-blur is used only for overlay chrome (drawers' backdrop, sticky header).

### Shadow Vocabulary
- **CTA glow** (`0 18px 40px -14px rgba(255,101,76,0.45)` / dark `rgba(255,113,92,0.3)`): primary action buttons and the active step card border.
- **Active step lift** (`shadow-xl`, neutral): paired with the CTA glow on the currently-active step card only.
- **Overlay chrome** (`shadow-lg` / `bg-black/60 backdrop-blur-sm`): drawer panels and their backdrops.

### Named Rules
**The Border-Over-Shadow Rule.** A card is flat until it becomes the thing the student is acting on right now. Shadows are never decorative — they always mean "active" or "floating above the page" (drawers).

## Shapes

Corners are large and soft everywhere; nothing in the system uses a sharp 0–4px radius. Cards and major panels use 24px (`rounded-3xl`); mid-level containers (inputs' outer wrapper, tip/callout blocks, image thumbnails) use 12–18px; small circular badges (step number/check, icon buttons) are fully round or 14–16px. Primary flow-level CTA buttons (Generate, Next Step, Cancel) get a distinct 18px pill radius that no other component uses — it is the shape signature of "this is the action for this screen."

## Components

### Buttons
- **Shape:** two families exist — the `ui/Button` primitive (8px radius, `h-9`, compact padding, used in settings/utility contexts) and the larger flow-level CTA (18px pill radius, taller padding, used for Generate/Next Step/Cancel and always paired with the CTA glow).
- **Primary:** Coral Spark fill, white text. `ui/Button` default variant dims 10% on hover (`hover:opacity-90`); the flow-level CTA brightens slightly (`hover:brightness-105`).
- **Secondary/Outline:** transparent fill, `border-border`, `text-ink`; hover fills with `bg-control` and tints the border toward Seafoam Calm.
- **Ghost:** no border, `text-muted`, hover fills `bg-control` and darkens text to `text-ink`.
- **Destructive:** `red-500` at 10% opacity fill with a matching border — reserved for irreversible actions (clear history, clear API key sits on ghost + red hover instead).

### Cards / Containers
- **Corner Style:** 24px (`rounded-3xl`) on all step cards, the generating-state card, error cards, and the final-answer card.
- **Background:** `bg-surface` at rest; `bg-[var(--color-active-bg)]` (Active surface) for the current step only.
- **Shadow Strategy:** see Elevation & Depth — flat unless active.
- **Border:** `border-border` at rest; `border-accent` (Seafoam Calm) when active.
- **Internal Padding:** 20px (`px-5 py-5`), with body content additionally indented to align under the step's number badge (`pl-[3.25rem]`).

### Inputs / Fields
- **Style:** `bg-control` fill, `border-border`, 8px radius (`rounded-lg`), 36px height for single-line fields; the problem-input textarea sits in a 24px-radius card instead of the standard input shape.
- **Focus:** border tints to Seafoam Calm at 40% opacity plus a 2px Seafoam Calm ring at 25% opacity — no layout shift.
- **Error/Disabled:** disabled fields drop to 50% opacity; there is no dedicated error-input style — validation errors render as a separate red message below the field instead of restyling the field itself.

### Navigation
- **Header:** sticky, translucent glass (`bg-header` ~90% opacity, `backdrop-blur-xl`), `border-b border-border`. Icon-only actions (history, settings, theme toggle) are 36px squares with a 14px radius, `bg-surface` + `border-border`, muted icon that darkens to ink on hover — no active/selected state since these open overlays, not routes.
- **Segmented control:** used for language and difficulty pickers — a `bg-control` pill container (`rounded-xl`, 4px padding) holding equal-width buttons; the selected option gets `bg-surface` + `shadow-sm`, unselected stay text-only. `role="radiogroup"` semantics throughout.

### Signature Component: Step Card (locked / active / completed)
The stepper is WiseLab's one truly distinctive pattern. A step exists in exactly one of three states, and the state is legible from silhouette alone before reading any text:
- **Locked:** a bordered card containing only shimmering skeleton bars (`.skeleton`, animated gradient sweep) — proves a step exists without revealing or spoiling it.
- **Active:** Active-surface background, Seafoam Calm border, `shadow-xl` + coral CTA glow, full content (explanation, optional KaTeX formula, optional ASCII visual, optional tip, optional gated challenge, "simplify" toggle, "I'm confused" chat toggle).
- **Completed:** `bg-surface`, neutral border, and the number badge swaps for a filled Coral-badge checkmark.

### Signature Component: Confused-Chat / Assistant
A collapsible violet-tinted panel (`bg-violet-500/8`, `border-violet-500/20`) nested inside the active step — its own persona color (Assistant violet) distinguishes it from every other callout (tip = amber, challenge = peach) so a student never confuses "the AI is hinting" with "this is a fact from the lesson."

## Do's and Don'ts

### Do:
- **Do** keep Coral Spark exclusive to the one primary action on screen (The Single Ignition Rule).
- **Do** use Seafoam Calm for highlight/informational state only — focus rings, progress, badges, active borders — never as a button fill.
- **Do** keep cards flat (border only) at rest; add the coral glow + `shadow-xl` only to mark the active step or a primary CTA.
- **Do** pair an emoji glyph with an uppercase label on every section header (🎯 Challenge, 🌍 Real World, 🧠 History, 💡 Tip, ❓ Confused) — it's part of the Study Companion voice.
- **Do** keep the four semantic hues locked to their single meanings (emerald=success, red=error, amber=tip, violet=assistant).
- **Do** maintain full light/dark token parity — every new color needs both a `:root` and a `:root.dark` value, not a computed filter.

### Don't:
- **Don't** add ambient drop shadows to resting surfaces — depth is a state signal, not decoration (The Border-Over-Shadow Rule).
- **Don't** use the 18px CTA pill radius on anything but the flow-level primary actions (Generate, Next Step, Cancel); `ui/Button` primitives stay at 8px.
- **Don't** fill outline/ghost/secondary buttons with either brand color — they stay border- or text-only.
- **Don't** introduce a fifth semantic hue for a new state (The Locked-Palette Rule); map it to the nearest existing meaning instead.
