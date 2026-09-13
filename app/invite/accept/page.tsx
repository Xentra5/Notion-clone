import { Suspense } from "react";
import InviteAcceptClient from "./client";

/**
 * Next.js App Router requires that components using useSearchParams()
 * are wrapped in a <Suspense> boundary.
 */
export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InviteAcceptClient />
    </Suspense>
  );
}
