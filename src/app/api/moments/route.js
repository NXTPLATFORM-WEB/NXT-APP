// src/app/api/moments/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const sb = supabaseServer();

    // If id is provided, it MUST be numeric because your DB id is bigint/int.
    if (id) {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        return NextResponse.json(
          { error: `Invalid id. Expected a number, got: ${id}` },
          { status: 400 }
        );
      }

      const { data, error } = await sb
        .from("stories")
        .select("id, source, title, url, published_at, summary, raw")
        .eq("id", numericId)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    // List
    const { data, error } = await sb
      .from("stories")
      .select("id, source, title, url, published_at, summary")
      .order("published_at", { ascending: false })
      .limit(60);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ feed: data });
  } catch (e) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
