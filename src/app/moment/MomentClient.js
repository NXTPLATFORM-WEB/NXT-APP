// src/app/moment/MomentClient.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function formatDate(v) {
  try {
    if (!v) return "";
    const d = new Date(v);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function MomentClient() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moment, setMoment] = useState(null);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      setMoment(null);

      if (!idParam) {
        setLoading(false);
        setError("Missing moment id in URL. Example: /moment?id=14");
        return;
      }

      const idNum = Number(idParam);
      if (!Number.isFinite(idNum)) {
        setLoading(false);
        setError(`Invalid id. Must be a number. Got: ${idParam}`);
        return;
      }

      try {
        const res = await fetch(`/api/moments?id=${idNum}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || "Failed to load moment");
        } else {
          setMoment(data);
        }
      } catch (e) {
        setError(e?.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [idParam]);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back
      </Link>

      {loading && <div style={{ opacity: 0.8 }}>Loading...</div>}

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

      {!loading && !error && moment && (
        <>
          <h1 style={{ fontSize: 34, marginBottom: 10 }}>
            {moment.title || "(no title)"}
          </h1>

          <div style={{ opacity: 0.8, marginBottom: 8 }}>
            <b>Source:</b> {moment.source || "Unknown"}
          </div>

          {moment.published_at && (
            <div style={{ opacity: 0.8, marginBottom: 18 }}>
              <b>Published:</b> {formatDate(moment.published_at)}
            </div>
          )}

          {moment.url && (
            <div style={{ marginBottom: 18 }}>
              <a href={moment.url} target="_blank" rel="noreferrer">
                Open original →
              </a>
            </div>
          )}

          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
            {moment.raw || moment.summary || "(No text)"}
          </div>
        </>
      )}
    </main>
  );
}
