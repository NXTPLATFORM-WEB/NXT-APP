// src/lib/supabaseServer.js
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server env)");
  }

  // Service role key must NEVER be used in client components.
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
