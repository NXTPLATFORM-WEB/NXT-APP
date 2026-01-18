"use client";

import { useSearchParams } from "next/navigation";
import MomentClient from "./MomentClient";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        Missing moment id in URL
      </div>
    );
  }

  return <MomentClient id={id} />;
}
