import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartLineUpIcon,
  ListIcon,
  XIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ChatDialog from "./chatDialog";

const NAV_ITEMS = [
  { id: "overview", label: "Market overview" },
  { id: "ask-ai", label: "Ask AI" },
  { id: "history", label: "History" },
];

export default function Navbar() {
  const [active, setActive] = useState("overview");
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 z-50 bg-[#1e1d1c]/80 backdrop-blur-md border-b border-[#2b2a29]">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#31f6b8]/10 flex items-center justify-center border border-[#31f6b8]/20 group-hover:border-[#31f6b8]/40 transition-colors">
              <ChartLineUpIcon
                className="w-4.5 h-4.5 text-[#31f6b8] transition-transform duration-300 group-hover:-translate-y-0.5"
                weight="bold"
              />
            </div>
            <span className="text-lg font-bold font-geistmono text-white tracking-wide">
              Fintel
            </span>
          </a>

          <div
            className="hidden md:flex items-center gap-1 font-geistmono text-sm relative h-10"
            onMouseLeave={() => setHovered(null)}
          >
            <button
              key={NAV_ITEMS[0].id}
              onMouseEnter={() => setHovered(NAV_ITEMS[0].id)}
              onClick={() => setActive(NAV_ITEMS[0].id)}
              className={`relative px-4 h-full rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                active === NAV_ITEMS[0].id || hovered === NAV_ITEMS[0].id
                  ? "text-white"
                  : "text-[#8a8987]"
              }`}
            >
              {hovered === NAV_ITEMS[0].id && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-y-1.5 inset-x-0 bg-white/[0.04] rounded-md -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative z-10">Overview</span>

              {active === NAV_ITEMS[0].id && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute bottom-0 inset-x-4 h-[2px] bg-white"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                  }}
                />
              )}
            </button>
            <button
              key={NAV_ITEMS[1].id}
              onMouseEnter={() => setHovered(NAV_ITEMS[1].id)}
              onClick={() => setActive(NAV_ITEMS[1].id)}
              className={`relative px-4 h-full rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                active === NAV_ITEMS[1].id || hovered === NAV_ITEMS[1].id
                  ? "text-white"
                  : "text-[#8a8987]"
              }`}
            >
              {hovered === NAV_ITEMS[1].id && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-y-1.5 inset-x-0 bg-white/[0.04] rounded-md -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <Dialog>
                <DialogTrigger>Ask AI</DialogTrigger>
                <DialogContent className="!w-[90vw] !max-w-[90vw] !h-[86vh] !max-h-[86vh] overflow-hidden rounded-2xl border-none bg-transparent p-0 shadow-none">
                  <ChatDialog />
                </DialogContent>
              </Dialog>

              {active === NAV_ITEMS[1].id && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute bottom-0 inset-x-4 h-[2px] bg-white"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                  }}
                />
              )}
            </button>
            <button
              key={NAV_ITEMS[2].id}
              onMouseEnter={() => setHovered(NAV_ITEMS[2].id)}
              onClick={() => setActive(NAV_ITEMS[2].id)}
              className={`relative px-4 h-full rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                active === NAV_ITEMS[2].id || hovered === NAV_ITEMS[2].id
                  ? "text-white"
                  : "text-[#8a8987]"
              }`}
            >
              {hovered === NAV_ITEMS[2].id && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-y-1.5 inset-x-0 bg-white/[0.04] rounded-md -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative z-10">History</span>

              {active === NAV_ITEMS[2].id && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute bottom-0 inset-x-4 h-[2px] bg-white"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                  }}
                />
              )}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 font-geistmono text-sm">
          <button
            onClick={() => setActive("report")}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 group border overflow-hidden ${
              active === "report"
                ? "bg-[#31f6b8] text-[#171615] border-[#31f6b8] shadow-[0_0_15px_rgba(49,246,184,0.25)]"
                : "bg-[#31f6b8]/5 text-[#31f6b8] border-[#31f6b8]/30 hover:border-[#31f6b8] hover:bg-[#31f6b8]/10"
            }`}
          >
            <FileTextIcon
              className="w-4 h-4 transition-transform group-hover:scale-110"
              weight="bold"
            />
            <span>Detailed report</span>
          </button>
        </div>

        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <XIcon className="w-5 h-5" />
          ) : (
            <ListIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[#2b2a29] bg-[#1e1d1c]"
          >
            <div className="flex flex-col px-6 py-4 gap-2 font-geistmono text-sm">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setMobileOpen(false);
                  }}
                  className={`text-left px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    active === item.id
                      ? "bg-white/[0.06] text-white"
                      : "text-[#8a8987]"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="h-[1px] bg-[#2b2a29] my-1" />

              <button
                onClick={() => {
                  setActive("report");
                  setMobileOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-colors border ${
                  active === "report"
                    ? "bg-[#31f6b8] text-[#171615] border-[#31f6b8]"
                    : "bg-[#31f6b8]/5 text-[#31f6b8] border-[#31f6b8]/20"
                }`}
              >
                <span>Detailed report</span>
                <FileTextIcon className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
