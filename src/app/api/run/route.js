import { NextResponse } from "next/server";
import Parser from "rss-parser";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const FEEDS = [
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { source: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
  { source: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  { source: "ESPN", url: "https://www.espn.com/espn/rss/news" },
  { source: "IGN", url: "https://feeds.ign.com/ign/all" },
];

function ok(json) {
  return NextResponse.json({ ok: true, ...json });
}
function fail(msg, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function isAuthorized(req, bodyToken) {
  const admin = process.env.ADMIN_TOKEN || "";
  const cronSecret = process.env.CRON_SECRET || "";

  // 1) Admin token via header or body
  const xAdmin = req.headers.get("x-admin") || "";
  if (admin && (xAdmin === admin || bodyToken === admin)) return true;

  // 2) Vercel cron secret via Authorization header: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (cronSecret && m?.[1] === cronSecret) return true;

  return false;
}

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !serviceRole) return fail("Missing Supabase env", 500);
    if (!openaiKey) return fail("Missing OPENAI_API_KEY", 500);

    let body = {};
    try {
      body = await req.json();
    } catch {
      // allow empty body (cron pings can be empty)
      body = {};
    }

    if (!isAuthorized(req, body.token)) return fail("Unauthorized", 401);

    const limit = Math.min(Math.max(Number(body.limit || 10), 1), 20);

    const supabase = createClient(
      supabaseUrl,
      serviceRole,
      { auth: { persistSession: false } }
    );

    const parser = new Parser();

    // ---- INGEST ----
    const stories = [];
    for (const f of FEEDS) {
      try {
        const feed = await parser.parseURL(f.url);
        for (const item of feed.items.slice(0, 8)) {
          stories.push({
            source: f.source,
            title: item.title || "",
            url: item.link || "",
            published_at: item.isoDate || item.pubDate || null,
            summary: item.contentSnippet || item.summary || "",
          });
        }
      } catch {
        // ignore per-feed failures
      }
    }

    if (stories.length) {
      // requires a unique constraint on stories.url for best results
      await supabase.from("stories").upsert(stories, { onConflict: "url" });
    }

    // ---- PULL LATEST STORIES ----
    const { data: latest, error: latestErr } = await supabase
      .from("stories")
      .select("source,title,url,published_at,summary")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (latestErr) return fail(latestErr.message, 500);
    if (!latest?.length) return fail("No stories found to generate from", 400);

    // ---- GENERATE MOMENTS ----
    const client = new OpenAI({ apiKey: openaiKey });

    const prompt = `
You are NXT’s editor.

Convert each story into ONE Moment.

Rules:
- Use ONLY provided stories
- Do NOT invent facts
- Use real names only if present
- No fake quotes
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
${JSON.stringify(latest, null, 2)}
`;

    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = resp.output_text?.trim();
    if (!text) return fail("OpenAI returned empty output", 500);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return fail("OpenAI did not return valid JSON", 500);
    }

    const moments = Array.isArray(parsed.moments) ? parsed.moments : [];
    if (!moments.length) return fail("No moments generated", 500);

    const now = Date.now();
    const rows = moments.slice(0, limit).map((m, i) => ({
      id: `ai_${now}_${i}`,
      topic: m.topic || "Culture",
      status: m.status || "Emerging",
      title: String(m.title || "").slice(0, 140),
      signal: String(m.signal || "").slice(0, 500),
      why_it_matters: String(m.why_it_matters || "").slice(0, 500),
      where_tags: Array.isArray(m.where_tags) ? m.where_tags.slice(0, 6) : [],
      source: m.source || null,
      source_url: m.source_url || null,
      source_published_at: m.source_published_at || null,
    }));

    const { error: insErr } = await supabase.from("moments").insert(rows);
    if (insErr) return fail(insErr.message, 500);

    return ok({
      ingested: stories.length,
      inserted: rows.length,
      ran_at: new Date().toISOString(),
    });
  } catch (e) {
    return fail(e?.message || String(e), 500);
  }
}
