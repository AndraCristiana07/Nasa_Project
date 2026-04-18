import { useState, useMemo } from "react";
import { useStore } from "../store";
import { Modal } from "./Modal";
import { ImageCard } from "./ImageCard";

const SearchBar = () => {
  const [localInput, setLocalInput] = useState("");
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);

  const handleTriggerSearch = () => {
    if (!localInput.trim()) return;

    useStore.setState({ globalSearchQuery: localInput });
    setIsSearchOpen(true);
    setLocalInput("");
  };

  return (
    <div className="flex items-center pointer-events-auto">
      <div
        className="flex bg-slate-900/90 backdrop-blur-md border 
          border-blue-500/30 rounded-sm px-3 py-2 
          hover:border-blue-400 transition-all"
      >
        <input
          type="text"
          data-testid="search-input"
          placeholder="SEARCH ARCHIVE..."
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTriggerSearch()}
          className="bg-transparent outline-none text-[10px] md:text-xs 
            font-mono tracking-[0.2em] text-blue-400 w-32 md:w-40 
            xl:w-48 placeholder:text-blue-900/60"
        />
        <button
          onClick={handleTriggerSearch}
          className="ml-2 text-blue-500 hover:text-white transition-colors"
        >
          🔍
        </button>
      </div>
    </div>
  );
};

const SearchGallery = ({ allImages }) => {
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);
  const globalQuery = useStore((s) => s.globalSearchQuery);

  const results = useMemo(() => {
    if (!globalQuery) return [];
    if (!Array.isArray(allImages)) return [];
    const term = globalQuery.toLowerCase();

    // search the archive fetched on load
    return allImages.filter(
      (img) =>
        img.title?.toLowerCase().includes(term) ||
        img.description?.toLowerCase().includes(term) ||
        img.keywords?.some((k) => k.toLowerCase().includes(term)),
    );
  }, [globalQuery, allImages]);

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      title={`Search: ${globalQuery}`}
      isEmpty={results.length === 0}
      emptyMessage={`No mission data found for "${globalQuery}"`}
    >
      <div className="flex flex-col gap-2">
        {results.map((img, i) => (
          <ImageCard key={i} img={img} />
        ))}
      </div>
    </Modal>
  );
};

export { SearchBar, SearchGallery };
