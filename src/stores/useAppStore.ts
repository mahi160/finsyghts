import { create } from 'zustand'

interface AppStore {
  syncing: boolean
  setSyncing: (syncing: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  syncing: false,
  setSyncing: (syncing) => set((state) => ({ ...state, syncing })),
}))
