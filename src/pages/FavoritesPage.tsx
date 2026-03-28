import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useStations } from '@/hooks/useStations'
import { useAirQualityIndex } from '@/hooks/useAirQualityIndex'
import { Badge } from '@/components/ui/Badge'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Station } from '@/types/gios'
import type { FavoriteStation } from '@/types/app'

interface FavoriteStationCardProps {
  favorite: FavoriteStation
  station: Station | undefined
}

function FavoriteStationCard({ favorite, station }: FavoriteStationCardProps) {
  const { data: aqi, isLoading: aqiLoading } = useAirQualityIndex(favorite.id)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {station?.city.name ?? favorite.cityName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {station?.stationName ?? favorite.stationName}
          </p>
        </div>
        <FavoriteButton
          stationId={favorite.id}
          stationName={favorite.stationName}
          cityName={favorite.cityName}
        />
      </div>

      <div className="flex items-center justify-between">
        {aqiLoading ? (
          <Skeleton variant="text" className="w-24 h-6" />
        ) : (
          <Badge level={aqi?.stIndexLevel?.indexLevelName} size="sm" />
        )}
        <Link
          to={`/station/${favorite.id}`}
          className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline font-medium"
        >
          Szczegóły →
        </Link>
      </div>

      {station && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {station.city.commune.districtName}, {station.city.commune.provinceName}
        </p>
      )}
    </div>
  )
}

export default function FavoritesPage() {
  const favorites = useAppStore((s) => s.favorites)
  const { data: stations = [] } = useStations()

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Ulubione stacje
      </h1>

      {favorites.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Brak ulubionych stacji"
          description="Dodaj stacje do ulubionych klikając ikonę serduszka na mapie lub karcie stacji."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const station = stations.find((s) => s.id === fav.id)
            return (
              <FavoriteStationCard key={fav.id} favorite={fav} station={station} />
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
