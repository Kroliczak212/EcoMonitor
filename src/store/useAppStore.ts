import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FavoriteStation, Theme, Pollutant } from '@/types/app'

interface AppState {
  favorites: FavoriteStation[]
  theme: Theme
  selectedPollutant: Pollutant
  addFavorite: (station: FavoriteStation) => void
  removeFavorite: (id: number) => void
  toggleTheme: () => void
  setSelectedPollutant: (pollutant: Pollutant) => void
}

const getInitialTheme = (): Theme => {
  // Check persisted value first to avoid flash when persist middleware hydrates
  try {
    const stored = JSON.parse(localStorage.getItem('eco-monitor-storage') ?? '{}') as {
      state?: { theme?: Theme }
    }
    if (stored?.state?.theme) return stored.state.theme
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      theme: getInitialTheme(),
      selectedPollutant: 'PM2.5',
      addFavorite: (station) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === station.id)
            ? state.favorites
            : [...state.favorites, station],
        })),
      removeFavorite: (id) =>
        set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setSelectedPollutant: (pollutant) => set({ selectedPollutant: pollutant }),
    }),
    { name: 'eco-monitor-storage' }
  )
)
