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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={galleryData?.label || `Mission Day ${dayDisplay}`}
      isLoading={isLoadingGallery}
      isEmpty={!galleryData?.gallery?.length}
      emptyMessage={`No visual telemetry for Day ${dayDisplay}.`}
    >
      {/* timeline day selector for faster navigation */}
      <div className="mb-8 flex flex-col gap-3">
        <span
          className="text-[10px] font-mono text-blue-400 uppercase 
            tracking-[0.2em]"
        >
          Timeline Archive
        </span>

        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          {milestones.map((m) => (
            <button
              key={m.day}
              onClick={() => onDaySelect(m)}
              className={`
                flex-shrink-0 w-10 h-10 rounded-md border font-mono text-xs 
                flex items-center justify-center cursor-pointer
                ${
                  dayDisplay === m.day
                    ? "bg-blue-600 border-blue-400 text-white"
                    : "bg-slate-900 border-white/10 text-slate-500 hover:text-blue-300"
                }
              `}
            >
              {m.day < 10 ? `0${m.day}` : m.day}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {galleryData?.gallery?.map((img, i) => (
          <ImageCard key={i} img={img} />
        ))}
      </div>
    </Modal>
  );
};
