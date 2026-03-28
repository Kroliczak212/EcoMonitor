import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { SensorData } from '@/types/gios'
import type { Pollutant, TimeRange } from '@/types/app'
import { WHO_NORMS, POLLUTANT_UNITS } from '@/utils/constants'
import { formatDateTime } from '@/utils/formatters'
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface PollutantChartProps {
  sensorData: SensorData | undefined
  pollutant: string
  timeRange: TimeRange
  isLoading?: boolean
}

const TIME_RANGE_HOURS: Record<TimeRange, number> = {
  '6h': 6,
  '12h': 12,
  '24h': 24,
}

export const PollutantChart = ({
  sensorData,
  pollutant,
  timeRange,
  isLoading,
}: PollutantChartProps) => {
  const tooltipStyle = useChartTooltipStyle()

  if (isLoading) {
    return <Skeleton variant="chart" />
  }

  const hours = TIME_RANGE_HOURS[timeRange]

  const validValues = sensorData?.values.filter((v) => v.value !== null) ?? []
  const mostRecentDate = validValues.length > 0 ? new Date(validValues[validValues.length - 1].date).getTime() : null
  const cutoff = mostRecentDate !== null ? mostRecentDate - hours * 60 * 60 * 1000 : null
  const sliced = cutoff !== null ? validValues.filter((v) => new Date(v.date).getTime() >= cutoff) : validValues

  if (sliced.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Brak danych"
        description="Brak danych pomiarowych dla wybranego zakresu czasu."
      />
    )
  }

  const chartData = sliced.map((v) => ({
    time: formatDateTime(v.date),
    value: v.value as number,
  }))

  const whoNorm = WHO_NORMS[pollutant as Pollutant] ?? null
  const unit = POLLUTANT_UNITS[pollutant as Pollutant] ?? 'μg/m³'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Stężenie {pollutant} — ostatnie {timeRange}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis
            unit={` ${unit}`}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            width={70}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—', pollutant]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name={pollutant}
            activeDot={{ r: 4 }}
          />
          {whoNorm !== null && (
            <ReferenceLine
              y={whoNorm}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: 'WHO', fill: '#ef4444', fontSize: 11 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
