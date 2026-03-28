import { useSensors } from '@/hooks/useSensors'
import { useSensorData } from '@/hooks/useSensorData'
import { WHO_NORMS, POLLUTANTS } from '@/utils/constants'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pollutant } from '@/types/app'

interface ComparisonTableProps {
  stationIds: number[]
  stationNames: Record<number, string>
}

const COLORS = ['text-green-600 dark:text-green-400', 'text-blue-600 dark:text-blue-400', 'text-amber-600 dark:text-amber-400']
const DOT_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-amber-500']

function useLatestValues(stationId: number | undefined): {
  values: Record<Pollutant, number | null>
  isLoading: boolean
} {
  const { data: sensors, isLoading: sensorsLoading } = useSensors(stationId)

  // Always call hooks for all pollutants — find each pollutant's sensor
  const pm25Sensor = sensors?.find((s) => s.param.paramFormula === 'PM2.5' || s.param.paramCode === 'PM2.5')
  const pm10Sensor = sensors?.find((s) => s.param.paramFormula === 'PM10' || s.param.paramCode === 'PM10')
  const no2Sensor = sensors?.find((s) => s.param.paramFormula === 'NO2' || s.param.paramCode === 'NO2')
  const so2Sensor = sensors?.find((s) => s.param.paramFormula === 'SO2' || s.param.paramCode === 'SO2')
  const o3Sensor = sensors?.find((s) => s.param.paramFormula === 'O3' || s.param.paramCode === 'O3')
  const coSensor = sensors?.find((s) => s.param.paramFormula === 'CO' || s.param.paramCode === 'CO')

  const { data: pm25Data, isLoading: dl0 } = useSensorData(pm25Sensor?.id)
  const { data: pm10Data, isLoading: dl1 } = useSensorData(pm10Sensor?.id)
  const { data: no2Data, isLoading: dl2 } = useSensorData(no2Sensor?.id)
  const { data: so2Data, isLoading: dl3 } = useSensorData(so2Sensor?.id)
  const { data: o3Data, isLoading: dl4 } = useSensorData(o3Sensor?.id)
  const { data: coData, isLoading: dl5 } = useSensorData(coSensor?.id)

  function latest(data: typeof pm25Data): number | null {
    if (!data) return null
    const valid = data.values.filter((v) => v.value !== null)
    return valid.length > 0 ? valid[valid.length - 1].value : null
  }

  const isLoading = stationId !== undefined && (sensorsLoading || dl0 || dl1 || dl2 || dl3 || dl4 || dl5)

  return {
    values: {
      'PM2.5': latest(pm25Data),
      'PM10': latest(pm10Data),
      'NO2': latest(no2Data),
      'SO2': latest(so2Data),
      'O3': latest(o3Data),
      'CO': latest(coData),
    },
    isLoading,
  }
}

function ValueCell({
  value,
  pollutant,
  colorClass,
}: {
  value: number | null
  pollutant: Pollutant
  colorClass: string
}) {
  if (value === null) return <td className="px-4 py-3 text-center text-gray-400 text-sm">—</td>

  const norm = WHO_NORMS[pollutant]
  const pct = Math.round((value / norm) * 100)
  const overNorm = value > norm

  return (
    <td className="px-4 py-3 text-center">
      <span className={`font-semibold text-sm ${colorClass}`}>{value.toFixed(1)}</span>
      <span className="text-xs text-gray-400 ml-1">μg/m³</span>
      {overNorm && (
        <span className="ml-1.5 text-xs text-red-500 font-medium">+{pct - 100}% normy</span>
      )}
    </td>
  )
}

export const ComparisonTable = ({ stationIds, stationNames }: ComparisonTableProps) => {
  // Call hooks unconditionally for all 3 slots — isLoading surfaces from within
  const { values: values0, isLoading: l0 } = useLatestValues(stationIds[0])
  const { values: values1, isLoading: l1 } = useLatestValues(stationIds[1])
  const { values: values2, isLoading: l2 } = useLatestValues(stationIds[2])

  const anyLoading = l0 || l1 || l2

  if (anyLoading) {
    return <Skeleton variant="card" className="h-48 mt-6" />
  }

  const allValues = [values0, values1, values2]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto mt-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-24">
              Wskaźnik
            </th>
            {stationIds.map((id, i) => (
              <th
                key={id ?? i}
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${DOT_COLORS[i]}`} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {id !== undefined ? (stationNames[id] ?? `Stacja ${id}`) : '—'}
                  </span>
                </div>
              </th>
            ))}
            {stationIds.length === 2 && (
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Różnica
              </th>
            )}
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Norma WHO
            </th>
          </tr>
        </thead>
        <tbody>
          {POLLUTANTS.map((pollutant) => {
            const valA = stationIds[0] !== undefined ? (allValues[0]?.[pollutant] ?? null) : null
            const valB = stationIds[1] !== undefined ? (allValues[1]?.[pollutant] ?? null) : null
            const diffPct =
              stationIds.length === 2 && valA !== null && valB !== null && valB !== 0
                ? Math.round(((valA - valB) / valB) * 100)
                : null
            return (
              <tr
                key={pollutant}
                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {pollutant}
                </td>
                {stationIds.map((id, i) => (
                  <ValueCell
                    key={id ?? i}
                    value={id !== undefined ? (allValues[i]?.[pollutant] ?? null) : null}
                    pollutant={pollutant}
                    colorClass={COLORS[i]}
                  />
                ))}
                {stationIds.length === 2 && (
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    {diffPct === null ? (
                      <span className="text-gray-400">—</span>
                    ) : diffPct > 0 ? (
                      <span className="text-red-500">+{diffPct}%</span>
                    ) : diffPct < 0 ? (
                      <span className="text-green-500">{diffPct}%</span>
                    ) : (
                      <span className="text-gray-400">0%</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-center text-xs text-gray-400">
                  {WHO_NORMS[pollutant]} μg/m³
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
