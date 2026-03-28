import { useQueries } from '@tanstack/react-query'
import { fetchSensorData } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'
import type { Sensor, SensorData } from '@/types/gios'

/**
 * Fetches sensor data for all sensors on a station in parallel.
 * Returns a map of sensorId → SensorData and an isLoading flag.
 */
export function useAllSensorsData(sensors: Sensor[] | undefined): {
  sensorDataMap: Record<number, SensorData>
  isLoading: boolean
} {
  const queries = useQueries({
    queries: (sensors ?? []).map((sensor) => ({
      queryKey: queryKeys.sensorData(sensor.id),
      queryFn: () => fetchSensorData(sensor.id),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  })

  const sensorDataMap: Record<number, SensorData> = {}
  ;(sensors ?? []).forEach((sensor, i) => {
    const data = queries[i]?.data
    if (data) sensorDataMap[sensor.id] = data
  })

  const isLoading = queries.some((q) => q.isLoading)

  return { sensorDataMap, isLoading }
}
