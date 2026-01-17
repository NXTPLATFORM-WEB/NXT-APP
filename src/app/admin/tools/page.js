"use client";

import { useState } from "react";

export default function AdminTools() {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);

  async function run() {
    setState("running");
    setResult(null);

    const res = await fetch("/api/run", {
      method: "POST",
      headers: {
        "x-admin": "ok",
      },
    });

    const json = await res.json();
    setResult(json);
    setState("done");
  }

  return (
    <main className="wrap">
      <h1>Newsroom Console</h1>
      <p className="muted">Run ingest + AI generation.</p>

      <button
        onClick={run}
        className="btn"
        disabled={state === "running"}
        style={{ marginTop: 16 }}
      >
        {state === "running" ? "Running…" : "Run now"}
      </button>

      {result && (
        <pre className="pre" style={{ marginTop: 16 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
