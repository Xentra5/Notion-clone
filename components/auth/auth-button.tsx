"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";

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
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-[#262626]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0078df] text-[10px] font-bold text-white">
            {initial}
          </span>
          <span className="max-w-28 truncate text-[13px] sm:max-w-36">
            {displayName}
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="h-9 rounded-lg bg-neutral-100 px-3 text-[14px] font-semibold text-[#262626] hover:bg-neutral-200"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5 sm:hidden" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-[15px] font-semibold text-[#262626] transition hover:text-black"
    >
      Log in
    </Link>
  );
}