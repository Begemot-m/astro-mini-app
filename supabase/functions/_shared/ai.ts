// Провайдер-абстракция для генерации текста.
// Переключение между Groq / Anthropic / GigaChat через переменную AI_PROVIDER.

const SYSTEM_PROMPT = `Ты создаёшь тёплую, конкретную астрологическую интерпретацию на русском языке.
Используй только факты из переданного JSON карты. Никогда не рассчитывай положения планет.
Пиши вероятностно: "может проявляться", "обратите внимание", "проверьте по своему опыту".
Не ставь диагнозы, не давай медицинских, психологических, юридических или инвестиционных рекомендаций.
Не гарантируй события, отношения, доход или результат. Напомни, что текст носит развлекательно-рефлексивный характер.
Верни СТРОГО валидный JSON-объект с полями: title (строка), summary (строка), sections (массив объектов {heading, body}), disclaimer (строка). Без markdown, без текста вне JSON.`;

/** Низкоуровневый вызов AI: system + user → сырой текст ответа (ожидаем JSON-строку). */
export async function aiComplete(system: string, user: string): Promise<string> {
  const provider = (Deno.env.get("AI_PROVIDER") ?? "groq").toLowerCase();
  switch (provider) {
    case "groq":
      return await callOpenAICompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: Deno.env.get("GROQ_API_KEY"),
        model: Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile",
        system,
        user,
      });
    case "gigachat":
      throw new Error("GigaChat provider is not wired yet");
    case "anthropic":
      return await callAnthropic(system, user);
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}

interface GenerateArgs {
  task: string;
  chart: unknown;
  question?: string;
}

/** Интерпретация по карте → нормализованная структура {title, summary, sections, disclaimer}. */
export async function generateInterpretation(args: GenerateArgs): Promise<{ text: string }> {
  const userMessage = JSON.stringify({ task: args.task, chart: args.chart, question: args.question ?? "" });
  const text = await aiComplete(SYSTEM_PROMPT, userMessage);
  return { text };
}

async function callOpenAICompatible(opts: {
  url: string; apiKey?: string; model: string; system: string; user: string;
}): Promise<string> {
  if (!opts.apiKey) throw new Error("AI API key is not configured");
  const response = await fetch(opts.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${opts.apiKey}` },
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.4,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (!response.ok) {
    console.error("AI provider error:", response.status, await response.text().catch(() => ""));
    throw new Error("AI provider error");
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty AI response");
  return text;
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-4-20250514",
      max_tokens: 2200,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok) {
    console.error("Anthropic error:", response.status, await response.text().catch(() => ""));
    throw new Error("AI provider error");
  }
  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty AI response");
  return text;
}

/** Безопасно парсит JSON из ответа модели (вырезает первый {...} на случай обёртки). */
export function parseJsonLoose(text: string): Record<string, unknown> {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return JSON.parse(start >= 0 && end >= 0 ? text.slice(start, end + 1) : text);
  } catch {
    return {};
  }
}

/** Нормализует ответ интерпретации в стабильную структуру. */
export function normalizeInterpretation(text: string): {
  title: string; summary: string; sections: { heading: string; body: string }[]; disclaimer: string;
} {
  const parsed = parseJsonLoose(text);
  const sectionsRaw = Array.isArray(parsed.sections) ? parsed.sections : [];
  return {
    title: typeof parsed.title === "string" ? parsed.title : "Интерпретация",
    summary: typeof parsed.summary === "string" ? parsed.summary : text.slice(0, 600),
    sections: sectionsRaw
      .map((s) => {
        const sec = s as Record<string, unknown>;
        return { heading: String(sec.heading ?? ""), body: String(sec.body ?? "") };
      })
      .filter((s) => s.body),
    disclaimer: typeof parsed.disclaimer === "string"
      ? parsed.disclaimer
      : "Текст носит развлекательно-рефлексивный характер и не заменяет профессиональную помощь.",
  };
}
