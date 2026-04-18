export const Modal = ({
  isOpen,
  onClose,
  title,
  isLoading,
  children,
  isEmpty,
  emptyMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end pointer-events-none">
      <div
        className="absolute border border-blue-500/40 inset-0 pointer-events-auto"
        onClick={onClose}
      />

      <div
        className="
          w-full md:max-w-[450px] 
          h-full md:h-screen
          bg-slate-950/95 
          backdrop-blur-2xl 
          border-l border-blue-500/30 
          shadow-[-20px_0_60px_rgba(0,0,0,0.8)]
          pointer-events-auto 
          flex flex-col 
          animate-slide-in-bottom md:animate-slide-in-right 
          duration-500 animate-ease-out
        "
      >
        {/* header */}
        <div
          className="p-4 md:p-6 border-b border-white/10 
            flex justify-between items-center"
        >
          <h2 className="text-blue-400 font-bold text-lg md:text-xl uppercase">
            {title}
          </h2>
          <button
            data-testid="close-modal"
            onClick={onClose}
            className="text-white hover:text-red-500 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* content */}
        <div
          className="overflow-y-auto snap-y snap-mandatory p-4 md:p-8 
            min-h-[400px] custom-scrollbar flex-1 p-8 flex flex-col"
        >
          {isLoading ? (
            /* loading state */
            <div
              className="flex-1 flex flex-col items-center 
                justify-center text-center"
            >
              <div className="relative w-20 h-20 mb-8">
                {/* spinning outer ring */}
                <div
                  className="absolute inset-0 border-4 border-blue-500/20 
                    border-t-blue-500 rounded-full animate-spin"
                ></div>
                {/* pulsing inner dot */}
                <div
                  className="absolute inset-4 bg-blue-500/40 
                    rounded-full animate-pulse"
                ></div>
              </div>
              <p
                className="text-blue-400 font-mono text-xs 
                  tracking-[0.3em] animate-pulse"
              >
                RECEIVING DATA...
              </p>
            </div>
          ) : isEmpty ? (
            /* no data */
            <div
              className="flex flex-col items-center justify-center 
                py-20 text-center"
            >
              <span className="text-4xl mb-4">📡</span>
              <h3 className="text-white font-bold mb-2 uppercase tracking-widest">
                No Visual Data
              </h3>
              <p className="text-slate-500 text-sm max-w-[280px]">
                {emptyMessage}
              </p>
            </div>
          ) : (
            /* loaded data */
            children
          )}
        </div>
      </div>
    </div>
  );
};
