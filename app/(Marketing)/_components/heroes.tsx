import { BookOpen, FileText, PenLine, Search, Sparkle, UserRound } from "lucide-react";

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
  );
};