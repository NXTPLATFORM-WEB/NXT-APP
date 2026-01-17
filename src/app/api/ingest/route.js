import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!url || !serviceRole) return jsonError("Server missing Supabase env vars", 500);
  if (!adminToken) return jsonError("Server missing ADMIN_TOKEN", 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  if (body?.token !== adminToken) return jsonError("Unauthorized", 401);

  const stories = Array.isArray(body?.stories) ? body.stories : [];
  if (stories.length === 0) return jsonError("No stories provided");

  // Keep it clean: only allow required fields
  const cleaned = stories
    .map((s) => ({
      source: String(s.source || "").trim(),
      title: String(s.title || "").trim(),
      url: String(s.url || "").trim(),
      published_at: s.published_at ? new Date(s.published_at).toISOString() : null,
      summary: s.summary ? String(s.summary) : null,
      raw: s.raw ?? null,
    }))
    .filter((s) => s.source && s.title && s.url);

  if (cleaned.length === 0) return jsonError("Stories were missing source/title/url");

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { error } = await supabase
    .from("stories")
    .upsert(cleaned, { onConflict: "url" });

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true, inserted: cleaned.length });
}
