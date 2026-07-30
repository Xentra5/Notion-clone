"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden max-w-36 truncate text-sm font-semibold text-[#262626] sm:inline">
          {session.user.name ?? session.user.email}
        </span>
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={() => signOut()}
          className="h-9 rounded-lg bg-neutral-100 px-4 text-[15px] font-bold text-[#262626] hover:bg-neutral-200"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => signIn("github")}
      className="hidden text-[#262626] transition hover:text-black disabled:opacity-60 sm:inline"
    >
      Log in
    </button>
  );
}