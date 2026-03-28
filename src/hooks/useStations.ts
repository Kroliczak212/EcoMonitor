import { useQuery } from '@tanstack/react-query'
import { fetchStations } from '@/api/giosApi'
import { queryKeys } from '@/api/queryKeys'

export function useStations() {
  return useQuery({
    queryKey: queryKeys.stations(),
    queryFn: fetchStations,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
