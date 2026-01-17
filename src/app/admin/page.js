"use client";

import { useState } from "react";
import Link from "next/link";

const TOPICS = [
  "Culture",
  "Music",
  "Sports",
  "Tech",
  "Politics",
  "Money",
  "Health",
  "Gaming",
  "To Be Honest",
];

const STATUSES = ["Breaking", "Emerging", "Shift", "TBH", "Fading"];

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [id, setId] = useState("m6");
  const [topic, setTopic] = useState("Culture");
  const [status, setStatus] = useState("Emerging");
  const [title, setTitle] = useState("");
  const [signal, setSignal] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [whereTags, setWhereTags] = useState("TikTok");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          id,
          topic,
          status,
          title,
          signal,
          why_it_matters: whyItMatters,
          where_tags: whereTags, // comma-separated ok
        }),
      });

      const data = await res.json();
      if (!data.ok) setMsg(`Error: ${data.error}`);
      else setMsg(`Saved ✅ (${data.moment.id}) — refresh the homepage.`);
    } catch (err) {
      setMsg(`Error: ${String(err?.message || err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="wrap">
        <Link href="/" className="cta">← Back</Link>

        <div style={{ marginTop: 14 }} className="panel">
          <div style={{ padding: 16 }}>
            <div className="meta" style={{ letterSpacing: "0.14em" }}>ADMIN</div>
            <div className="title" style={{ marginTop: 6 }}>Add Moment</div>
            <div className="signal" style={{ marginTop: 8 }}>
              Publish signals fast. Use <b>TBH</b> when it’s a blunt truth people are thinking but not saying.
            </div>

            <form onSubmit={submit} style={{ marginTop: 12 }}>
              <div className="row">
                <input
                  className="input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ADMIN_TOKEN"
                  type="password"
                  style={{ flex: 1, minWidth: 260 }}
                  required
                />
              </div>

              <div className="row">
                <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="id (unique)" />
                <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="row">
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (headline)"
                  style={{ flex: 1, minWidth: 320 }}
                  required
                />
              </div>

              <div className="row">
                <textarea
                  className="input"
                  value={signal}
                  onChange={(e) => setSignal(e.target.value)}
                  placeholder="Signal (what changed / what you’re seeing)"
                  style={{ flex: 1, minHeight: 110, resize: "vertical" }}
                  required
                />
              </div>

              <div className="row">
                <textarea
                  className="input"
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  placeholder="Why it matters (what it means tomorrow)"
                  style={{ flex: 1, minHeight: 110, resize: "vertical" }}
                />
              </div>

              <div className="row">
                <input
                  className="input"
                  value={whereTags}
                  onChange={(e) => setWhereTags(e.target.value)}
                  placeholder="Where tags (comma-separated) e.g. TikTok, X"
                  style={{ flex: 1, minWidth: 320 }}
                />
                <button className={`btn ${loading ? "" : "btnPrimary"}`} disabled={loading}>
                  {loading ? "Saving…" : "Save Moment"}
                </button>
              </div>

              {msg && (
                <div
                  className="footerHint"
                  style={{ color: msg.startsWith("Error") ? "var(--bad)" : "var(--good)" }}
                >
                  {msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
