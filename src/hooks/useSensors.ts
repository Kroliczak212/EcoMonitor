import { useQuery } from '@tanstack/react-query'
import { fetchSensors } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'

export function useSensors(stationId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.sensors(stationId!),
    queryFn: () => fetchSensors(stationId!),
    enabled: stationId !== undefined && !Number.isNaN(stationId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
