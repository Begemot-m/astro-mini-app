import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, adminClient, HttpError } from "../_shared/http.ts";
import { generateInterpretation, normalizeInterpretation } from "../_shared/ai.ts";

// Разрешённые задачи — защита от произвольного task в промпте.
const ALLOWED_TASKS = new Set([
  "portrait",
  "universe_answer",
  "love",
  "money",
  "forecast_week",
  "forecast_month",
]);
const MAX_QUESTION_LEN = 280;

function intEnv(key: string, fallback: number): number {
  const v = Number(Deno.env.get(key));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

Deno.serve(handler(async (req) => {
  const { user, userClient } = await requireUser(req);
  const body = await readJson<{ task?: string; chart?: unknown; question?: string }>(req);

  // --- H2: валидация входа ---
  const task = String(body.task ?? "portrait");
  if (!ALLOWED_TASKS.has(task)) throw new HttpError(400, "Unknown task");
  const question = typeof body.question === "string" ? body.question.slice(0, MAX_QUESTION_LEN) : "";

  // Карта берётся из БД (источник истины), тело — только запасной вариант на этапе теста,
  // пока не подключён chart-calc. Свой chart_json пользователь читает по RLS.
  const { data: chartRow } = await userClient
    .from("charts")
    .select("chart_json")
    .eq("user_id", user.id)
    .maybeSingle();
  const chart = chartRow?.chart_json ?? body.chart;
  if (!chart || typeof chart !== "object") throw new HttpError(400, "chart is required");

  const admin = adminClient();

  // --- H1: лимит запросов по статусу подписки ---
  const { data: ent } = await admin
    .from("active_entitlements")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  const isPlus = ent?.is_active === true;
  const monthlyLimit = isPlus
    ? intEnv("PLUS_QUESTIONS_PER_MONTH", 10)
    : intEnv("FREE_QUESTIONS_PER_MONTH", 3);

  // Атомарно: проверка лимита + инкремент в одной транзакции (миграция 004).
  const { data: allowed, error: quotaError } = await admin.rpc("consume_ai_quota", {
    p_user_id: user.id,
    p_kind: task,
    p_limit: monthlyLimit,
  });
  if (quotaError) throw new HttpError(500, "Quota check failed");
  if (allowed === false) {
    return json(req, {
      error: "quota_exceeded",
      limit: monthlyLimit,
      is_plus: isPlus,
      message: isPlus
        ? "Лимит запросов в этом месяце исчерпан."
        : "Бесплатные запросы на этот месяц закончились. Оформите Астро+ для большего числа ответов.",
    }, 402);
  }

  // --- Генерация (Groq по умолчанию) ---
  let result;
  try {
    const ai = await generateInterpretation({ task, chart, question });
    result = normalizeInterpretation(ai.text);
  } catch (err) {
    console.error("interpret generation failed:", err);
    // Возврат квоты: неудачная генерация не должна списывать лимит.
    await admin.rpc("consume_ai_quota", { p_user_id: user.id, p_kind: task, p_limit: 0 }).catch(() => {});
    throw new HttpError(503, "AI temporarily unavailable");
  }

  // --- M2: сохраняем результат, наружу отдаём только чистую структуру ---
  await admin.from("interpretations").upsert({
    user_id: user.id,
    kind: task,
    content: result,
    model: Deno.env.get("AI_PROVIDER") ?? "groq",
    created_at: new Date().toISOString(),
  }).then(({ error }) => {
    if (error) console.error("store interpretation failed:", error);
  });

  return json(req, { ...result, is_plus: isPlus });
}));
