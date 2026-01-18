"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function MomentClient({ id }) {
  const [moment, setMoment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const safeId = useMemo(() => (id ? String(id) : ""), [id]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");
      setMoment(null);

      if (!safeId) {
        setLoading(false);
        setErr("Missing moment id in URL. Example: /moment?id=1");
        return;
      }

      try {
        const res = await fetch(`/api/moments?id=${encodeURIComponent(safeId)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) setMoment(data);
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
  }, [safeId]);

  const body =
    moment?.summary ||
    moment?.text ||
    moment?.description ||
    "";

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/" style={{ color: "#fff", opacity: 0.85, textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      {loading && <div>Loading…</div>}

      {!loading && err && (
        <div style={{ padding: 12, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {!loading && !err && moment && (
        <>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 34, lineHeight: 1.1 }}>
            {moment.title || "Untitled"}
          </h1>

          <div style={{ opacity: 0.85, marginBottom: 18 }}>
            <div>
              <strong>Topic:</strong> {moment.topic || "—"}
            </div>
            <div>
              <strong>Source:</strong>{" "}
              {moment.url ? (
                <a
                  href={moment.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#cfd6ff" }}
                >
                  {moment.source || "Open link"}
                </a>
              ) : (
                "—"
              )}
            </div>
            {moment.published_at && (
              <div>
                <strong>Published:</strong> {new Date(moment.published_at).toLocaleString()}
              </div>
            )}
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              minHeight: 140,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              fontSize: 16,
            }}
          >
            {body ? body : <em>(No text)</em>}
          </div>
        </>
      )}
    </div>
  );
}
