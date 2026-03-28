import { useAppStore } from '@/store/useAppStore'

interface FavoriteButtonProps {
  stationId: number
  stationName: string
  cityName: string
}

export const FavoriteButton = ({ stationId, stationName, cityName }: FavoriteButtonProps) => {
  const favorites = useAppStore((s) => s.favorites)
  const addFavorite = useAppStore((s) => s.addFavorite)
  const removeFavorite = useAppStore((s) => s.removeFavorite)

  const isFavorite = favorites.some((f) => f.id === stationId)

  const handleClick = () => {
    if (isFavorite) {
      removeFavorite(stationId)
    } else {
      addFavorite({ id: stationId, stationName, cityName })
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
      className="p-2 rounded-lg transition-all hover:scale-110"
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  )
}
