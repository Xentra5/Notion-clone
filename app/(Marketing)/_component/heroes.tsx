import { BookOpen, CheckSquare, FileText, PenLine, Search, Sparkle, UserRound } from "lucide-react";

const avatars = [
  { ring: "border-[#0a8df2]", bg: "bg-white", icon: UserRound },
  { ring: "border-black", bg: "bg-white", icon: PenLine },
  { ring: "border-black", bg: "bg-[#ff503e]", icon: FileText },
  { ring: "border-[#ffb11b]", bg: "bg-[#fff4d8]", icon: Search },
  { ring: "border-black", bg: "bg-white", icon: Sparkle },
  { ring: "border-black", bg: "bg-[#64b5f6]", icon: BookOpen },
  { ring: "border-[#ff503e]", bg: "bg-white", icon: UserRound },
];

export const Heroes = () => {
  return (
    <>
      <div className="mb-8 flex items-center justify-center -space-x-2 pt-10 sm:pt-18 lg:pt-20">
        {avatars.map((avatar, index) => {
          const Icon = avatar.icon;

          return (
            <div
              key={`${avatar.ring}-${index}`}
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-full border-[3px] ${avatar.ring} ${avatar.bg} text-black shadow-[0_2px_0_rgba(0,0,0,0.16)] sm:h-[68px] sm:w-[68px]`}
              aria-hidden="true"
            >
              <Icon className="h-7 w-7 stroke-[2.4] sm:h-9 sm:w-9" />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-5 left-4 lg:left-10 hidden items-end gap-2 md:flex" aria-hidden="true">
        <div className="relative flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-[#ffbf45] text-black shadow-sm">
          <BookOpen className="h-8 w-8 -rotate-12 fill-white stroke-[2.3]" />
          <span className="absolute -right-3 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#b5b5b5] shadow-sm">
            <Sparkle className="h-3.5 w-3.5 fill-current" />
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-4 lg:right-10 hidden items-end gap-2 md:flex" aria-hidden="true">
        <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="h-4 w-4 rounded-full bg-black" />
        </span>
        <span className="flex h-14 w-14 rotate-3 items-center justify-center rounded-full bg-[#a461ee] text-black shadow-sm">
          <CheckSquare className="h-8 w-8 stroke-[2.4]" />
        </span>
        <Sparkle className="mb-12 h-5 w-5 fill-black stroke-black" />
      </div>
    </>
  );
};