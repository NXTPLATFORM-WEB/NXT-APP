// src/app/page.js
import FeedClient from "@/components/FeedClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic"; // ensures fresh data

export default async function HomePage() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("stories")
    .select("id, source, title, url, published_at, summary")
    .order("published_at", { ascending: false })
    .limit(60);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>NXT</h1>
        <p style={{ color: "#ffb4b4" }}>Server error loading feed:</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return <FeedClient feed={data ?? []} />;
}
