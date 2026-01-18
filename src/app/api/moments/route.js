// src/app/api/moments/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // If no id, return the feed list
    if (!idParam) {
      const { data, error } = await supabaseServer
        .from("stories")
        .select("id, source, title, url, published_at, summary")
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    // If id exists, it MUST be a number
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: `Invalid id. Must be a number. Got: ${idParam}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("stories")
      .select("id, source, title, url, published_at, summary, raw")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
