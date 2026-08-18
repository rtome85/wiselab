/* Collapsed stack card layout — compact summary for a completed step tucked behind the active card */
const COLLAPSED_HEIGHT = 56

// How much of a collapsed card stays visible (its header) once the card in front of it overlaps it.
export function collapsedPeek(depth) {
  return Math.max(44 - (depth - 1) * 8, 16)
}

// Negative margin (toward the neighbor in front) needed to produce that peek.
export function collapsedOverlap(depth) {
  return -(COLLAPSED_HEIGHT - collapsedPeek(depth))
}
