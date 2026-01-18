import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  if (!idParam) {
    const { data, error } = await supabaseServer
      .from("stories")
      .select("id, source, title, summary, published_at")
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { error: `Invalid id ${idParam}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
