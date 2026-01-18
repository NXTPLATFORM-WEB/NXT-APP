"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function pickBestText(row) {
  // Try common fields in priority order
  const raw = row?.raw || {};
  const text =
    row?.content ||
    row?.summary ||
    raw?.content ||
    raw?.description ||
    raw?.["content:encoded"] ||
    "";

  // If it's an object/array, stringify it safely
  if (typeof text === "string") return text;
  try {
    return JSON.stringify(text, null, 2);
  } catch {
    return String(text);
  }
}

export default function MomentClient({ id }) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(`/api/moments?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        if (!cancelled) {
          setRow(data);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load moment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const bodyText = useMemo(() => (row ? pickBestText(row) : ""), [row]);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        Loading moment <b>{id}</b>…
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <div style={{ marginBottom: 12 }}>
          <Link href="/" style={{ color: "white", opacity: 0.8 }}>
            ← Back
          </Link>
        </div>
        <div style={{ background: "rgba(255,0,0,0.15)", padding: 12, borderRadius: 10 }}>
          Error: {err}
        </div>
      </div>
    );
  }

  const title = row?.title || "(no title)";
  const source = row?.source || "(unknown source)";
  const url = row?.url || "";
  const published = row?.published_at
    ? new Date(row.published_at).toLocaleString()
    : "";

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/" style={{ color: "white", opacity: 0.85 }}>
          ← Back
        </Link>
      </div>

      <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 10px 0" }}>{title}</h1>

      <div style={{ opacity: 0.85, marginBottom: 14 }}>
        <div><b>Source:</b> {source}</div>
        {published ? <div><b>Published:</b> {published}</div> : null}
        {url ? (
          <div>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "white" }}>
              Open original article →
            </a>
          </div>
        ) : null}
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.25)", margin: "18px 0" }} />

      {/* Body */}
      <div
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          fontSize: 16,
          opacity: 0.98,
        }}
      >
        {bodyText?.trim() ? bodyText : "(No text found for this moment.)"}
      </div>
    </div>
  );
}
