// src/app/page.js
import Link from "next/link";

async function getFeed() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/moments`, {
    cache: "no-store",
  });

  // If NEXT_PUBLIC_SITE_URL is not set on Vercel, this still works locally because "" becomes relative.
  // On Vercel it will be absolute if you set NEXT_PUBLIC_SITE_URL.
  const data = await res.json();
  return data?.items || [];
}

export default async function HomePage() {
  const items = await getFeed();

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, marginBottom: 18 }}>NXT</h1>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((story) => (
          <Link
            key={story.id}
            href={`/moment?id=${story.id}`} // ✅ correct
            style={{
              display: "block",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
            }}
          >
            <div style={{ opacity: 0.75, fontSize: 12 }}>{story.source || "Unknown"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
              {story.title || "(no title)"}
            </div>
            <div style={{ opacity: 0.8, marginTop: 8 }}>
              {story.summary || ""}
            </div>
          </Link>
        ))}

        {items.length === 0 && (
          <div style={{ opacity: 0.7 }}>
            No stories found. (Check Supabase table “stories” has rows.)
          </div>
        )}
      </div>
    </main>
  );
}
