import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartLineUpIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ListIcon,
  XIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { id: "overview", label: "Market overview" },
  { id: "ask-ai", label: "Ask AI" },
  { id: "report", label: "Detailed report" },
  { id: "history", label: "History" },
];

export default function Navbar() {
  const [active, setActive] = useState("overview");
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 z-50 bg-[#1e1d1c]/90 backdrop-blur-md border-b border-[#2b2a29]">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Logo + desktop nav */}
        <div className="flex items-center gap-9">
          <a href="/" className="flex items-center gap-2 group shrink-0">
            <ChartLineUpIcon
              className="w-5 h-5 text-[#31f6b8] transition-transform duration-300 group-hover:-translate-y-0.5"
              weight="bold"
            />
            <span className="text-xl font-bold font-geistmono text-[#31f6b8] tracking-wide">
              Fintel
            </span>
          </a>

          <div
            className="hidden md:flex items-center gap-1 font-geistmono text-sm"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_ITEMS.map((item) => {
              const isLit = hovered ? hovered === item.id : active === item.id;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setHovered(item.id)}
                  onClick={() => setActive(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isLit ? "text-white" : "text-[#8a8987] hover:text-[#c4c3c1]"
                  }`}
                >
                  {isLit && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right cluster: search, market status, notifications, avatar */}
        {/* <div className="hidden md:flex items-center gap-3">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[#8a8987] hover:text-white hover:bg-white/5 transition-colors">
            <BellIcon className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
          </button>

          <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#8a8987] hover:text-[#31f6b8] border border-transparent hover:border-[#31f6b8]/30 transition-colors">
            <UserCircleIcon className="w-6 h-6" />
          </button>
        </div> */}

        {/* Mobile trigger */}
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

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[#2b2a29]"
          >
            <div className="flex flex-col px-6 py-4 gap-1 font-geistmono text-sm">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
