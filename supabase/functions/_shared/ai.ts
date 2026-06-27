// Провайдер-абстракция для генерации интерпретаций.
// Переключение между Groq / Anthropic / GigaChat через переменную AI_PROVIDER —
// frontend и логика interpret при этом не меняются.

export interface AIResult {
  text: string; // сырой текст ответа модели (ожидаем JSON-строку)
}

const SYSTEM_PROMPT = `Ты создаёшь тёплую, конкретную астрологическую интерпретацию на русском языке.
Используй только факты из переданного JSON карты. Никогда не рассчитывай положения планет.
Пиши вероятностно: "может проявляться", "обратите внимание", "проверьте по своему опыту".
Не ставь диагнозы, не давай медицинских, психологических, юридических или инвестиционных рекомендаций.
Не гарантируй события, отношения, доход или результат. Напомни, что текст носит развлекательно-рефлексивный характер.
Верни СТРОГО валидный JSON-объект с полями: title (строка), summary (строка), sections (массив объектов {heading, body}), disclaimer (строка). Без markdown, без текста вне JSON.`;

interface GenerateArgs {
  task: string;
  chart: unknown;
  question?: string;
}

function buildUserMessage({ task, chart, question }: GenerateArgs): string {
  return JSON.stringify({ task, chart, question: question ?? "" });
}

/** Единая точка вызова AI. Бросает Error при сбое провайдера (вызывающий ловит). */
export async function generateInterpretation(args: GenerateArgs): Promise<AIResult> {
  const provider = (Deno.env.get("AI_PROVIDER") ?? "groq").toLowerCase();
  const userMessage = buildUserMessage(args);

  switch (provider) {
    case "groq":
      return await callOpenAICompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: Deno.env.get("GROQ_API_KEY"),
        model: Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile",
        system: SYSTEM_PROMPT,
        user: userMessage,
      });
    case "gigachat":
      // GigaChat тоже OpenAI-совместим, но требует OAuth-токен (не статический ключ).
      // Оставлено как точка расширения: получить access_token и передать его сюда.
      throw new Error("GigaChat provider is not wired yet");
    case "anthropic":
      return await callAnthropic(SYSTEM_PROMPT, userMessage);
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}

async function callOpenAICompatible(opts: {
  url: string;
  apiKey?: string;
  model: string;
  system: string;
  user: string;
}): Promise<AIResult> {
  if (!opts.apiKey) throw new Error("AI API key is not configured");
  const response = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${opts.apiKey}`,
    },
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
  return { text };
}

async function callAnthropic(system: string, user: string): Promise<AIResult> {
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
  return { text };
}

/** Безопасно парсит JSON-ответ модели в нормализованную структуру. */
export function normalizeInterpretation(text: string): {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  disclaimer: string;
} {
  let parsed: Record<string, unknown> = {};
  try {
    // На случай, если модель обернула JSON в текст — вырезаем первый {...}.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    parsed = JSON.parse(start >= 0 && end >= 0 ? text.slice(start, end + 1) : text);
  } catch {
    parsed = {};
  }
  const sectionsRaw = Array.isArray(parsed.sections) ? parsed.sections : [];
  return {
    title: typeof parsed.title === "string" ? parsed.title : "Интерпретация",
    summary: typeof parsed.summary === "string" ? parsed.summary : (typeof text === "string" ? text.slice(0, 600) : ""),
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
