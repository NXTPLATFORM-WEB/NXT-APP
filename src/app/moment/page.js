"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function MomentPage() {
  const sp = useSearchParams();
  const id = sp.get("id");

  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      if (!id) {
        setLoading(false);
        setM(null);
        return;
      }

      // hard timeout so it never "loads forever"
      const timeout = setTimeout(() => {
        if (!cancelled) {
          setErr("Timed out loading this moment. Refresh and try again.");
          setLoading(false);
        }
      }, 8000);

      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      clearTimeout(timeout);
      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setM(null);
      } else {
        setM(data || null);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <main className="wrap">
        <div className="panel">
          <div className="title">No moment id.</div>
          <div className="footerHint" style={{ marginTop: 10 }}>
            Go back to <Link className="link" href="/">Home</Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="wrap">
        <div className="panel">
          <div className="title">Loading…</div>
          <div className="footerHint" style={{ marginTop: 10 }}>
            Pulling the moment from Supabase.
          </div>
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="wrap">
        <div className="panel">
          <div className="title">Couldn’t load this moment.</div>
          <div className="footerHint" style={{ marginTop: 10 }}>{err}</div>
          <div className="footerHint" style={{ marginTop: 10 }}>
            Back to <Link className="link" href="/">Home</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!m) {
    return (
      <main className="wrap">
        <div className="panel">
          <div className="title">Moment not found.</div>
          <div className="footerHint" style={{ marginTop: 10 }}>
            Back to <Link className="link" href="/">Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <header className="topbar">
        <div className="brand">
          <h1>Moment</h1>
          <p>{m.topic} · {m.status}</p>
        </div>
        <div className="pillrow">
          <Link className="cta" href="/">Home</Link>
          <Link className="cta" href="/admin/tools">Tools</Link>
        </div>
      </header>

      <article className="panel" style={{ marginTop: 16 }}>
        <div className="mini">
          <span className="pill">{m.topic}</span>
          <span className={`statusPill s${String(m.status || "Emerging").replace(/\s/g, "")}`}>
            {m.status}
          </span>
          {m.source && <span className="source">{m.source}</span>}
        </div>

        <h2 style={{ marginTop: 10 }}>{m.title}</h2>

        <div className="block">
          <div className="k">Signal</div>
          <div className="v">{m.signal}</div>
        </div>

        {m.why_it_matters && (
          <div className="block">
            <div className="k">Why it matters</div>
            <div className="v">{m.why_it_matters}</div>
          </div>
        )}

        {m.source_url && (
          <div className="block">
            <div className="k">Source</div>
            <div className="v">
              <a className="link" href={m.source_url} target="_blank" rel="noreferrer">
                Open original story →
              </a>
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
