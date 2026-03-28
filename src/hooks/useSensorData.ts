import { useQuery } from '@tanstack/react-query'
import { fetchSensorData } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'

export function useSensorData(sensorId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.sensorData(sensorId!),
    queryFn: () => fetchSensorData(sensorId!),
    enabled: sensorId !== undefined && !Number.isNaN(sensorId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
