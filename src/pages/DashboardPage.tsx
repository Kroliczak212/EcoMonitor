import { useState } from 'react'
import { useStations } from '@/hooks/useStations'
import { useStationsAqiMap } from '@/hooks/useStationsAqiMap'
import { StationMap } from '@/components/dashboard/StationMap'
import { TopStationsGrid } from '@/components/dashboard/TopStationsGrid'
import { CitySearch } from '@/components/filters/CitySearch'
import { PollutantSelect } from '@/components/filters/PollutantSelect'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorFallback } from '@/components/ui/ErrorFallback'
import type { Station } from '@/types/gios'

export default function DashboardPage() {
  const { data: stations = [], isLoading, error, refetch } = useStations()
  const [focusStation, setFocusStation] = useState<Station | null>(null)
  const { aqiMap, isLoading: aqiLoading } = useStationsAqiMap(stations)

  if (error) {
    return (
      <PageContainer>
        <ErrorFallback
          message="Nie udało się pobrać listy stacji pomiarowych."
          onRetry={() => refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Title + filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jakość Powietrza w Polsce
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {isLoading
                ? 'Ładowanie stacji…'
                : `Dane z ${stations.length} stacji pomiarowych GIOŚ`}
            </p>
          </div>
          <PollutantSelect />
        </div>

        {/* City search visible on mobile only */}
        <div className="md:hidden">
          <CitySearch onSelectStation={setFocusStation} />
        </div>

        {/* Map */}
        <StationMap
          stations={stations}
          aqiMap={aqiMap}
          focusStation={focusStation}
          onStationSelect={setFocusStation}
        />

        {/* Top stations grid */}
        <TopStationsGrid stations={stations} aqiMap={aqiMap} isLoading={aqiLoading} />
      </div>
    </PageContainer>
  )
}
