import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, requireUser, adminClient } from "../_shared/http.ts";

Deno.serve(handler(async (req) => {
  const { user } = await requireUser(req);
  const admin = adminClient();
  await admin
    .from("subscriptions")
    .update({ auto_renew: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  return json(req, { auto_renew: false });
}));
