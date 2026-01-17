import { Suspense } from "react";
import MomentClient from "./MomentClient";

export default function MomentPage() {
  return (
    <main style={{ padding: 24 }}>
      <Suspense fallback={<div style={{ opacity: 0.8 }}>Loading moment…</div>}>
        <MomentClient />
      </Suspense>
    </main>
  );
}
