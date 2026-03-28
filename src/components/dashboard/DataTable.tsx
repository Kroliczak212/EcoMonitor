import { useState } from 'react'
import type { Sensor, SensorData } from '@/types/gios'
import type { Pollutant } from '@/types/app'
import { WHO_NORMS } from '@/utils/constants'
import { formatDateTime, formatValue } from '@/utils/formatters'
import { Skeleton } from '@/components/ui/Skeleton'

interface DataTableProps {
  sensors: Sensor[]
  sensorDataMap: Record<number, SensorData>
  isLoading?: boolean
}

type SortDir = 'asc' | 'desc'

const COLUMNS: Array<{ label: string; key: Pollutant | 'time' }> = [
  { label: 'Godzina', key: 'time' },
  { label: 'PM2.5', key: 'PM2.5' },
  { label: 'PM10', key: 'PM10' },
  { label: 'NO2', key: 'NO2' },
  { label: 'SO2', key: 'SO2' },
  { label: 'O3', key: 'O3' },
  { label: 'CO', key: 'CO' },
]

function getValueColorClass(value: number | null, pollutant: Pollutant): string {
  if (value === null) return 'text-gray-400 dark:text-gray-500'
  const norm = WHO_NORMS[pollutant]
  if (!norm) return 'text-gray-700 dark:text-gray-300'
  const ratio = value / norm
  if (ratio < 0.5) return 'text-green-600 dark:text-green-400'
  if (ratio <= 1) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

interface TableRow {
  time: string
  rawTime: string
  values: Partial<Record<Pollutant, number | null>>
}

function buildRows(sensors: Sensor[], sensorDataMap: Record<number, SensorData>): TableRow[] {
  if (Object.keys(sensorDataMap).length === 0) return []

  // Find time axis from the first available sensor data
  let timeAxis: string[] = []
  for (const sensor of sensors) {
    const data = sensorDataMap[sensor.id]
    if (data && data.values.length > 0) {
      timeAxis = data.values
        .slice(-24)
        .map((v) => v.date)
      break
    }
  }

  if (timeAxis.length === 0) return []

  return timeAxis.map((date) => {
    const row: TableRow = { time: formatDateTime(date), rawTime: date, values: {} }

    for (const sensor of sensors) {
      const formula = sensor.param.paramFormula as Pollutant
      const code = sensor.param.paramCode as Pollutant
      const pollutantKey: Pollutant | undefined =
        WHO_NORMS[formula] !== undefined
          ? formula
          : WHO_NORMS[code] !== undefined
          ? code
          : undefined

      if (!pollutantKey) continue

      const data = sensorDataMap[sensor.id]
      if (!data) continue

      const entry = data.values.find((v) => v.date === date)
      if (entry) {
        row.values[pollutantKey] = entry.value
      }
    }

    return row
  })
}

export const DataTable = ({ sensors, sensorDataMap, isLoading }: DataTableProps) => {
  const [sortKey, setSortKey] = useState<string>('time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Skeleton variant="text" className="w-48 h-5" />
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton variant="text" className="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const rows = buildRows(sensors, sensorDataMap)

  const sortedRows = [...rows].sort((a, b) => {
    if (sortKey === 'time') {
      const cmp = a.rawTime.localeCompare(b.rawTime)
      return sortDir === 'asc' ? cmp : -cmp
    }
    const pollutant = sortKey as Pollutant
    const aVal = a.values[pollutant] ?? -Infinity
    const bVal = b.values[pollutant] ?? -Infinity
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const sortIcon = (key: string) => {
    if (sortKey !== key) return <span className="text-gray-300 dark:text-gray-600 ml-1">↕</span>
    return (
      <span className="text-green-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Dane pomiarowe — ostatnie 24h
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-green-600 dark:hover:text-green-400 select-none whitespace-nowrap"
                >
                  {col.label}
                  {sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  Brak danych pomiarowych
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr
                  key={row.rawTime}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {row.time}
                  </td>
                  {(['PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO'] as Pollutant[]).map(
                    (pollutant) => {
                      const val = row.values[pollutant] ?? null
                      return (
                        <td
                          key={pollutant}
                          className={`px-4 py-2.5 font-medium whitespace-nowrap ${getValueColorClass(
                            val,
                            pollutant
                          )}`}
                        >
                          {val !== null ? formatValue(val) : '—'}
                        </td>
                      )
                    }
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
