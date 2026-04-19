import { useStore } from "../store";

export const Timeline = ({ milestones, onTimelineClick }) => {
  const setIsManualNav = useStore((s) => s.setIsManualNav);

  const handleTimelineClick = (m) => {
    // set manual nav so that the popup doesn't show on modal exit
    setIsManualNav(true);
    onTimelineClick(m);
  };

  return (
    <div
      className="fixed flex flex-col pointer-events-none
        bottom-[120px] left-0 w-full px-4
        md:right-6 md:top-8 md:translate-y-0 md:left-auto md:bottom-auto
        md:w-64 md:max-h-[calc(100vh-220px)] z-50
        xl:top-1/2 xl:-translate-y-1/2"
    >
      <div className="mb-2 md:mb-4 px-2 pointer-events-auto">
        <h2
          className="text-blue-400 font-mono text-[10px] md:text-sm 
            font-bold tracking-[0.2em] uppercase"
        >
          Mission Timeline
        </h2>
        <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/50 to-transparent mt-1" />
      </div>
      <div
        className="flex flex-col gap-3 custom-scrollbar pointer-events-auto
          flex-row overflow-x-auto pb-4
          md:flex-col md:overflow-y-auto md:pr-4 md:pb-0 "
      >
        {milestones?.map((m, idx) => (
          <button
            key={idx}
            onClick={() => {
              handleTimelineClick(m);
              useStore.getState().setIsGalleryOpen(true);
            }}
            className=" flex-shrink-0 flex group relative transition-all 
              cursor-pointer pl-3 py-1 md:pl-4 md:hover:translate-x-1
              w-[80px] md:w-full "
          >
            {/* indicator line to be bottom on small screens and left on large screens  */}
            <div
              className=" absolute bg-slate-800 group-hover:bg-blue-500 
                transition-colors bottom-0 left-0 w-full h-[2px]
                md:top-0 md:left-0 md:w-[2px] md:h-full"
            />
            <div className="flex flex-col text-left py-1">
              <span
                className="text-white text-[10px] md:text-[12px] 
                  font-mono opacity-50 group-hover:text-blue-400"
              >
                DAY {String(m.day).padStart(2, "0")}
              </span>
              <h4 className="text-white text-[11px] md:text-sm font-semibold">
                {m.label}
              </h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
