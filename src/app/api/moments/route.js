import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id param" },
      { status: 400 }
    );
  }

  // force numeric id
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "id must be a number (DB id)" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("stories")
    .select(`
      id,
      source,
      title,
      url,
      published_at,
      summary,
      raw
    `)
    .eq("id", numericId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
