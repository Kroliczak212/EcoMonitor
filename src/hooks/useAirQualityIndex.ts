import { useQuery } from '@tanstack/react-query'
import { fetchAirQualityIndex } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'

export function useAirQualityIndex(stationId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.airQualityIndex(stationId!),
    queryFn: () => fetchAirQualityIndex(stationId!),
    enabled: stationId !== undefined && !Number.isNaN(stationId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
