import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  const { chart, task = "portrait", question = "" } = await req.json();
  if (!chart) return Response.json({ error: "chart is required" }, { status: 400, headers: cors });

  const prompt = `Ты создаёшь тёплую, конкретную астрологическую интерпретацию на русском языке.
Используй только факты из переданного JSON карты. Никогда не рассчитывай положения планет.
Пиши вероятностно: "может проявляться", "обратите внимание", "проверьте по своему опыту".
Не ставь диагнозы, не давай медицинских, психологических, юридических или инвестиционных рекомендаций.
Не гарантируй события, отношения, доход или результат. Напомни, что текст носит развлекательно-рефлексивный характер.
Верни валидный JSON с полями title, summary, sections и disclaimer. Задача: ${task}.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-4-20250514",
      max_tokens: 2200,
      temperature: 0.4,
      system: prompt,
      messages: [{ role: "user", content: JSON.stringify({ chart, question }) }],
    }),
  });
  const data = await response.json();
  return Response.json(data, { status: response.status, headers: cors });
});
