import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SignJWT } from "npm:jose@5";
import { handler, json, readJson, adminClient, HttpError } from "../_shared/http.ts";

// Обмен подписанного Telegram initData на короткоживущий Supabase JWT.
// Подпись проверяется по схеме Telegram Mini Apps (HMAC-SHA256).

const MAX_AUTH_AGE_SEC = 24 * 60 * 60; // initData не старше суток

async function hmac(keyBytes: Uint8Array, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface TgUser { id: number; username?: string; first_name?: string }

async function validateInitData(initData: string, botToken: string): Promise<TgUser> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new HttpError(401, "No hash");
  params.delete("hash");

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || (Date.now() / 1000 - authDate) > MAX_AUTH_AGE_SEC) {
    throw new HttpError(401, "initData expired");
  }

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = await hmac(new TextEncoder().encode("WebAppData"), botToken);
  const computed = toHex(await hmac(secretKey, dataCheckString));
  if (computed !== hash) throw new HttpError(401, "Bad signature");

  const userRaw = params.get("user");
  if (!userRaw) throw new HttpError(401, "No user in initData");
  return JSON.parse(userRaw) as TgUser;
}

Deno.serve(handler(async (req) => {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const jwtSecret = Deno.env.get("APP_JWT_SECRET");
  if (!botToken || !jwtSecret) throw new HttpError(500, "Auth is not configured");

  const { init_data } = await readJson<{ init_data?: string }>(req);
  if (!init_data) throw new HttpError(400, "init_data is required");

  const tgUser = await validateInitData(init_data, botToken);
  const admin = adminClient();

  // 1. Найти существующий маппинг или создать пользователя Supabase.
  const { data: existing } = await admin
    .from("telegram_accounts")
    .select("user_id")
    .eq("tg_id", tgUser.id)
    .maybeSingle();

  let userId = existing?.user_id as string | undefined;
  if (!userId) {
    const email = `tg${tgUser.id}@telegram.local`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { tg_id: tgUser.id, username: tgUser.username, first_name: tgUser.first_name },
    });
    if (createErr || !created?.user) throw new HttpError(500, "User creation failed");
    userId = created.user.id;
    await admin.from("telegram_accounts").insert({
      tg_id: tgUser.id,
      user_id: userId,
      username: tgUser.username,
      first_name: tgUser.first_name,
    });
  } else {
    await admin.from("telegram_accounts")
      .update({ last_login_at: new Date().toISOString(), username: tgUser.username, first_name: tgUser.first_name })
      .eq("tg_id", tgUser.id);
  }

  // 2. Текущий статус подписки и остаток бесплатных вопросов — для гейтинга на фронте.
  const { data: ent } = await admin
    .from("active_entitlements")
    .select("is_active")
    .eq("user_id", userId)
    .maybeSingle();
  const isPlus = ent?.is_active === true;

  const freeLimit = Number(Deno.env.get("FREE_QUESTIONS_PER_MONTH") || "3");
  const plusLimit = Number(Deno.env.get("PLUS_QUESTIONS_PER_MONTH") || "10");
  const limit = isPlus ? plusLimit : freeLimit;
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  const monthKey = monthStart.toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from("ai_usage")
    .select("used")
    .eq("user_id", userId)
    .eq("period_month", monthKey)
    .eq("kind", "universe_answer")
    .maybeSingle();
  const questionsLeft = Math.max(0, limit - (usage?.used ?? 0));

  // Сохранённая карта — чтобы вернувшийся пользователь не вводил данные заново.
  const { data: chartRow } = await admin
    .from("charts")
    .select("chart_json")
    .eq("user_id", userId)
    .maybeSingle();

  // Последние ответы Вселенной для архива (платная ценность — история).
  const { data: history } = await admin
    .from("answer_history")
    .select("id, question, title, summary, created_at")
    .eq("user_id", userId)
    .eq("kind", "universe_answer")
    .order("created_at", { ascending: false })
    .limit(10);

  // 3. Выпустить JWT, подписанный секретом проекта (его принимают и RLS, и наши функции).
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ role: "authenticated", aud: "authenticated" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60) // 1 час
    .sign(new TextEncoder().encode(jwtSecret));

  return json(req, {
    access_token: token,
    user_id: userId,
    expires_in: 3600,
    is_plus: isPlus,
    questions_left: questionsLeft,
    questions_limit: limit,
    chart: chartRow?.chart_json ?? null,
    history: history ?? [],
  });
}));
