import { headers } from "next/headers";

export default async function HomePage() {
  const host = headers().get("host");
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/moments`, {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">NXT</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((m) => (
          <a
            key={m.id}
            href={`/moment?id=${m.id}`}
            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <div className="text-sm opacity-70">{m.source}</div>
            <div className="font-semibold mt-2">{m.title}</div>
            <div className="text-sm opacity-60 mt-1">{m.summary}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
