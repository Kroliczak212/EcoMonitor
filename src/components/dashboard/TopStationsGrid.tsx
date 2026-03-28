import type { Station, AirQualityIndex } from '@/types/gios'
import { AirQualityCard } from '@/components/dashboard/AirQualityCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { getLevelNameForPollutant } from '@/utils/aqiHelpers'
import { useAppStore } from '@/store/useAppStore'

const AQI_ORDER: Record<string, number> = {
  'Bardzo dobry': 0,
  'Dobry': 1,
  'Umiarkowany': 2,
  'Dostateczny': 3,
  'Zły': 4,
  'Bardzo zły': 5,
}

function getOrder(levelName: string | null | undefined): number {
  if (!levelName) return -1
  return AQI_ORDER[levelName] ?? -1
}

interface TopStationsGridProps {
  stations: Station[]
  aqiMap: Record<number, AirQualityIndex | null>
  isLoading?: boolean
}

export const TopStationsGrid = ({ stations, aqiMap, isLoading }: TopStationsGridProps) => {
  const selectedPollutant = useAppStore((s) => s.selectedPollutant)

  // Only include stations that have AQI data for the selected pollutant
  const stationsWithAqi = stations.filter((s) => {
    const level = getLevelNameForPollutant(aqiMap[s.id], selectedPollutant)
    return level != null
  })

  const getStationOrder = (s: Station) =>
    getOrder(getLevelNameForPollutant(aqiMap[s.id], selectedPollutant))

  const cleanest = [...stationsWithAqi]
    .sort((a, b) => getStationOrder(a) - getStationOrder(b))
    .slice(0, 5)

  const mostPolluted = [...stationsWithAqi]
    .sort((a, b) => getStationOrder(b) - getStationOrder(a))
    .slice(0, 5)

  const skeletonCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3 animate-pulse"
        >
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Most polluted */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          Top 5 najbardziej zanieczyszczonych
        </h2>
        {isLoading ? (
          skeletonCards
        ) : mostPolluted.length === 0 ? (
          <EmptyState icon="📭" title="Brak danych" description={`Brak stacji z danymi dla wybranego wskaźnika`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {mostPolluted.map((station) => (
              <AirQualityCard
                key={station.id}
                station={station}
                aqi={aqiMap[station.id] ?? undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Cleanest */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          Top 5 najczystszych
        </h2>
        {isLoading ? (
          skeletonCards
        ) : cleanest.length === 0 ? (
          <EmptyState icon="📭" title="Brak danych" description={`Brak stacji z danymi dla wybranego wskaźnika`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cleanest.map((station) => (
              <AirQualityCard
                key={station.id}
                station={station}
                aqi={aqiMap[station.id] ?? undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
