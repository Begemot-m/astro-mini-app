import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, adminClient, HttpError } from "../_shared/http.ts";

// Сохраняет имя, данные рождения и карту в Supabase.
// Данные рождения можно менять не чаще раза в 7 дней (защита от бесплатных пересчётов).

interface Birth { date?: string; time?: string; time_unknown?: boolean; place?: string }
const CHANGE_COOLDOWN_DAYS = 7;

function birthChanged(existing: Record<string, unknown>, incoming: Birth): boolean {
  const exTime = existing.birth_time ? String(existing.birth_time).slice(0, 5) : "";
  const inTime = incoming.time ? incoming.time.slice(0, 5) : "";
  return (
    existing.birth_date !== incoming.date ||
    String(existing.place_name ?? "") !== String(incoming.place ?? "") ||
    Boolean(existing.time_unknown) !== Boolean(incoming.time_unknown) ||
    exTime !== inTime
  );
}

Deno.serve(handler(async (req) => {
  const { user } = await requireUser(req);
  const body = await readJson<{ birth?: Birth; chart?: unknown; name?: string }>(req);
  const admin = adminClient();
  const nowIso = new Date().toISOString();

  // --- Имя (необязательно, можно менять свободно) ---
  if (typeof body.name === "string" && body.name.trim()) {
    const name = body.name.trim().slice(0, 60);
    await admin.from("telegram_accounts").update({ display_name: name }).eq("user_id", user.id);
  }

  // --- Данные рождения (необязательно: запрос может быть только про имя) ---
  if (body.birth?.date) {
    const birth = body.birth;
    if ((birth.place ?? "").length > 120) throw new HttpError(400, "place too long");

    const { data: existing } = await admin
      .from("birth_data")
      .select("birth_date, birth_time, time_unknown, place_name, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing && birthChanged(existing, birth)) {
      const updatedAt = new Date(String(existing.updated_at)).getTime();
      const daysSince = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < CHANGE_COOLDOWN_DAYS) {
        const nextAt = new Date(updatedAt + CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
        return json(req, {
          error: "change_limited",
          message: `Данные рождения можно менять раз в неделю. Следующее изменение будет доступно позже.`,
          next_change_at: nextAt,
        }, 429);
      }
    }

    const { error: birthErr } = await admin.from("birth_data").upsert({
      user_id: user.id,
      birth_date: birth.date,
      birth_time: birth.time_unknown ? null : (birth.time || null),
      time_unknown: !!birth.time_unknown,
      place_name: birth.place || "",
      updated_at: nowIso,
    });
    if (birthErr) { console.error("save birth_data failed:", birthErr); throw new HttpError(500, "Save failed"); }

    const { error: chartErr } = await admin.from("charts").upsert({
      user_id: user.id,
      chart_json: body.chart ?? {},
      engine_version: "frontend-basic-v1",
      computed_at: nowIso,
    });
    if (chartErr) { console.error("save charts failed:", chartErr); throw new HttpError(500, "Save failed"); }

    // Смена данных рождения инвалидирует кэш дневного контента и портрета.
    await admin.from("daily_content").delete().eq("user_id", user.id);
    await admin.from("interpretations").delete().eq("user_id", user.id).eq("kind", "portrait");
  }

  return json(req, { ok: true });
}));
