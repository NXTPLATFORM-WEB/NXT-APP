// src/app/page.js
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stories, setStories] = useState([]);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/moments", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          setError(json?.error || "Failed to load feed");
          setStories([]);
        } else {
          setStories(json?.data || []);
        }
      } catch (e) {
        setError(e?.message || "Network error");
        setStories([]);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>NXT</h1>
      <div style={{ opacity: 0.75, marginBottom: 18 }}>
        Real-time feed → click any card to open the moment
      </div>

      {loading && <div style={{ opacity: 0.8 }}>Loading…</div>}

      {!loading && error && (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {stories.map((s) => (
            <a
              key={s.id}
              href={`/moment?id=${s.id}`}   // ✅ ALWAYS numeric id
              style={{
                display: "block",
                padding: 16,
                borderRadius: 14,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                {s.source || "Unknown"}{" "}
                {s.published_at ? `• ${new Date(s.published_at).toLocaleString()}` : ""}
              </div>

              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>
                {s.title || "(no title)"}
              </div>

              <div style={{ marginTop: 10, opacity: 0.85 }}>
                {s.summary || "(no summary)"}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
