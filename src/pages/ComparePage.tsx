import { useState } from 'react'
import { useStations } from '@/hooks/useStations'
import { ComparisonChart } from '@/components/dashboard/ComparisonChart'
import { ComparisonTable } from '@/components/dashboard/ComparisonTable'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorFallback } from '@/components/ui/ErrorFallback'
import { POLLUTANTS } from '@/utils/constants'
import type { Station } from '@/types/gios'
import type { Pollutant } from '@/types/app'

export default function ComparePage() {
  const { data: stations = [], isLoading, error: stationsError, refetch } = useStations()
  const [selectedPollutant, setSelectedPollutant] = useState<Pollutant>('PM2.5')
  // Each slot: stable key + stationId
  const [slots, setSlots] = useState<{ key: number; stationId: number | undefined }[]>([
    { key: 0, stationId: undefined },
  ])
  const addSlot = () => {
    if (slots.length < 3) {
      setSlots((prev) => {
        const newKey = prev.reduce((max, s) => Math.max(max, s.key), 0) + 1
        return [...prev, { key: newKey, stationId: undefined }]
      })
    }
  }

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, stationId: number | undefined) => {
    setSlots((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], stationId }
      return updated
    })
  }

  // Get already selected ids (excluding current slot) for filtering
  const getAvailableStations = (currentIndex: number): Station[] => {
    const otherSelected = slots.filter((_, i) => i !== currentIndex).map((s) => s.stationId)
    return stations.filter((s) => !otherSelected.includes(s.id))
  }

  const validIds = slots.map((s) => s.stationId).filter((id): id is number => id !== undefined)

  const stationNames: Record<number, string> = {}
  for (const id of validIds) {
    const station = stations.find((s) => s.id === id)
    if (station) {
      stationNames[id] = station.city.name
    }
  }

  if (stationsError) {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Porównanie stacji
      </h1>

      {/* Station selectors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Wybierz do 3 stacji do porównania
          </p>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value as Pollutant)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200"
          >
            {POLLUTANTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          {slots.map((slot, index) => (
            <div key={slot.key} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-amber-400'
                }`}
              />
              <select
                value={slot.stationId ?? ''}
                onChange={(e) =>
                  updateSlot(index, e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200 min-w-[200px]"
                disabled={isLoading}
              >
                <option value="">
                  {isLoading ? 'Ładowanie stacji…' : '— Wybierz stację —'}
                </option>
                {getAvailableStations(index).map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.city.name} — {station.stationName}
                  </option>
                ))}
              </select>
              {slots.length > 1 && (
                <button
                  onClick={() => removeSlot(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Usuń stację"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {slots.length < 3 && (
            <button
              onClick={addSlot}
              className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-500 dark:hover:border-green-500 dark:hover:text-green-400 transition-colors text-sm font-medium"
            >
              + Dodaj stację
            </button>
          )}
        </div>
      </div>

      {/* Chart + table or empty state */}
      {validIds.length >= 2 ? (
        <>
          <ComparisonChart stationIds={validIds} stationNames={stationNames} pollutant={selectedPollutant} />
          <ComparisonTable stationIds={validIds} stationNames={stationNames} />
        </>
      ) : (
        <EmptyState
          icon="⚖️"
          title="Wybierz stacje do porównania"
          description="Dodaj co najmniej 2 stacje aby zobaczyć porównanie danych"
        />
      )}
    </PageContainer>
  )
}
