"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";

import { AuthButton } from "@/components/auth/auth-button";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Product", href: "/product", hasMenu: true },
  { label: "Solutions", href: "/solutions", hasMenu: true },
  { label: "Resources", href: "/resources", hasMenu: true },
  { label: "Developers", href: "/developers" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
  { label: "Request a demo", href: "/request-demo" },
];

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="relative flex h-16 sm:h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
      {/* Left: Logo */}
      <div className="flex shrink-0 items-center z-10">
        <Link href="/" aria-label="Notion home" className="flex shrink-0 items-center">
          <Image
            src="/notion-svgrepo-com.svg"
            alt="Notion"
            width={34}
            height={34}
            priority
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
        </Link>
      </div>

      {/* Middle: Precisely Centered Navigation Links */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-5 lg:gap-6 xl:gap-7 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-semibold text-[#262626] whitespace-nowrap">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex shrink-0 items-center gap-1 transition hover:text-black"
          >
            <span>{item.label}</span>
            {item.hasMenu ? <ChevronDown className="h-3.5 w-3.5 stroke-[2.4]" /> : null}
          </Link>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 text-[13px] sm:text-[14px] lg:text-[15px] font-semibold z-10">
        <AuthButton />
        {!session ? (
          <Link href="/signup" className="shrink-0">
            <Button className="h-8.5 sm:h-9 rounded-lg bg-[#0078df] px-3 sm:px-4 text-xs sm:text-[14px] font-bold text-white hover:bg-[#006dcc] shrink-0 whitespace-nowrap">
              Get Notion free
            </Button>
          </Link>
        ) : null}
      </div>
    </header>
  );
};