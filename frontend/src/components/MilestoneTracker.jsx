import { useEffect } from "react";
import { useStore } from "../store";

const MilestoneTracker = () => {
  const {
    progress,
    setShouldRun,
    hasReachedMilestone,
    setHasReachedMilestone,
    setShowMilestonePopUp,
    milestonesEnabled,
    isManualNav,
    setIsManualNav,
  } = useStore();

  useEffect(() => {
    if (!milestonesEnabled) return;

    // if user mannually selected day6 in timeline, reset the flag after and don't show the popup
    if (isManualNav) {
      if (progress < 0.5 || progress > 0.51) {
        setIsManualNav(false);
      }
      return;
    }
    if (progress >= 0.5 && progress < 0.51 && !hasReachedMilestone) {
      setShouldRun(false); // stop the mission
      setHasReachedMilestone(true);
      setShowMilestonePopUp(true);
    }

    // clear when loop back to start
    if (progress < 0.1 && hasReachedMilestone) {
      setHasReachedMilestone(false);
    }
  }, [
    progress,
    hasReachedMilestone,
    setShouldRun,
    setHasReachedMilestone,
    setShowMilestonePopUp,
    milestonesEnabled,
    isManualNav,
    setIsManualNav,
  ]);

  return null;
};

const PopUp = () => {
  const setShouldRun = useStore((s) => s.setShouldRun);
  const showPopUp = useStore((s) => s.showMilestonePopUp);
  const setShowPopUp = useStore((s) => s.setShowMilestonePopUp);

  if (!showPopUp) return null;

  return (
    <div
      className="fixed z-[100000000] inset-0 flex items-center 
        justify-center bg-black/40 backdrop-blur-sm animate-in 
        fade-in duration-500"
    >
      <div
        className="max-w-md p-6 bg-slate-900 border-2 border-amber-500/50 
          rounded-xl text-center"
      >
        <div
          className="text-amber-500 text-xs font-mono 
            tracking-[0.3em] mb-2 uppercase"
        >
          Historical Milestone Reached
        </div>
        <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">
          BEYOND THE FAR SIDE
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6 font-mono">
          Day 06: NASA astronauts Reid Wiseman, Victor Glover, and Jeremy Hansen
          surpassed the record for human spaceflight’s farthest distance from
          Earth. Current distance:{" "}
          <span className="text-white">248,655 miles</span>.
        </p>
        <button
          onClick={() => {
            setShouldRun(true); // start moving again
            setShowPopUp(false); // kill the popup until lap reset
          }}
          className="px-8 py-2 bg-amber-500 hover:bg-amber-400 text-black 
            font-bold uppercase text-xs tracking-widest transition-all 
            rounded-full cursor-pointer"
        >
          Continue Mission
        </button>
      </div>
    </div>
  );
};
export { MilestoneTracker, PopUp };
