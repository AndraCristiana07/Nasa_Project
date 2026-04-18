import { useEffect, useState } from "react";
import { useStore } from "../store";

const LoadingButtonSpinner = () => {
  const [frame, setFrame] = useState(0);
  const frames = ["/", "—", "\\", "|"];

  useEffect(() => {
    // spin while loading, cycling through signs
    const timer = setInterval(() => setFrame((f) => (f + 1) % 4), 150);
    return () => clearInterval(timer);
  }, []);

  return <span>[ {frames[frame]} ]</span>;
};

export const FocusMenu = ({
  focusTarget,
  setFocusTarget,
  centerOrigin,
  setCenterOrigin,
}) => {
  const targets = ["Earth", "Moon", "Orion", "Sun"];
  const origins = ["Earth", "Moon", "Sun"];

  const isOrbitLoading = useStore((s) => s.isOrbitLoading);
  const [pendingOrigin, setPendingOrigin] = useState(null);

  const handleCenterChange = (name) => {
    setPendingOrigin(name);
    setCenterOrigin(name);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* camera focus */}
      <div className="flex flex-col gap-3">
        <div className="hidden md:block mb-2 px-1">
          <h2
            className="text-blue-500 font-mono text-[11px] tracking-[0.3em]
              uppercase opacity-70"
          >
            Focus target
          </h2>
          <div className="h-[1px] w-full bg-blue-500/30 my-1" />
        </div>
        {/* buttons group */}
        <div className="flex flex-row items-stretch gap-2">
          {/* small screen side label */}
          <div
            className="md:hidden flex items-center bg-blue-500/10 border-l
              border-blue-500/40 px-1 py-2"
          >
            <span
              className="[writing-mode:vertical-lr] rotate-180 font-mono
                text-[8px] text-blue-400/80 tracking-tighter uppercase"
            >
              Focus
            </span>
          </div>
          <div
            className="flex flex-row md:flex-col gap-2 md:px-0 
              overflow-x-auto custom-scrollbar"
          >
            {targets.map((name) => (
              <button
                key={name}
                onClick={() => setFocusTarget(name)}
                data-testid={`focus-${name}`}
                className={`
                  flex-shrink-0 relative px-4 py-2 text-left transition-all
                  duration-300 group cursor-pointer
                  font-mono text-[10px] md:text-[12px] tracking-[0.2em] 
                  uppercase border-b-2 md:border-b-0 md:border-l-2
                ${
                  focusTarget === name
                    ? "bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.1)]"
                    : "bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }
              `}
              >
                <span className="relative z-10">
                  {focusTarget === name ? `> ${name}` : name}
                </span>
                {/* small corner detail */}
                <div
                  className={`
                absolute top-0 right-0 w-1 h-1 border-t border-r transition-opacity 
                ${focusTarget === name ? "border-blue-400 opacity-100" : "border-white/20 opacity-0 group-hover:opacity-100"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* set center */}
      <div className="flex flex-col gap-3">
        <div className="hidden md:block mb-2 px-1">
          <h2
            className="text-amber-500 font-mono text-[11px] tracking-[0.3em]
              uppercase opacity-70"
          >
            Reference frame (center)
          </h2>
          <div className="h-[1px] w-full bg-amber-500/30 my-1" />
        </div>
        {/* buttons group */}
        <div className="flex flex-row items-stretch gap-2">
          {/* small screen side label */}
          <div
            className="md:hidden flex items-center bg-amber-500/10 
              border-l border-amber-500/40 px-1 py-2"
          >
            <span
              className="[writing-mode:vertical-lr] rotate-180 font-mono 
                text-[8px] text-amber-500/80 tracking-tighter uppercase"
            >
              Center
            </span>
          </div>
          <div
            className="flex flex-row md:flex-col gap-2 md:px-0 
              overflow-x-auto custom-scrollbar"
          >
            {origins.map((name) => {
              const isActive = centerOrigin === name;
              const isWaiting = isOrbitLoading && pendingOrigin === name;
              return (
                <button
                  key={name}
                  data-testid={`center-${name}`}
                  disabled={isOrbitLoading}
                  onClick={() => handleCenterChange(name)}
                  className={`
                    flex-shrink-0 relative px-4 py-2 text-left transition-all 
                    duration-300 group font-mono text-[9px] md:text-[11px] 
                    tracking-[0.2em] uppercase
                    border-b-2 md:border-b-0 md:border-l-2
                ${
                  isActive
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : "bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }
                ${isOrbitLoading ? "cursor-wait" : "hover:bg-blue-500/20 cursor-pointer"}
                ${isOrbitLoading && !isWaiting ? "opacity-30" : "opacity-100"}
              `}
                >
                  <span className="relative z-10 flex items-center justify-between">
                    {isWaiting ? (
                      <span className="text-amber-400">
                        <LoadingButtonSpinner />
                      </span>
                    ) : (
                      <span>{isActive ? `[ ${name} ]` : name}</span>
                    )}
                  </span>
                  {/* small corner detail */}
                  <div
                    className={`
                      absolute w-1 h-1 top-0 right-0 border-t border-r 
                      transition-opacity md:top-auto md:bottom-0 md:border-t-0 
                      md:border-b md:border-r  
                  ${isActive ? "border-amber-500 opacity-100" : "border-white/20 opacity-0 group-hover:opacity-100"}
                `}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
