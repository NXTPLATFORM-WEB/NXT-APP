"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MomentClient() {
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id") || "", [searchParams]);

  const [loading, setLoading] = useState(true);
  const [moment, setMoment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setMoment(null);

      if (!id) {
        setLoading(false);
        setError('Missing id. Example: /moment?id=m1');
        return;
      }

      try {
        const { data, error } = await supabase
          .from("moments")
          .select("*")
          .eq("id", id)
          .single();

        if (cancelled) return;

        if (error) throw error;
        setMoment(data);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Failed to load moment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div>Loading…</div>;

  if (error) {
    return (
      <div style={{ maxWidth: 720 }}>
        <h2 style={{ marginBottom: 8 }}>Couldn’t load moment</h2>
        <p style={{ color: "crimson" }}>{error}</p>
        <p style={{ opacity: 0.8 }}>
          Try: <code>/moment?id=m1</code>
        </p>
      </div>
    );
  }

  if (!moment) return <div>Not found.</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back
      </a>

      <h1 style={{ margin: "8px 0 6px" }}>{moment.title || "Moment"}</h1>
      <div style={{ opacity: 0.7, marginBottom: 18 }}>
        {moment.topic ? `Topic: ${moment.topic}` : null}
        {moment.minutes_ago != null ? ` • ${moment.minutes_ago}m ago` : null}
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: 16,
          lineHeight: 1.55,
        }}
      >
        <p style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>
          {moment.summary || moment.body || "(No text)"}
        </p>

        {moment.source_url ? (
          <p style={{ marginBottom: 0, opacity: 0.85 }}>
            Source:{" "}
            <a href={moment.source_url} target="_blank" rel="noreferrer">
              {moment.source_url}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
