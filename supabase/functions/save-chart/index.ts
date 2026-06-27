import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, adminClient, HttpError } from "../_shared/http.ts";

// Сохраняет данные рождения и карту в Supabase, чтобы они не терялись
// между устройствами и переустановками (источник истины — БД, не localStorage).

interface Birth { date?: string; time?: string; time_unknown?: boolean; place?: string }

Deno.serve(handler(async (req) => {
  const { user } = await requireUser(req);
  const body = await readJson<{ birth?: Birth; chart?: unknown }>(req);
  const birth = body.birth ?? {};
  if (!birth.date) throw new HttpError(400, "birth.date is required");
  if ((birth.place ?? "").length > 120) throw new HttpError(400, "place too long");

  const admin = adminClient();
  const nowIso = new Date().toISOString();

  const { error: birthErr } = await admin.from("birth_data").upsert({
    user_id: user.id,
    birth_date: birth.date,
    birth_time: birth.time_unknown ? null : (birth.time || null),
    time_unknown: !!birth.time_unknown,
    place_name: birth.place || "",
    updated_at: nowIso,
  });
  if (birthErr) {
    console.error("save birth_data failed:", birthErr);
    throw new HttpError(500, "Save failed");
  }

  const { error: chartErr } = await admin.from("charts").upsert({
    user_id: user.id,
    chart_json: body.chart ?? {},
    engine_version: "frontend-basic-v1",
    computed_at: nowIso,
  });
  if (chartErr) {
    console.error("save charts failed:", chartErr);
    throw new HttpError(500, "Save failed");
  }

  return json(req, { ok: true });
}));
