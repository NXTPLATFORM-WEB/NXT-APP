import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) return jsonError("Server missing env vars", 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) return jsonError("Enter a valid email");

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { error } = await supabase
    .from("subscribers")
    .upsert([{ email }], { onConflict: "email" });

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true });
}
