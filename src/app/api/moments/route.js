// src/app/api/moments/route.js
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // -------------------------
    // SINGLE MOMENT: /api/moments?id=14
    // -------------------------
    if (idParam) {
      const id = Number(idParam);

      if (!Number.isFinite(id)) {
        return Response.json(
          { error: `Invalid id. Must be a number. Got: ${idParam}` },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("stories")
        .select("id, source, title, url, published_at, summary, raw")
        .eq("id", id)
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }

      return Response.json(data);
    }

    // -------------------------
    // FEED LIST: /api/moments
    // -------------------------
    const { data, error } = await supabase
      .from("stories")
      .select("id, source, title, url, published_at, summary") // IMPORTANT: includes id
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ items: data || [] });
  } catch (e) {
    return Response.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
