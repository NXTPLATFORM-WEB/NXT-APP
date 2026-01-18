"use client";

export default function MomentClient({ moment }) {
  if (!moment) return null;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <a href="/" className="opacity-70 hover:underline">← Back</a>

      <h1 className="text-3xl font-bold mt-4">{moment.title}</h1>

      <div className="opacity-70 mt-2">
        {moment.source} · {moment.published_at}
      </div>

      <p className="mt-6 text-lg">{moment.summary}</p>

      <article className="prose prose-invert mt-8">
        {moment.content}
      </article>
    </main>
  );
}
