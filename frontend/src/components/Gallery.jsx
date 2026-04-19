import { Modal } from "./Modal";
import { ImageCard } from "./ImageCard";

export const Gallery = ({
  galleryData,
  onClose,
  isOpen,
  isLoadingGallery,
  selectedDay,
  onDaySelect,
  milestones = [],
}) => {
  if (!isOpen) return null;
  const dayDisplay = selectedDay || galleryData?.day || "??";

  const timelineSelector = (
    <div className="px-4 md:px-8 py-4 flex flex-col gap-3">
      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.2em]">
        Timeline Archive
      </span>
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {milestones.map((m) => {
          const isThisButtonLoading = isLoadingGallery && m.day == selectedDay;
          return (
            <button
              key={m.day}
              disabled={isLoadingGallery}
              onClick={() => onDaySelect(m)}
              className={`flex-shrink-0 w-10 h-10 rounded-md border font-mono 
                text-xs flex items-center justify-center transition-all cursor-pointer
                ${
                  dayDisplay == m.day
                    ? "bg-blue-600 border-blue-400 text-white"
                    : "bg-slate-900 border-white/10 text-slate-500 hover:text-blue-300"
                }
              `}
            >
              {isThisButtonLoading ? (
                <div
                  className="w-4 h-4 border-2 border-white/20 border-t-white
                    rounded-full animate-spin"
                />
              ) : m.day < 10 ? (
                `0${m.day}`
              ) : (
                m.day
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={galleryData?.label || `Mission Day ${dayDisplay}`}
      isLoading={isLoadingGallery}
      isEmpty={!galleryData?.gallery?.length}
      emptyMessage={`No visual telemetry for Day ${dayDisplay}.`}
      headerAction={timelineSelector}
    >
      <div className="flex flex-col gap-6">
        {galleryData?.gallery?.map((img, i) => (
          <ImageCard key={i} img={img} />
        ))}
      </div>
    </Modal>
  );
};
