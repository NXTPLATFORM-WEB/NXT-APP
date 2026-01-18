import { headers } from "next/headers";
import MomentClient from "./MomentClient";

export default async function MomentPage({ searchParams }) {
  const params = await searchParams;
  const id = params?.id;

  if (!id) {
    return <div className="p-8">Missing moment id in URL</div>;
  }

  const host = headers().get("host");
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/moments?id=${id}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return <MomentClient moment={data} />;
}
