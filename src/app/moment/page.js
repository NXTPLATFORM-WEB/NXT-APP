// src/app/moment/page.js
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function MomentPage({ searchParams }) {
  // Next 16 can treat this as a Promise in some cases:
  const sp = await searchParams;
  const idParam = sp?.id;

  if (!idParam) {
    return (
      <main style={{ padding: 24 }}>
        <Link href="/" style={{ color: "#cbd5ff" }}>← Back</Link>
        <div style={{ marginTop: 16, padding: 12, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          Error: Missing moment id in URL. Example: <code>/moment?id=14</code>
        </div>
      </main>
    );
  }

  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return (
      <main style={{ padding: 24 }}>
        <Link href="/" style={{ color: "#cbd5ff" }}>← Back</Link>
        <div style={{ marginTop: 16, padding: 12, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          Error: Invalid id. Must be a number. Got: <code>{String(idParam)}</code>
        </div>
      </main>
    );
  }

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("stories")
    .select("id, source, title, url, published_at, summary, raw")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 24 }}>
        <Link href="/" style={{ color: "#cbd5ff" }}>← Back</Link>
        <div style={{ marginTop: 16, padding: 12, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          Error loading moment: <pre>{error?.message ?? "Not found"}</pre>
        </div>
      </main>
    );
  }

  const published = data.published_at
    ? new Date(data.published_at).toLocaleString()
    : "";

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#cbd5ff" }}>← Back</Link>

      <h1 style={{ marginTop: 16, fontSize: 40, lineHeight: 1.1 }}>{data.title}</h1>

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        <div><b>Source:</b> {data.source ?? "Unknown"}</div>
        {published ? <div><b>Published:</b> {published}</div> : null}
        {data.url ? (
          <div style={{ marginTop: 6 }}>
            <a href={data.url} target="_blank" rel="noreferrer" style={{ color: "#cbd5ff" }}>
              Open original article →
            </a>
          </div>
        ) : null}
      </div>

      <hr style={{ margin: "18px 0", borderColor: "rgba(255,255,255,0.15)" }} />

      {data.summary ? (
        <p style={{ fontSize: 18, opacity: 0.95 }}>{data.summary}</p>
      ) : (
        <p style={{ opacity: 0.7 }}>(No summary text)</p>
      )}

      {/* If you stored full text in raw, show it (optional) */}
      {data.raw && typeof data.raw === "string" ? (
        <div style={{ marginTop: 18, whiteSpace: "pre-wrap", lineHeight: 1.6, opacity: 0.9 }}>
          {data.raw}
        </div>
      ) : null}
    </main>
  );
}
