import React from "react";
import { useLatestNews } from "@/hooks/useMarket";

interface NewsItem {
  newTitle: string;
  link: string;
  image: string;
  sourceName: string;
  sourceIcon: string;
}

export default function NewsGrid() {
  const { data, isLoading, isError } = useLatestNews();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 w-full animate-pulse bg-[#1e1d1c] rounded-xl border border-[#2b2a29]"
          />
        ))}
      </div>
    );
  }

  if (isError || !data || !Array.isArray(data)) {
    return (
      <div className="h-32 w-full flex items-center justify-center bg-[#1e1d1c] rounded-xl border border-[#2b2a29] text-rose-400 text-sm">
        Failed to load latest market news.
      </div>
    );
  }

  const displayNews = data.slice(0, 8);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayNews.map((item: NewsItem, index: number) => (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          key={index}
          className="group bg-[#1e1d1c] border border-[#2b2a29] rounded-xl overflow-hidden p-4 pb-2 flex gap-4 transition-all duration-300 hover:border-[#3e3c3a] hover:bg-[#232221] shadow-sm"
        >
          <div className="flex-1 flex flex-col font-inter justify-between min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {item.sourceIcon && (
                  <img
                    src={item.sourceIcon}
                    alt={item.sourceName}
                    className="w-3.5 h-3.5 rounded-sm object-contain opacity-80"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}
                <span className="text-xs text-[#a3a3a3] font-medium tracking-wide truncate">
                  {item.sourceName}
                </span>
              </div>

              <h3 className="text-sm  text-gray-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                {item.newTitle}
              </h3>
            </div>
          </div>

          {/* {item.image && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#262524] flex-shrink-0 border border-[#2b2a29]/40">
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )} */}
        </a>
      ))}
    </div>
  );
}
