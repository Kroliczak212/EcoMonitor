import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { Sensor, SensorData } from '@/types/gios'
import type { Pollutant } from '@/types/app'
import { WHO_NORMS, POLLUTANT_UNITS } from '@/utils/constants'
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle'
import { Skeleton } from '@/components/ui/Skeleton'

interface NormComparisonBarProps {
  sensors: Sensor[] | undefined
  sensorDataMap: Record<number, SensorData>
  isLoading?: boolean
}

interface ChartEntry {
  name: Pollutant
  value: number
  norm: number
  percent: number
  unit: string
}

function getLatestValue(sensorData: SensorData): number | null {
  const validValues = sensorData.values.filter((v) => v.value !== null)
  if (validValues.length === 0) return null
  return validValues[validValues.length - 1].value
}

export const NormComparisonBar = ({
  sensors,
  sensorDataMap,
  isLoading,
}: NormComparisonBarProps) => {
  const tooltipStyle = useChartTooltipStyle()

  if (isLoading) {
    return <Skeleton variant="chart" className="h-60" />
  }

  const hasSensorData = Object.keys(sensorDataMap).length > 0

  if (!hasSensorData || !sensors || sensors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Porównanie z normami WHO
        </h3>
        <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
          Brak danych do porównania
        </div>
      </div>
    )
  }

  const chartData: ChartEntry[] = []

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

    const sensorData = sensorDataMap[sensor.id]
    if (!sensorData) continue

    const latestValue = getLatestValue(sensorData)
    if (latestValue === null) continue

    const norm = WHO_NORMS[pollutantKey]
    const percent = Math.round((latestValue / norm) * 100)

    const alreadyAdded = chartData.some((d) => d.name === pollutantKey)
    if (!alreadyAdded) {
      chartData.push({ name: pollutantKey, value: latestValue, norm, percent, unit: POLLUTANT_UNITS[pollutantKey] })
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Porównanie z normami WHO
        </h3>
        <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
          Brak danych do porównania
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Porównanie z normami WHO
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name, props) => {
              const unit = (props as { payload?: ChartEntry }).payload?.unit ?? 'μg/m³'
              const v = typeof value === 'number' ? value.toFixed(1) : '—'
              return [`${v} ${unit}`, name === 'value' ? 'Aktualnie' : 'Norma WHO']
            }}
          />
          <ReferenceLine
            y={0}
            stroke="#9ca3af"
          />
          <Bar dataKey="value" name="Aktualnie" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.value <= entry.norm ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
          <Bar dataKey="norm" name="Norma WHO" fill="#9ca3af" opacity={0.4} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
