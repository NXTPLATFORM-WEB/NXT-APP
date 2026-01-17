import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Prevent static prerender on Vercel (important)
export const dynamic = "force-dynamic";

function MomentInner() {
  const searchParams = useSearchParams();
  const id = (searchParams.get("id") || "").trim();

  const [moment, setMoment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr("");
      setLoading(true);
      setMoment(null);

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("moments")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (error) throw error;
        if (!data) {
          setErr(`Moment not found for id: "${id}"`);
        } else {
          setMoment(data);
        }
      } catch (e) {
        if (cancelled) return;
        setErr(e?.message || "Failed to load moment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back
        </Link>
        <Link href="/admin" style={{ textDecoration: "underline" }}>
          Admin
        </Link>
      </div>

      <h1 style={{ marginTop: 18 }}>Moment</h1>

      {!id && (
        <div style={{ padding: 14, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 600 }}>No id provided</div>
          <div style={{ marginTop: 8 }}>
            Try: <code>/moment?id=m1</code>
          </div>
        </div>
      )}

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}

      {!loading && err && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid #ffb4b4",
            borderRadius: 10,
            background: "#fff5f5",
          }}
        >
          <div style={{ fontWeight: 700 }}>Error</div>
          <div style={{ marginTop: 6 }}>{err}</div>
        </div>
      )}

      {!loading && moment && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            {moment.topic ? `Topic: ${moment.topic}` : "Topic: (none)"} ·{" "}
            {moment.created_at ? new Date(moment.created_at).toLocaleString() : ""}
          </div>

          <h2 style={{ margin: "10px 0 0" }}>{moment.title || "Untitled"}</h2>

          {moment.summary && (
            <p style={{ marginTop: 10, lineHeight: 1.6 }}>{moment.summary}</p>
          )}

          {moment.body && (
            <div style={{ marginTop: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {moment.body}
            </div>
          )}

          {moment.url && (
            <div style={{ marginTop: 14 }}>
              Source:{" "}
              <a href={moment.url} target="_blank" rel="noreferrer">
                {moment.url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MomentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <MomentInner />
    </Suspense>
  );
}
