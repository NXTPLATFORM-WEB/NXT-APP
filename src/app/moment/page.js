// src/app/moment/page.js
import Link from "next/link";

async function getMoment(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/moments?id=${id}`,
    { cache: "no-store" }
  );

  const data = await res.json();
  return { ok: res.ok, data };
}

function formatDate(v) {
  try {
    if (!v) return "";
    const d = new Date(v);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default async function MomentPage({ searchParams }) {
  const idParam = searchParams?.id;

  if (!idParam) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
          ← Back
        </Link>

        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          Error: Missing moment id in URL. Example: <b>/moment?id=14</b>
        </div>
      </main>
    );
  }

  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
          ← Back
        </Link>
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          Error: Invalid id. Must be a number. Got: <b>{idParam}</b>
        </div>
      </main>
    );
  }

  const { ok, data } = await getMoment(id);

  if (!ok) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
          ← Back
        </Link>
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          Error loading moment: <b>{data?.error || "Unknown error"}</b>
        </div>
      </main>
    );
  }

  const text = data?.raw || data?.summary || "(No text)";

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back
      </Link>

      <h1 style={{ fontSize: 34, marginBottom: 10 }}>
        {data?.title || "(no title)"}
      </h1>

      <div style={{ opacity: 0.8, marginBottom: 8 }}>
        <b>Source:</b> {data?.source || "Unknown"}
      </div>

      {data?.published_at && (
        <div style={{ opacity: 0.8, marginBottom: 18 }}>
          <b>Published:</b> {formatDate(data.published_at)}
        </div>
      )}

      {data?.url && (
        <div style={{ marginBottom: 18 }}>
          <a href={data.url} target="_blank" rel="noreferrer">
            Open original →
          </a>
        </div>
      )}

      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
        {text}
      </div>
    </main>
  );
}
