import { useStore } from "../store";
import { useState } from "react";

export const Settings = () => {
  const {
    showLabels,
    showTrajectories,
    toggleLabels,
    toggleTrajectories,
    speed,
    setSpeed,
    resetSpeed,
  } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pointer-events-auto">
      {/* open settings button */}
      <button
        data-testid="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        className="group cursor-pointer p-3 bg-slate-900/90 backdrop-blur-md 
          border border-blue-500/30 rounded-full text-white hover:border-blue-400
          hover:bg-white/10 backdrop-blur-md transition-all"
      >
        {" "}
        <div
          className="transition-transform duration-500 
            ease-in-out group-hover:rotate-90"
        >
          ⚙️
        </div>
      </button>

      {/* menu */}
      {isOpen && (
        <div
          className="absolute z-[200] top-full right-0 mt-2 p-4 bg-black/90 
            border border-white/20 rounded-lg w-64 xl:w-75 shadow-2xl animate-in 
            fade-in zoom-in-95 origin-top-right"
        >
          <h3
            className="text-blue-400 font-mono text-[10px] md:text-[11px] 
              uppercase tracking-[0.3em] mb-4 opacity-70"
          >
            Control Deck
          </h3>

          <div className="space-y-5">
            {/* speed section */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span
                  className="text-white text-[10px] md:text-[11px] 
                    font-mono uppercase"
                >
                  Time Warp
                </span>
                <div className="flex items-center gap-2">
                  {/* reset to default speed */}
                  <button
                    onClick={resetSpeed}
                    className={`text-[8px] md:text-[10px] font-mono px-1.5 
                      py-0.5 rounded border transition-all ${
                        speed !== 0.008
                          ? "border-amber-500/50 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                          : "border-slate-800 text-slate-700 cursor-default"
                      }`}
                  >
                    RESET
                  </button>
                  <span className="text-blue-400 font-mono text-[10px] md:md:text-[11px]">
                    {(speed / 0.008).toFixed(1)}x
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.04"
                step="0.001"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg 
                  appearance-none cursor-pointer accent-blue-500"
              />
              <div
                className="flex justify-between text-[8px] md:md:text-[9px]
                  font-mono text-slate-500 uppercase tracking-tighter"
              >
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-white/5" />
            {/* label toggle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center whitespace-nowrap">
                <span
                  className="text-slate-300 text-[10px] 
                    md:text-[11px] font-mono uppercase"
                >
                  Labels
                </span>
                <button
                  onClick={toggleLabels}
                  className={`w-8 h-4 rounded-full transition-colors 
                    relative ${showLabels ? "bg-blue-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full
                      transition-all ${showLabels ? "left-4.5" : "left-0.5"}`}
                  />
                </button>
              </div>
              {/* trajectory toggle */}
              <div className="flex justify-between items-center whitespace-nowrap">
                <span
                  className="text-slate-300 text-[10px] md:text-[11px]
                    font-mono uppercase"
                >
                  Trajectories
                </span>
                <button
                  onClick={toggleTrajectories}
                  className={`w-8 h-4 rounded-full transition-colors relative
                    ${showTrajectories ? "bg-blue-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full
                      transition-all ${showTrajectories ? "left-4.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
