import { useQuery } from '@tanstack/react-query'
import { fetchWeather } from '@/api/weatherApi'
import { queryKeys } from '@/api/queryKeys'

export function useWeather(lat: number | undefined, lon: number | undefined) {
  return useQuery({
    queryKey: queryKeys.weather(lat!, lon!),
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  })
}
