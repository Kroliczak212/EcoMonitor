import { Link } from 'react-router-dom'
import type { Station, AirQualityIndex } from '@/types/gios'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { getLevelNameForPollutant } from '@/utils/aqiHelpers'
import { useAppStore } from '@/store/useAppStore'
import { useTrend } from '@/hooks/useTrend'
import type { Trend } from '@/hooks/useTrend'

interface AirQualityCardProps {
  station: Station
  aqi: AirQualityIndex | undefined
  isLoading?: boolean
}

function TrendIcon({ trend }: { trend: Trend | null }) {
  if (trend === null) return null
  if (trend === 'up') return <span className="text-red-500 text-sm font-bold">↑</span>
  if (trend === 'down') return <span className="text-green-500 text-sm font-bold">↓</span>
  return <span className="text-gray-400 text-sm font-bold">→</span>
}

export const AirQualityCard = ({ station, aqi, isLoading }: AirQualityCardProps) => {
  const selectedPollutant = useAppStore((s) => s.selectedPollutant)
  const trend = useTrend(station.id, selectedPollutant)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-1/3 h-6" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>
    )
  }

  const overallLevel = aqi?.stIndexLevel?.indexLevelName
  const pollutantLevel = getLevelNameForPollutant(aqi, selectedPollutant) ?? '—'

  return (
    <Link
      to={`/station/${station.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 dark:text-white truncate">
            {station.city.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {station.stationName}
          </p>
        </div>
        <div onClick={(e) => e.preventDefault()}>
          <FavoriteButton
            stationId={station.id}
            stationName={station.stationName}
            cityName={station.city.name}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <Badge level={overallLevel} size="sm" />
        <div className="text-right flex items-center gap-1.5">
          <TrendIcon trend={trend} />
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{selectedPollutant}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{pollutantLevel}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
