import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, adminClient, HttpError } from "../_shared/http.ts";
import { aiComplete, parseJsonLoose } from "../_shared/ai.ts";

// Глубокий портрет по "крючкам узнавания" (эффект "да, это про меня").
// Генерируется один раз по карте и кэшируется в interpretations (kind=portrait).
// Не тратит квоту вопросов — это базовый бесплатный контент (с платной глубиной).

const PORTRAIT_PROMPT = `Ты пишешь глубокий, узнаваемый астропортрет на русском по натальной карте.
Цель — чтобы человек почувствовал "да, это точно про меня". Опирайся на факты карты (Солнце, Луна, асцендент, аспекты, стихии). Тон вероятностный ("может проявляться", "обратите внимание"), без диагнозов, гарантий и финансовых/медицинских советов.

Сделай 6 разделов по "крючкам узнавания", в таком порядке:
1. Внутреннее противоречие (каким человек кажется снаружи и какой он внутри)
2. Скрытая сила (талант, который человек недооценивает в себе)
3. Что задевает (эмоциональная уязвимость, где человек ранимее, чем показывает)
4. Как вас видят со стороны (первое впечатление vs суть)
5. Повторяющийся сценарий (паттерн в отношениях или делах)
6. Чего вы хотите на самом деле и куда расти

Для КАЖДОГО раздела:
- "teaser": 1-2 предложения с узнаваемым, конкретным наблюдением (его видно бесплатно)
- "full": 3-4 предложения подробнее, со связкой через 2-3 фактора карты и практическим проявлением

Верни СТРОГО валидный JSON без markdown:
{
  "title": строка (тёплый заголовок портрета),
  "summary": 2-3 предложения общего узнаваемого портрета,
  "sections": [ {"heading": строка, "teaser": строка, "full": строка}, ... 6 штук ],
  "disclaimer": строка
}`;

Deno.serve(handler(async (req) => {
  const { user, userClient } = await requireUser(req);
  const admin = adminClient();

  const { data: ent } = await admin
    .from("active_entitlements").select("is_active").eq("user_id", user.id).maybeSingle();
  const isPlus = ent?.is_active === true;

  // 1. Кэш: портрет стабилен, генерим один раз (до смены данных рождения).
  const { data: cached } = await admin
    .from("interpretations").select("content").eq("user_id", user.id).eq("kind", "portrait").maybeSingle();
  if (cached?.content) return json(req, { ...cached.content, is_plus: isPlus });

  // 2. Карта из БД или из тела (этап теста).
  const body = await readJson<{ chart?: unknown }>(req).catch(() => ({}));
  const { data: chartRow } = await userClient
    .from("charts").select("chart_json").eq("user_id", user.id).maybeSingle();
  const chart = chartRow?.chart_json ?? body.chart;
  if (!chart || typeof chart !== "object") throw new HttpError(400, "chart is required");

  // 3. Генерация.
  let result: Record<string, unknown>;
  try {
    const text = await aiComplete(PORTRAIT_PROMPT, JSON.stringify({ chart }));
    result = parseJsonLoose(text);
    if (!Array.isArray(result.sections) || result.sections.length === 0) throw new Error("bad shape");
  } catch (err) {
    console.error("portrait generation failed:", err);
    throw new HttpError(503, "AI temporarily unavailable");
  }

  // 4. Кэшируем (перезапишется при смене данных рождения — save-chart это чистит).
  await admin.from("interpretations").upsert({
    user_id: user.id, kind: "portrait", content: result,
    model: Deno.env.get("AI_PROVIDER") ?? "groq", created_at: new Date().toISOString(),
  }).then(({ error }) => { if (error) console.error("store portrait failed:", error); });

  return json(req, { ...result, is_plus: isPlus });
}));
