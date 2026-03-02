// NOTE: API key is exposed in the client bundle.
// For production, proxy requests through a Cloudflare Worker or Vercel Edge Function.

// In dev: proxied by Vite (vite.config.js) → https://ollama.com/v1/chat/completions
// In production: deploy a server-side proxy (Cloudflare Worker / Vercel Edge) at /v1
const API_URL = "/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OLLAMA_API_KEY;
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "kimi-k2-thinking:cloud";

const SYSTEM_PROMPT = `You are an expert educational tutor. When given a subject and problem, generate a structured step-by-step lesson in JSON format.

LANGUAGE: All text shown to the user (title, step titles, explanations, tips, final_answer, real_world) must be written in European Portuguese (Portugal). Do not use Brazilian Portuguese variants. Keep field names and JSON keys in English exactly as specified.

IMPORTANT: Respond with ONLY valid JSON, no markdown, no extra text.

The JSON must follow this exact structure:
{
  "title": "short lesson title",
  "steps": [
    {
      "title": "Step title",
      "explanation": "Clear explanation of this step",
      "formula": "LaTeX expression string (no $ delimiters, e.g. \\frac{mv^2}{2} or F = ma) or null",
      "visual": "optional ASCII diagram/table or null",
      "tip": "optional insight or common mistake to avoid or null"
    }
  ],
  "final_answer": "The complete final answer",
  "real_world": "A real-world application or example of this concept"
}

Rules:
- 3 to 6 steps, each building on the previous
- Keep explanations concise and clear
- Use ASCII visuals for geometry, graphs, or tables when helpful
- The final_answer should be complete and clear
- real_world should be brief and relatable
- In formula field: write raw LaTeX without $ delimiters (e.g. "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}")
- In text fields (explanation, tip, final_answer): wrap inline math with $...$ (e.g. "using $F = ma$")

Handling incomplete or ambiguous problems:
Some exercises are intentionally vague or omit data — this is a deliberate pedagogical choice to test the student's critical thinking and attention. When you detect this:
- Begin with a step titled "Analysing the problem" that identifies exactly what information is given, what is being asked, and what appears to be missing or ambiguous.
- If standard assumptions exist (e.g. g = 9.8 m/s², ideal gas, frictionless surface, standard temperature and pressure), state them explicitly in that step and proceed to solve using those assumptions.
- If the problem is genuinely under-determined (multiple valid answers depending on unknown data), solve the general case or the most common case, and note in the tip field why the result would change with different values.
- Never refuse to engage. Always produce a complete lesson — the goal is to model good problem-solving reasoning, including how to handle ambiguity.
- In final_answer, clearly state any assumptions that were required to reach the answer.`;

/**
 * Fix common model JSON output issues without breaking structural whitespace:
 * - Literal newlines/carriage returns inside string values → \n / \r
 * - Bare LaTeX backslashes inside string values (e.g. \omega) → \\omega
 * Uses a character-level state machine so structural newlines (pretty-print)
 * are left untouched.
 */
function repairJson(str) {
  let out = '';
  let inStr = false;
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (inStr) {
      if (ch === '\\') {
        const nx = str[i + 1];
        if (nx === undefined) { out += ch; i++; continue; }
        // Pass through only JSON escapes that are never ambiguous with LaTeX:
        // \", \\, \/, \n, \r, \t, \uXXXX
        // \b (backspace) and \f (form feed) are excluded because models
        // almost always mean \begin / \frac, not control characters.
        if ('"\\\/nrtu'.includes(nx)) {
          out += ch + nx; i += 2;
        } else {
          // Bare LaTeX backslash (\frac, \begin, \omega, \b*, \f*…) — escape it
          out += '\\\\' + nx; i += 2;
        }
      } else if (ch === '"') {
        inStr = false; out += ch; i++;
      } else if (ch === '\n') {
        out += '\\n'; i++;
      } else if (ch === '\r') {
        out += '\\r'; i++;
      } else {
        out += ch; i++;
      }
    } else {
      if (ch === '"') inStr = true;
      out += ch; i++;
    }
  }
  return out;
}

export async function generateLesson(subject, problem) {
  const userMessage = `Subject: ${subject}\nProblem: ${problem}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;

  // Some models wrap the JSON in markdown code fences (```json ... ```)
  // even when instructed not to — strip them before parsing.
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) content = fenceMatch[1];
  content = content.trim();

  let lesson;
  try {
    lesson = JSON.parse(content);
  } catch {
    // First parse failed. Apply character-level repairs (literal newlines inside
    // strings, bare LaTeX backslashes) without touching structural whitespace.
    try {
      lesson = JSON.parse(repairJson(content));
    } catch {
      throw new Error("A resposta da API não é JSON válido.");
    }
  }

  if (
    !lesson.steps ||
    !Array.isArray(lesson.steps) ||
    lesson.steps.length === 0
  ) {
    throw new Error("Estrutura da lição inválida.");
  }

  return lesson;
}
