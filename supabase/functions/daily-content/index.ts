import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, adminClient, HttpError } from "../_shared/http.ts";
import { aiComplete, parseJsonLoose } from "../_shared/ai.ts";

// Ежедневный контент главной: прогноз дня, сферы, неделя/месяц.
// Генерируется один раз в день на пользователя и кэшируется по дате (анти-абуз + экономия AI).

function dailyPrompt(dateStr: string, isPlus: boolean): string {
  const plusPart = isPlus
    ? `,
  "week": {"title": строка, "body": 2-3 предложения},
  "month": {"title": строка, "body": 2-3 предложения}`
    : "";
  return `Ты пишешь короткий персональный астро-контент на русском по натальной карте пользователя на дату ${dateStr}.
Используй факты из JSON карты, тон вероятностный ("может", "обратите внимание"), без гарантий, диагнозов и финансовых/медицинских советов.
Верни СТРОГО валидный JSON без markdown:
{
  "energy": {"title": 1-2 слова, "body": 1-2 предложения, "percent": число 50-95},
  "dayparts": [
    {"label": "Утро", "title": 1 слово, "level": число 40-95},
    {"label": "День", "title": 1 слово, "level": число 40-95},
    {"label": "Вечер", "title": 1 слово, "level": число 40-95}
  ],
  "forecast": {"title": строка, "body": 2-3 предложения, "advice": одна короткая фраза},
  "spheres": [
    {"key": "love", "label": "Любовь", "title": 1-2 слова, "text": короткая фраза, "percent": число 50-95},
    {"key": "money", "label": "Деньги", "title": 1-2 слова, "text": короткая фраза, "percent": число 50-95},
    {"key": "resource", "label": "Ресурс", "title": 1-2 слова, "text": короткая фраза, "percent": число 50-95}
  ]${plusPart}
}`;
}

Deno.serve(handler(async (req) => {
  const { user, userClient } = await requireUser(req);
  const admin = adminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Уже сгенерировано сегодня? — отдаём из кэша (без нового вызова AI).
  const { data: cached } = await admin
    .from("daily_content")
    .select("content")
    .eq("user_id", user.id)
    .eq("content_date", today)
    .maybeSingle();
  if (cached?.content) return json(req, cached.content);

  // 2. Карта из БД (источник истины) или из тела на этапе теста.
  const body = await readJson<{ chart?: unknown }>(req).catch(() => ({}));
  const { data: chartRow } = await userClient
    .from("charts").select("chart_json").eq("user_id", user.id).maybeSingle();
  const chart = chartRow?.chart_json ?? body.chart;
  if (!chart || typeof chart !== "object") throw new HttpError(400, "chart is required");

  // 3. Статус подписки определяет глубину (неделя/месяц только для Астро+).
  const { data: ent } = await admin
    .from("active_entitlements").select("is_active").eq("user_id", user.id).maybeSingle();
  const isPlus = ent?.is_active === true;

  // 4. Генерация.
  let content: Record<string, unknown>;
  try {
    const text = await aiComplete(dailyPrompt(today, isPlus), JSON.stringify({ chart, date: today }));
    content = parseJsonLoose(text);
    if (!content.forecast || !Array.isArray(content.spheres)) throw new Error("bad shape");
  } catch (err) {
    console.error("daily-content generation failed:", err);
    throw new HttpError(503, "AI temporarily unavailable");
  }
  content.is_plus = isPlus;
  content.date = today;

  // 5. Кэшируем на сегодня.
  await admin.from("daily_content").upsert({ user_id: user.id, content_date: today, content })
    .then(({ error }) => { if (error) console.error("store daily_content failed:", error); });

  return json(req, content);
}));
