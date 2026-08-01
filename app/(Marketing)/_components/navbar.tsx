import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { AuthButton } from "@/components/auth/auth-button";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Product", hasMenu: true },
  { label: "Solutions", hasMenu: true },
  { label: "Resources", hasMenu: true },
  { label: "Developers" },
  { label: "Enterprise" },
  { label: "Pricing" },
  { label: "Request a demo" },
];

export const Navbar = () => {
  return (
    <header className="flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:px-10">
      <a href="#" aria-label="Notion home" className="flex items-center">
        <Image
          src="/notion-svgrepo-com.svg"
          alt="Notion"
          width={34}
          height={34}
          priority
          className="h-8 w-8"
        />
      </a>

      <nav className="hidden items-center gap-7 text-[15px] font-semibold text-[#262626] lg:flex">
        {navItems.map((item) => (
          <a key={item.label} href="#" className="flex items-center gap-1 transition hover:text-black">
            {item.label}
            {item.hasMenu ? <ChevronDown className="h-3.5 w-3.5 stroke-[2.4]" /> : null}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4 text-[15px] font-semibold">
        <AuthButton />
        <Link href="/signup">
          <Button className="h-9 rounded-lg bg-[#0078df] px-4 text-[15px] font-bold text-white hover:bg-[#006dcc]">
            Get Notion free
          </Button>
        </Link>
      </div>
    </header>
  );
};