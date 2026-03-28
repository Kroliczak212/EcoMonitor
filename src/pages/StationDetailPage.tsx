import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useStations } from '@/hooks/useStations'
import { useSensors } from '@/hooks/useSensors'
import { useSensorData } from '@/hooks/useSensorData'
import { useAllSensorsData } from '@/hooks/useAllSensorsData'
import { useAirQualityIndex } from '@/hooks/useAirQualityIndex'
import { PollutantChart } from '@/components/dashboard/PollutantChart'
import { NormComparisonBar } from '@/components/dashboard/NormComparisonBar'
import { DataTable } from '@/components/dashboard/DataTable'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { Badge } from '@/components/ui/Badge'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { TimeRangeToggle } from '@/components/filters/TimeRangeToggle'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorFallback } from '@/components/ui/ErrorFallback'
import { Skeleton } from '@/components/ui/Skeleton'
import type { TimeRange } from '@/types/app'

const AQI_DETAIL_FIELDS = [
  { label: 'PM2.5', key: 'pm25IndexLevel' },
  { label: 'PM10', key: 'pm10IndexLevel' },
  { label: 'NO2', key: 'no2IndexLevel' },
  { label: 'SO2', key: 'so2IndexLevel' },
  { label: 'O3', key: 'o3IndexLevel' },
  { label: 'CO', key: 'coIndexLevel' },
] as const

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const stationId = Number(id)
  // Treat NaN as undefined so hooks stay disabled for invalid URLs
  const validStationId = isNaN(stationId) ? undefined : stationId

  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [selectedSensorId, setSelectedSensorId] = useState<number | undefined>(undefined)

  const { data: stations, isLoading: stationsLoading } = useStations()
  const station = stations?.find((s) => s.id === validStationId)

  const { data: sensors, isLoading: sensorsLoading, error: sensorsError } = useSensors(validStationId)
  const { data: aqiIndex, isLoading: aqiLoading } = useAirQualityIndex(validStationId)

  const pm25Sensor = sensors?.find(
    (s) => s.param.paramCode === 'PM2.5' || s.param.paramFormula === 'PM2.5'
  )
  const defaultSensor = pm25Sensor ?? sensors?.[0]
  const activeSensorId = selectedSensorId ?? defaultSensor?.id

  const { data: sensorData, isLoading: dataLoading, error: sensorDataError } = useSensorData(activeSensorId)
  const { sensorDataMap, isLoading: allDataLoading } = useAllSensorsData(sensors)

  const lat = station ? parseFloat(station.gegrLat) : undefined
  const lon = station ? parseFloat(station.gegrLon) : undefined

  const activeSensor = sensors?.find((s) => s.id === activeSensorId)
  const activePollutant = activeSensor?.param.paramFormula ?? activeSensor?.param.paramCode ?? ''

  if (isNaN(stationId)) return <Navigate to="/" replace />

  if (sensorsError) {
    return (
      <PageContainer>
        <ErrorFallback message="Nie udało się pobrać danych stacji." />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back link + header */}
        <div>
          <Link
            to="/"
            className="text-sm text-green-600 hover:text-green-700 hover:underline dark:text-green-400"
          >
            ← Powrót do dashboardu
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-3 gap-3">
            <div className="min-w-0">
              {stationsLoading || !station ? (
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-48 h-7" />
                  <Skeleton variant="text" className="w-72 h-5" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {station.city.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {station.stationName}
                  </p>
                  {station.addressStreet && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                      {station.addressStreet}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {station.city.commune.districtName},{' '}
                    {station.city.commune.provinceName}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {aqiLoading ? (
                <Skeleton variant="text" className="w-28 h-8" />
              ) : (
                <Badge level={aqiIndex?.stIndexLevel?.indexLevelName} size="lg" />
              )}
              <FavoriteButton
                stationId={validStationId ?? stationId}
                stationName={station?.stationName ?? ''}
                cityName={station?.city.name ?? ''}
              />
            </div>
          </div>
        </div>

        {/* Two column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: charts (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sensor selector + TimeRangeToggle */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <select
                value={activeSensorId ?? ''}
                onChange={(e) =>
                  setSelectedSensorId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200"
                disabled={sensorsLoading || !sensors?.length}
              >
                {sensorsLoading ? (
                  <option>Ładowanie czujników…</option>
                ) : (
                  sensors?.map((sensor) => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.param.paramName} ({sensor.param.paramFormula})
                    </option>
                  ))
                )}
              </select>
              <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
            </div>

            {sensorDataError ? (
              <ErrorFallback
                message="Nie udało się pobrać danych pomiarowych."
                onRetry={() => window.location.reload()}
              />
            ) : (
              <PollutantChart
                sensorData={sensorData}
                pollutant={activePollutant}
                timeRange={timeRange}
                isLoading={dataLoading}
              />
            )}

            <NormComparisonBar
              sensors={sensors}
              sensorDataMap={sensorDataMap}
              isLoading={sensorsLoading || allDataLoading}
            />
          </div>

          {/* Sidebar: weather + AQI detail */}
          <div className="space-y-4">
            {lat !== undefined && lon !== undefined && (
              <WeatherWidget lat={lat} lon={lon} />
            )}

            {/* AQI detail card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Indeks jakości powietrza
              </h3>

              {aqiLoading ? (
                <div className="space-y-2">
                  {AQI_DETAIL_FIELDS.map((f) => (
                    <Skeleton key={f.key} variant="text" className="h-6" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {AQI_DETAIL_FIELDS.map((field) => {
                    const level = aqiIndex
                      ? (aqiIndex[field.key] as { indexLevelName: string } | null)
                      : null
                    return (
                      <div key={field.key} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium w-12">
                          {field.label}
                        </span>
                        <Badge level={level?.indexLevelName} size="sm" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data table full width */}
        <DataTable
          sensors={sensors ?? []}
          sensorDataMap={sensorDataMap}
          isLoading={sensorsLoading || allDataLoading}
        />
      </div>
    </PageContainer>
  )
}
