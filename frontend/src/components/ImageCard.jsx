import { useState } from "react";

export const ImageCard = ({ img }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongDescription = img.description?.length > 120;

  return (
    <div
      className="mb-8 md:mb-10 last:mb-0 group animate-in fade-in 
        slide-in-from-bottom-4 duration-700"
    >
      {/* image container */}
      <div
        className="relative overflow-hidden rounded-lg md:rounded-xl 
          mb-3 border border-white/10 bg-white/5"
      >
        <img
          src={img.url}
          alt={img.title}
          loading="lazy"
          onLoad={(e) => e.currentTarget.classList.add("opacity-100")}
          className="w-full h-auto opacity-0 transition-all duration-1000 
            ease-out transform hover:scale-115"
        />
      </div>

      {/* text content */}
      <div className="px-1">
        <h3
          className="text-white text-sm md:text-md font-bold uppercase 
            tracking-wider group-hover:text-blue-400 transition-colors"
        >
          {img.title}
        </h3>
        <p
          className={`text-slate-400 text-[11px] md:text-xs italic leading-relaxed mt-1 
              transition-all duration-500 ease-in-out
              ${isExpanded ? "line-clamp-none" : "line-clamp-3"}`}
        >
          {img.description}
        </p>
        {/* read more button if descitpion is too long */}
        {isLongDescription && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-500/80 hover:text-blue-400 text-[9px] 
                md:text-[10px] font-mono uppercase tracking-[0.2em] 
                transition-colors flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                Collapse <span className="text-[8px]"></span>
              </>
            ) : (
              <>
                Read More <span className="text-[8px]"></span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
