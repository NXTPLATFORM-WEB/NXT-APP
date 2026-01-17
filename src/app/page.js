"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const TABS = ["All", "Politics", "Money", "Health", "Gaming", "Culture", "Tech", "Sports", "Music", "To Be Honest"];

function minutesAgo(createdAtIso) {
  if (!createdAtIso) return 0;
  const created = new Date(createdAtIso).getTime();
  const now = Date.now();
  return Math.floor(Math.max(0, now - created) / 60000);
}
function timeLabel(m) {
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function HomePage() {
  const [tab, setTab] = useState("All");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    setLoading(true);

    let q = supabase
      .from("moments")
      .select("id,topic,status,title,signal,source,source_url,created_at")
      .order("created_at", { ascending: false })
      .limit(80);

    if (tab !== "All") q = q.eq("topic", tab);

    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const moments = useMemo(() => {
    void tick;
    return rows.map((r) => ({
      ...r,
      minutesAgo: minutesAgo(r.created_at),
    }));
  }, [rows, tick]);

  return (
    <main className="wrap">
      <header className="topbar">
        <div className="brand">
          <h1>NXT</h1>
          <p>Real events → real sources → NXT signals.</p>
        </div>
        <div className="pillrow">
          <Link className="cta" href="/admin">Admin</Link>
          <Link className="cta" href="/admin/tools">Tools</Link>
        </div>
      </header>

      <section className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </section>

      <section className="banner">
        <div className="bannerTop">
          <div className="badge">LIVE</div>
          <div className="bannerMeta">
            Auto-ingest + AI editor. Tap any card to open the Moment.
          </div>
        </div>
        <div className="bannerTitle">The feed that explains the shift.</div>
        <div className="bannerDesc">
          Headlines tell you <b>what happened</b>. NXT tells you <b>what it means next</b>.
        </div>
      </section>

      <hr className="hr" />

      {loading && <div className="footerHint">Loading…</div>}

      {!loading && (
        <section className="grid">
          {moments.map((m) => (
            <Link
              key={m.id}
              href={`/moment?id=${encodeURIComponent(m.id)}`}
              className="card"
            >
              <div className="mini">
                <span className="pill">{m.topic || "Culture"}</span>
                <span className={`statusPill s${(m.status || "Emerging").replace(/\s/g, "")}`}>
                  {m.status || "Emerging"}
                </span>
                <span className="muted">· {timeLabel(m.minutesAgo)}</span>
              </div>

              <div className="title">{m.title}</div>

              <div className="signal">
                <span className="muted">Signal: </span>
                {m.signal}
              </div>

              <div className="meta">
                {m.source && <span className="source">{m.source}</span>}
                {m.source_url && (
                  <span className="muted">·</span>
                )}
                {m.source_url && (
                  <span className="muted">tap →</span>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}

      <div className="footerHint">
        Want it fully hands-off? Next we’ll schedule hourly runs (Task Scheduler / Vercel cron).
      </div>
    </main>
  );
}
