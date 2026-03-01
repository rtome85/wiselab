// NOTE: API key is exposed in the client bundle.
// For production, proxy requests through a Cloudflare Worker or Vercel Edge Function.

// In dev: proxied by Vite (vite.config.js) → https://ollama.com/v1/chat/completions
// In production: deploy a server-side proxy (Cloudflare Worker / Vercel Edge) at /v1
const API_URL = "/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OLLAMA_API_KEY;
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "kimi-k2-thinking:cloud";

const SYSTEM_PROMPT = `You are an expert educational tutor. When given a subject and problem, generate a structured step-by-step lesson in JSON format.

IMPORTANT: Respond with ONLY valid JSON, no markdown, no extra text.

The JSON must follow this exact structure:
{
  "title": "short lesson title",
  "steps": [
    {
      "title": "Step title",
      "explanation": "Clear explanation of this step",
      "formula": "optional LaTeX-like formula or null",
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
- real_world should be brief and relatable`;

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
    throw new Error("A resposta da API não é JSON válido.");
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
