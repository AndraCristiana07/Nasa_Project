export const ImageCard = ({ img }) => {
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
            ease-out transform group-hover:scale-110 grayscale-[20%] 
            group-hover:grayscale-0"
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
          className="text-slate-400 text-[11px] md:text-xs
            italic leading-relaxed mt-1 line-clamp-3"
        >
          {img.description}
        </p>
      </div>
    </div>
  );
};
