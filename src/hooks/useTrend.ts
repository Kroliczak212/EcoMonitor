import { useSensors } from '@/hooks/useSensors'
import { useSensorData } from '@/hooks/useSensorData'
import type { Pollutant } from '@/types/app'

export type Trend = 'up' | 'down' | 'stable'

/**
 * Computes a trend for a pollutant at a station by comparing the latest
 * measurement to the measurement ~3 hours ago (3 hourly entries back).
 */
export function useTrend(stationId: number, pollutant: Pollutant): Trend | null {
  const { data: sensors } = useSensors(stationId)
  const sensor = sensors?.find(
    (s) => s.param.paramFormula === pollutant || s.param.paramCode === pollutant
  )
  const { data: sensorData } = useSensorData(sensor?.id)

  if (!sensorData) return null

  const valid = sensorData.values.filter((v) => v.value !== null)
  if (valid.length < 2) return null

  const latest = valid[valid.length - 1].value as number
  const earlier = valid[Math.max(0, valid.length - 4)].value as number

  const diff = latest - earlier
  if (Math.abs(diff) < 1) return 'stable'
  return diff > 0 ? 'up' : 'down'
}
