"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-lg bg-neutral-100" />
    );
  }

  if (session?.user) {
    const displayName = session.user.name || session.user.email?.split("@")[0] || "User";
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link href="/dashboard" className="shrink-0">
          <Button className="h-8.5 sm:h-9 rounded-lg bg-[#0078df] px-3 sm:px-3.5 text-xs sm:text-[14px] font-bold text-white hover:bg-[#0067c2] shrink-0">
            Enter Workspace
          </Button>
        </Link>
        <div className="hidden 2xl:flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-[#262626] shrink-0">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0078df] text-[10px] font-bold text-white shrink-0">
            {initial}
          </span>
          <span className="max-w-28 truncate text-[13px]">
            {displayName}
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="h-8.5 sm:h-9 rounded-lg bg-neutral-100 px-2.5 sm:px-3 text-xs sm:text-[14px] font-semibold text-[#262626] hover:bg-neutral-200 shrink-0"
          title="Sign out"
        >
          <LogOut className="h-4 w-4 xl:hidden" />
          <span className="hidden xl:inline">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="whitespace-nowrap text-xs sm:text-[14px] lg:text-[15px] font-semibold text-[#262626] transition hover:text-black shrink-0"
    >
      Log in
    </Link>
  );
}