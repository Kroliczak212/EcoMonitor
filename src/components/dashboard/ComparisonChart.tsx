import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useSensors } from '@/hooks/useSensors'
import { useSensorData } from '@/hooks/useSensorData'
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/formatters'
import { POLLUTANT_UNITS } from '@/utils/constants'
import type { Pollutant } from '@/types/app'

interface ComparisonChartProps {
  stationIds: number[]
  stationNames: Record<number, string>
  pollutant: Pollutant
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b']

/**
 * ComparisonChart compares readings for a selected pollutant across up to 3 stations.
 * Hooks are always called for all 3 slots (with undefined for empty slots)
 * to satisfy React's rules of hooks.
 */
export const ComparisonChart = ({ stationIds, stationNames, pollutant }: ComparisonChartProps) => {
  const tooltipStyle = useChartTooltipStyle()

  // Always call hooks for all 3 slots to obey rules of hooks
  const { data: sensors0, isLoading: sl0 } = useSensors(stationIds[0])
  const { data: sensors1, isLoading: sl1 } = useSensors(stationIds[1])
  const { data: sensors2, isLoading: sl2 } = useSensors(stationIds[2])

  const findSensor = (sensors: typeof sensors0) =>
    sensors?.find((s) => s.param.paramFormula === pollutant || s.param.paramCode === pollutant)

  const pm25_0 = findSensor(sensors0)
  const pm25_1 = findSensor(sensors1)
  const pm25_2 = findSensor(sensors2)

  const { data: data0, isLoading: dl0 } = useSensorData(pm25_0?.id)
  const { data: data1, isLoading: dl1 } = useSensorData(pm25_1?.id)
  const { data: data2, isLoading: dl2 } = useSensorData(pm25_2?.id)

  const anyLoading =
    (stationIds[0] !== undefined && (sl0 || dl0)) ||
    (stationIds[1] !== undefined && (sl1 || dl1)) ||
    (stationIds[2] !== undefined && (sl2 || dl2))

  if (anyLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <Skeleton variant="chart" className="h-72" />
      </div>
    )
  }

  // Build combined time map
  const allStationData = [
    { id: stationIds[0], values: data0?.values ?? [] },
    { id: stationIds[1], values: data1?.values ?? [] },
    { id: stationIds[2], values: data2?.values ?? [] },
  ].filter((s): s is { id: number; values: typeof s.values } => s.id !== undefined)

  const timeMap = new Map<string, Record<number, number | null>>()

  for (const stationData of allStationData) {
    const validValues = stationData.values.filter((v) => v.value !== null).slice(-24)
    for (const entry of validValues) {
      if (!timeMap.has(entry.date)) {
        timeMap.set(entry.date, {})
      }
      timeMap.get(entry.date)![stationData.id] = entry.value
    }
  }

  const sortedDates = Array.from(timeMap.keys()).sort()
  const chartData = sortedDates.map((date) => {
    const row: Record<string, string | number | null> = { time: formatDateTime(date) }
    const values = timeMap.get(date)!
    for (const stationId of stationIds) {
      if (stationId !== undefined) {
        row[String(stationId)] = values[stationId] ?? null
      }
    }
    return row
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Porównanie {pollutant}
      </h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-72 text-gray-400 dark:text-gray-500 text-sm">
          Brak danych do porównania
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis unit={` ${POLLUTANT_UNITS[pollutant] ?? 'μg/m³'}`} tick={{ fontSize: 11 }} stroke="#9ca3af" width={75} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => {
                const unit = POLLUTANT_UNITS[pollutant] ?? 'μg/m³'
                return [typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—']
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {stationIds.map((id, index) => {
              if (id === undefined) return null
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={String(id)}
                  name={stationNames[id] ?? `Stacja ${id}`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
