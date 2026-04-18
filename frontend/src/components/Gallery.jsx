import { Modal } from "./Modal";
import { ImageCard } from "./ImageCard";

export const Gallery = ({
  galleryData,
  onClose,
  isOpen,
  isLoadingGallery,
  selectedDay,
}) => {
  if (!isOpen) return null;
  const dayDisplay = galleryData?.day || selectedDay || "??";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={galleryData?.label || `Mission Day ${dayDisplay}`}
      isLoading={isLoadingGallery}
      isEmpty={!galleryData?.gallery?.length}
      emptyMessage={`No visual telemetry for Day ${dayDisplay}.`}
    >
      {galleryData?.gallery?.map((img, i) => (
        <ImageCard key={i} img={img} />
      ))}
    </Modal>
  );
};
