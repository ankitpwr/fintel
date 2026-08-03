import useUserStore from "@/store/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SignOutIcon } from "@phosphor-icons/react";
import { GoogleAuthWrapper } from "./googleAuth";

export default function TopSection() {
  const { username, email, profilepic, isAuthenticated, logout } =
    useUserStore();

  return (
    <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#2b2a29] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="font-googleSans font-semibold tracking-wide text-2xl md:text-3xl text-white">
          Market Overview
        </h1>
      </div>

      {isAuthenticated ? (
        <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-full bg-[#1e1d1c] border border-[#2b2a29] shrink-0">
          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-full flex justify-center transition-all duration-200 hover:ring-2 hover:ring-[#31f6b8]/40 cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profilepic ?? undefined} />
                  <AvatarFallback className="bg-[#31f6b8]/10 text-[#31f6b8] text-xs font-semibold">
                    {username?.slice(0, 1).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#171615] border border-[#2b2a29] text-white px-3.5 py-2.5 rounded-lg shadow-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-white font-googleSans">
                  {username}
                </span>
                <span className="text-xs text-[#8a8987]">{email}</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <span className="hidden font-googleSans md:block text-sm font-medium text-white pl-1 pr-1 max-w-[120px] truncate">
            {username}
          </span>

          <div className="w-px h-5 bg-[#2b2a29] mx-0.5 hidden md:block" />

          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={() => logout()}
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#8a8987] hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 cursor-pointer"
              >
                <SignOutIcon className="w-4 h-4" weight="bold" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#171615] border border-[#2b2a29] text-white px-2.5 py-1.5 rounded-md text-xs shadow-2xl font-googleSans">
              Log out
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <GoogleAuthWrapper />
        </div>
      )}
    </div>
  );
}
