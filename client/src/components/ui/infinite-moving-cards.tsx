import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    price: number;
    name: string;
    change: number;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        // Changed max-w-7xl to w-full so it takes full screen width properly
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-2",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => {
          const isPositive = item.change >= 0;
          return (
            <li
              className="relative flex flex-col justify-between min-w-[220px] gap-2 px-4 py-3 rounded-xl shrink-0 border border-[#2b2a29] bg-[#1e1d1c] shadow-sm transition-all duration-300 hover:border-[#3e3c3a] hover:shadow-md cursor-pointer"
              key={`${item.name}-${idx}`}
            >
              {/* Index Name */}
              <span className="font-semibold text-xs tracking-wider uppercase text-[#a3a3a3]">
                {item.name}
              </span>

              {/* Price & Change Row */}
              <div className="flex items-baseline justify-between gap-3 pt-1">
                <span className="text-base font-bold text-white tabular-nums">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>

                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded tabular-nums ${
                    isPositive
                      ? "bg-[#31f6b8]/10 text-[#31f6b8]"
                      : "bg-[#ff6b6b]/10 text-[#ff6b6b]"
                  }`}
                >
                  {isPositive ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
