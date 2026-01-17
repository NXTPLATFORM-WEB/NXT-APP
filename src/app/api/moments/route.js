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
    return jsonError("Invalid JSON body");
  }

  const { token, id, status, title, signal, why_it_matters, where_tags, topic } = body || {};

  if (!token || token !== adminToken) return jsonError("Unauthorized", 401);

  const cleanId = String(id || "").trim();
  const cleanStatus = String(status || "").trim();
  const cleanTitle = String(title || "").trim();
  const cleanSignal = String(signal || "").trim();
  const cleanTopic = String(topic || "Culture").trim() || "Culture";

  if (!cleanId) return jsonError("Missing id");
  if (!cleanStatus) return jsonError("Missing status");
  if (!cleanTitle) return jsonError("Missing title");
  if (!cleanSignal) return jsonError("Missing signal");

  const tagsArray = Array.isArray(where_tags)
    ? where_tags.map((t) => String(t).trim()).filter(Boolean)
    : String(where_tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  // created_at defaults to now() in the table, no manual “minutes ago”
  const { data, error } = await supabase
    .from("moments")
    .upsert(
      [
        {
          id: cleanId,
          status: cleanStatus,
          title: cleanTitle,
          signal: cleanSignal,
          why_it_matters: why_it_matters ? String(why_it_matters) : null,
          where_tags: tagsArray,
          topic: cleanTopic,
        },
      ],
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true, moment: data });
}
