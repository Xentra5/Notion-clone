"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "sonner";

type Status = "loading" | "success" | "error" | "already_accepted";

export default function InviteAcceptClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorType, setErrorType] = useState<string>("");
  const [pageName, setPageName] = useState<string>("");

  useEffect(() => {
    const invited = searchParams.get("invited");
    const page = searchParams.get("page");
    const error = searchParams.get("error");

    if (invited === "accepted") {
      const decoded = page ? decodeURIComponent(page) : "the page";
      setPageName(decoded);
      setStatus("success");
      toast.success(`You now have access to "${decoded}"`);
      const timer = setTimeout(() => router.push("/dashboard"), 2500);
      return () => clearTimeout(timer);
    }

    if (invited === "already_accepted") {
      setStatus("already_accepted");
      const timer = setTimeout(() => router.push("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }

    if (error) {
      setErrorType(error);
      setStatus("error");
      return;
    }

    // No recognised params — show error
    setStatus("error");
    setErrorType("unknown");
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] font-sans">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center shadow-2xl">
          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
              <h1 className="text-lg font-semibold text-white mb-2">
                Accepting invitation…
              </h1>
              <p className="text-sm text-neutral-400">
                Please wait while we set up your access.
              </p>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h1 className="text-lg font-semibold text-white mb-2">
                Invitation accepted!
              </h1>
              <p className="text-sm text-neutral-400 mb-5">
                You now have access to{" "}
                <strong className="text-white">&quot;{pageName}&quot;</strong>.
                Redirecting to your workspace…
              </p>
              <div className="h-1 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ animation: "shrink-bar 2.5s linear forwards" }}
                />
              </div>
            </>
          )}

          {/* Already accepted */}
          {status === "already_accepted" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-blue-400" />
              </div>
              <h1 className="text-lg font-semibold text-white mb-2">
                Already accepted
              </h1>
              <p className="text-sm text-neutral-400">
                You already have access to this page. Redirecting…
              </p>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h1 className="text-lg font-semibold text-white mb-2">
                {errorType === "missing_token"
                  ? "Invalid invite link"
                  : errorType === "invalid_token"
                  ? "Invite link expired"
                  : "Something went wrong"}
              </h1>
              <p className="text-sm text-neutral-400 mb-6">
                {errorType === "missing_token"
                  ? "This link is missing the invite token. Please use the original email link."
                  : errorType === "invalid_token"
                  ? "This invite link has already been used or has expired. Ask the page owner to send a new invitation."
                  : "We couldn't process your invitation. Please try again."}
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 bg-[#252525] hover:bg-[#2e2e2e] border border-[#333] text-white rounded-xl text-sm font-medium transition"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-4">
          Notion Clone — Workspace Collaboration
        </p>
      </div>

      <style>{`
        @keyframes shrink-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
