import { useQueries } from '@tanstack/react-query'
import { fetchAirQualityIndex } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'
import type { Station, AirQualityIndex } from '@/types/gios'

/**
 * Fetches AQI index for all stations in parallel using useQueries.
 * Returns a map of stationId → AirQualityIndex (or null while loading).
 * Markers on the map will progressively receive colors as responses arrive.
 */
export function useStationsAqiMap(stations: Station[]): {
  aqiMap: Record<number, AirQualityIndex | null>
  isLoading: boolean
} {
  const queries = useQueries({
    queries: stations.map((station) => ({
      queryKey: queryKeys.airQualityIndex(station.id),
      queryFn: () => fetchAirQualityIndex(station.id),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  })

  const aqiMap: Record<number, AirQualityIndex | null> = {}
  stations.forEach((station, i) => {
    aqiMap[station.id] = queries[i]?.data ?? null
  })

  const isLoading = stations.length > 0 && queries.some((q) => q.isLoading)

  return { aqiMap, isLoading }
}
