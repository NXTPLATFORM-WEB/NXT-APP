import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminToken = process.env.ADMIN_TOKEN;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !serviceRole) return jsonError("Missing Supabase env", 500);
    if (!adminToken) return jsonError("Missing ADMIN_TOKEN", 500);
    if (!openaiKey) return jsonError("Missing OPENAI_API_KEY", 500);

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body");
    }

    if (body.token !== adminToken) return jsonError("Unauthorized", 401);

    const limit = Math.min(Math.max(Number(body.limit || 10), 1), 20);

    const supabase = createClient(
      supabaseUrl,
      serviceRole,
      { auth: { persistSession: false } }
    );

    const { data: stories, error } = await supabase
      .from("stories")
      .select("source,title,url,published_at,summary")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return jsonError(error.message, 500);
    if (!stories?.length) return jsonError("No stories found", 400);

    const client = new OpenAI({ apiKey: openaiKey });

    const prompt = `
You are NXT’s editor.

Convert each story into ONE Moment.

Rules:
- Use ONLY provided stories
- Do NOT invent facts
- Use real names only if present
- Focus on what this reveals + why it matters next
- No politics ragebait, no graphic detail
- Return JSON only

Format:
{
  "moments": [
    {
      "topic": "Politics|Money|Health|Gaming|Culture|Tech|Sports|Music|To Be Honest",
      "status": "Breaking|Emerging|Shift|TBH|Fading",
      "title": "...",
      "signal": "...",
      "why_it_matters": "...",
      "where_tags": ["X","TikTok"],
      "source": "...",
      "source_url": "...",
      "source_published_at": "..."
    }
  ]
}

Stories:
${JSON.stringify(stories, null, 2)}
`;

    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const text = resp.output_text?.trim();
    if (!text) return jsonError("OpenAI returned empty output", 500);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return jsonError("OpenAI did not return valid JSON", 500);
    }

    const moments = parsed.moments || [];
    if (!moments.length) return jsonError("No moments generated", 500);

    const now = Date.now();
    const rows = moments.slice(0, limit).map((m, i) => ({
      id: `ai_${now}_${i}`,
      topic: m.topic || "Culture",
      status: m.status || "Emerging",
      title: String(m.title).slice(0, 140),
      signal: String(m.signal).slice(0, 500),
      why_it_matters: String(m.why_it_matters).slice(0, 500),
      where_tags: Array.isArray(m.where_tags) ? m.where_tags.slice(0, 6) : [],
      source: m.source,
      source_url: m.source_url,
      source_published_at: m.source_published_at
    }));

    const { error: insErr } = await supabase.from("moments").insert(rows);
    if (insErr) return jsonError(insErr.message, 500);

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 500 }
    );
  }
}
