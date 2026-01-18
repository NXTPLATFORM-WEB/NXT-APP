import { Suspense } from "react";
import MomentClient from "./MomentClient";

export default function MomentPage({ searchParams }) {
  const id = searchParams?.id ? String(searchParams.id) : "";

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading moment…</div>}>
      <MomentClient id={id} />
    </Suspense>
  );
}
