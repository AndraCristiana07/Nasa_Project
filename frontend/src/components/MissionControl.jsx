import { useState } from "react";
import { useStore } from "../store";

export const MissionControl = ({ milestones }) => {
  const { progress, setProgress, shouldRun, setShouldRun } = useStore();

  const [wasPlaying, setWasPlaying] = useState(false);
  const totalDays = 10;

  const togglePlayback = () => setShouldRun(!shouldRun);

  return (
    <div
      className="
      fixed bottom-0 md:bottom-5 left-0 md:left-1/2 md:-translate-x-1/2 z-[100]
        w-full md:w-[600px] md:max-w-[90vw] "
    >
      <div
        className="bg-slate-900/95 backdrop-blur-xl border-t md:border
          border-blue-500/30 p-4 md:p-5 md:rounded-2xl shadow-2xl flex flex-col
          gap-3 md:gap-4"
      >
        {/* progress */}
        <div
          className="flex justify-between items-end font-mono text-[9px]
            md:text-[10px] tracking-widest px-1"
        >
          <div className="flex flex-col">
            <span className="text-blue-400 font-bold">ARTEMIS II</span>
          </div>
          <div className="flex flex-col items-end">
            <span
              className="text-white bg-blue-600/20 px-2 py-0.5 rounded
                border border-blue-500/30"
            >
              <span className="hidden md:inline">PROGRESS: </span>
              {(progress * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* seek bar */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* play/pause button */}
          <button
            aria-label={shouldRun ? "pause" : "play"}
            onClick={togglePlayback}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 flex-shrink-0 
              flex items-center justify-center bg-blue-600 hover:bg-blue-500
              text-white rounded-full transition-all"
          >
            {shouldRun ? (
              <div className="flex gap-1.5">
                <div className="w-1 md:w-1.5 h-3.5 md:h-4 bg-white rounded-sm" />
                <div className="w-1 md:w-1.5 h-3.5 md:h-4 bg-white rounded-sm" />
              </div>
            ) : (
              <div
                className="ml-1 w-0 h-0 border-t-[7px] md:border-t-[9px]
                border-t-transparent border-l-[12px] md:border-l-[15px]
                border-l-white border-b-[7px] md:border-b-[9px]
                border-b-transparent"
              />
            )}
          </button>

          {/* seek container */}
          <div className="relative flex-1 group py-3 md:py-4">
            {/* day markers */}
            <div className="absolute inset-0 left-0 right-0 pointer-events-none">
              {milestones?.map((m) => {
                const percent = ((m.day - 1) / totalDays) * 100;

                return (
                  <div
                    key={m.day}
                    style={{ left: `${percent}%` }}
                    className="absolute inset-y-0 flex flex-col
                      items-center justify-center"
                  >
                    {/* tick mark for days*/}
                    <div
                      className="w-[1px] h-2 md:h-3 bg-blue-400/30 
                      group-hover:bg-blue-400/60 transition-colors"
                    />
                    {/* day label */}
                    <span
                      className="absolute bottom-[-4px] text-[9px] 
                        font-mono text-slate-500 group-hover:text-blue-300 
                        transition-colors"
                    >
                      D{m.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.0001"
              value={progress}
              onTouchStart={() => {
                setWasPlaying(shouldRun);
                setShouldRun(false);
              }}
              onTouchEnd={() => {
                if (wasPlaying) setShouldRun(true);
              }}
              onChange={(e) => {
                setShouldRun(false);
                setProgress(parseFloat(e.target.value));
              }}
              onMouseDown={() => {
                setWasPlaying(shouldRun);
                setShouldRun(false);
              }}
              onMouseUp={() => {
                if (wasPlaying) setShouldRun(true);
              }}
              className="relative w-full h-0.5 md:h-1 bg-slate-800 rounded-lg 
                appearance-none cursor-pointer accent-blue-500 z-10 
                hover:bg-slate-700 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
