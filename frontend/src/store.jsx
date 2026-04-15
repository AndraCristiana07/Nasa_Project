import { create } from 'zustand'

export const useStore = create((set) => ({
  progress: 0,
  shouldRun: true,
  speed: 0.008,
  isGalleryOpen: false,
  advance: (dt) => set((state) => {
    return ({
      progress: state.shouldRun ? (state.progress + dt * state.speed) % 1 : state.progress
    })
  }),
  setProgress: (val) => set({ progress: val }),
  setShouldRun: (val) => set({ shouldRun: val }),
  setIsGalleryOpen: (open) => set({ isGalleryOpen: open }),

}))