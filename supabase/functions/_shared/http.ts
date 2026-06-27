import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { jwtVerify } from "npm:jose@5";

// Единый источник CORS/HTTP-логики для всех Edge Functions.
// Origin запирается на APP_ORIGIN, тело запроса ограничено по размеру,
// ответы не протекают наружу деталями внешних API.

const MAX_BODY_BYTES = 16 * 1024; // 16 KB достаточно для карты + вопроса

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Разрешённый origin вычисляется из APP_ORIGIN (схема+хост, без пути). */
function allowedOrigin(): string {
  const appOrigin = Deno.env.get("APP_ORIGIN") ?? "";
  try {
    return new URL(appOrigin).origin;
  } catch {
    return "";
  }
}

/** CORS-заголовки: отдаём конкретный origin только если он совпал с APP_ORIGIN. */
export function corsHeaders(req: Request): Record<string, string> {
  const allowed = allowedOrigin();
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = allowed && origin === allowed ? allowed : allowed;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/** Возвращает Response для preflight, иначе null. */
export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  return null;
}

/** JSON-ответ с CORS-заголовками. */
export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

/** Безопасно читает и парсит JSON-тело с лимитом размера. */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
  maxBytes = MAX_BODY_BYTES,
): Promise<T> {
  const raw = await req.text();
  if (raw.length > maxBytes) throw new HttpError(413, "Payload too large");
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

/**
 * Проверяет JWT локально по секрету проекта и возвращает пользователя +
 * клиент, действующий от его имени (RLS использует тот же токен).
 */
export async function requireUser(
  req: Request,
): Promise<{ user: { id: string; [k: string]: unknown }; authHeader: string; userClient: SupabaseClient }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) throw new HttpError(401, "Unauthorized");
  const token = authHeader.slice("Bearer ".length).trim();

  const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET");
  if (!jwtSecret) throw new HttpError(500, "Auth is not configured");

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
      algorithms: ["HS256"],
    });
    if (!payload.sub) throw new Error("no sub");
    userId = String(payload.sub);
  } catch {
    throw new HttpError(401, "Unauthorized");
  }

  // Клиент с токеном пользователя — PostgREST применяет RLS по тому же JWT.
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  return { user: { id: userId }, authHeader, userClient };
}

/** Сервисный клиент с полными правами — только внутри функций, никогда во frontend. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Оборачивает обработчик: ловит HttpError и непредвиденные ошибки, не протекая деталями. */
export function handler(fn: (req: Request) => Promise<Response>): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const pre = preflight(req);
    if (pre) return pre;
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof HttpError) return json(req, { error: err.message }, err.status);
      console.error("Unhandled error:", err);
      return json(req, { error: "Internal error" }, 500);
    }
  };
}
