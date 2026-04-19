import { create } from "zustand";

const DEFAULT_SPEED = 0.008;

export const useStore = create((set) => ({
  progress: 0,
  shouldRun: true,
  speed: DEFAULT_SPEED,
  isGalleryOpen: false,
  isSearchOpen: false,
  globalSearchQuery: "",
  isOrbitLoading: false,
  showLabels: true,
  showTrajectories: true,
  hasReachedMilestone: false,
  showMilestonePopUp: false,
  advance: (dt) =>
    set((state) => {
      return {
        progress: state.shouldRun
          ? (state.progress + dt * state.speed) % 1
          : state.progress,
      };
    }),
  setProgress: (val) => set({ progress: val }),
  setShouldRun: (val) => set({ shouldRun: val }),
  setIsGalleryOpen: (open) => set({ isGalleryOpen: open }),
  setIsSearchOpen: (val) => set({ isSearchOpen: val }),
  setGlobalSearchQuery: (val) => set({ globalSearchQuery: val }),
  setIsOrbitLoading: (val) => set({ isOrbitLoading: val }),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleTrajectories: () =>
    set((state) => ({ showTrajectories: !state.showTrajectories })),
  setSpeed: (val) => set({ speed: val }),
  resetSpeed: () => set({ speed: DEFAULT_SPEED }),
  setHasReachedMilestone: (val) => set({ hasReachedMilestone: val }),
  setShowMilestonePopUp: (val) => set({ showMilestonePopUp: val }),
}));
