// NOTE: API key is exposed in the client bundle.
// For production, proxy requests through a Cloudflare Worker or Vercel Edge Function.
// In dev: proxied by Vite (vite.config.js) → https://ollama.com/v1/chat/completions
// In production: deploy a server-side proxy (Cloudflare Worker / Vercel Edge) at /v1

const API_URL = "/v1/chat/completions";
const DEFAULT_MODEL = "kimi-k2-thinking:cloud";

export function getModel() {
  return import.meta.env.VITE_OLLAMA_MODEL || DEFAULT_MODEL;
}

const STORAGE_KEY = 'wiselab_api_key';

export function getApiKey() {
  const storedKey = localStorage.getItem(STORAGE_KEY);
  if (storedKey) return storedKey;
  return import.meta.env.VITE_OLLAMA_API_KEY || '';
}

export function hasApiKey() {
  return Boolean(localStorage.getItem(STORAGE_KEY)) || Boolean(import.meta.env.VITE_OLLAMA_API_KEY);
}

const SYSTEM_PROMPT = `You are an expert educational tutor. When given a problem, generate a structured step-by-step lesson in JSON format.

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
      "tip": "optional insight or common mistake to avoid or null",
      "challenge": {
        "type": "multiple_choice",
        "question": "A question testing understanding of this step",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0
      } or null
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
- challenge: Add a challenge every 3-4 steps (at steps with index 2, 5, etc. — roughly every third step). Set to null for other steps. The challenge tests understanding of the current step's content. Use multiple_choice type with 4 options (index 0-3). Make questions require applying the concept, not just recalling a number.

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

const ESTIMATED_CHARS = 1500; // typical lesson JSON length

export async function generateLesson(problem, onProgress) {
  const userMessage = `Problem: ${problem}`;
  const apiKey = getApiKey();
  const model = getModel();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
      format: "json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  // Parse SSE stream and accumulate content
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // hold incomplete line for next iteration

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") continue;
      try {
        const chunk = JSON.parse(raw);
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        content += delta;
        const pct = Math.min(Math.round((content.length / ESTIMATED_CHARS) * 90), 90);
        onProgress?.(pct);
      } catch {
        // malformed chunk — skip
      }
    }
  }

  onProgress?.(100);

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

  // Validate and sanitize challenge objects in each step
  for (const step of lesson.steps) {
    if (step.challenge != null) {
      const c = step.challenge
      const isValid =
        typeof c === 'object' &&
        c !== null &&
        c.type === 'multiple_choice' &&
        typeof c.question === 'string' &&
        c.question.trim().length > 0 &&
        Array.isArray(c.options) &&
        c.options.length > 0 &&
        c.options.every(opt => typeof opt === 'string' && opt.trim().length > 0) &&
        typeof c.correct === 'number' &&
        Number.isInteger(c.correct) &&
        c.correct >= 0 &&
        c.correct < c.options.length

      if (!isValid) {
        step.challenge = null
      }
    }
  }

  return lesson;
}

const SIMPLIFY_SYSTEM_PROMPT = `You are an expert educational tutor specializing in making complex concepts accessible. When given an explanation, rephrase it as a simple analogy that a child could understand.

LANGUAGE: Write your response in European Portuguese (Portugal). Do not use Brazilian Portuguese variants.

IMPORTANT: Respond with ONLY the simplified explanation text, no markdown, no extra formatting, no headers or labels.

Guidelines:
- Use everyday analogies and relatable comparisons
- Keep it concise (2-4 sentences maximum)
- Avoid technical jargon
- If the explanation involves math or formulas, describe what they represent conceptually
- Make it feel like a friendly conversation, not a lecture`

export async function simplifyExplanation(stepTitle, stepExplanation) {
  const userMessage = `Step title: ${stepTitle}\n\nExplanation: ${stepExplanation}\n\nPlease provide a simple analogy explaining this concept.`
  const apiKey = getApiKey();
  const model = getModel();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SIMPLIFY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ""
}

const CONFUSED_HELP_SYSTEM_PROMPT = `És um tutor paciente e encorajador. O aluno está com dificuldades num passo.

IDIOMA: Escreve sempre em Português de Portugal (não uses variantes brasileiras).

O TEU PAPEL:
- Dá pistas e perguntas orientadoras, NUNCA reveles a resposta completa
- Pergunta para esclarecer o que está a confundir
- Usa analogias e conceitos mais simples para criar pontes de entendimento
- Sê encorajador e supportivo
- Se o aluno parecer perdido, começa com uma pergunta simples como "Que parte te confunde mais?"
- Evita responder diretamente à pergunta; guia o aluno a descobrir

FORMATO: Apenas a tua resposta conversacional, sem formatação especial.`

export async function askConfusedHelp(stepContext, userMessage, history = []) {
  const contextText = `Passo: "${stepContext.title}"
Explicação: ${stepContext.explanation}
${stepContext.formula ? `Fórmula: ${stepContext.formula}` : ''}
${stepContext.visual ? `Visual: ${stepContext.visual}` : ''}
${stepContext.tip ? `Dica: ${stepContext.tip}` : ''}`
  const apiKey = getApiKey();
  const model = getModel();

  const messages = [
    { role: 'system', content: CONFUSED_HELP_SYSTEM_PROMPT },
  ]

  const recentHistory = history.slice(-6)
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content })
    }
  }

  messages.push({
    role: 'user',
    content: `Contexto do passo:\n${contextText}\n\nPergunta do aluno: ${userMessage}`
  })

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}
