import type { AirQualityIndex } from '@/types/gios'
import type { Pollutant } from '@/types/app'

const POLLUTANT_INDEX_KEY: Record<Pollutant, keyof AirQualityIndex> = {
  'PM2.5': 'pm25IndexLevel',
  'PM10': 'pm10IndexLevel',
  'NO2': 'no2IndexLevel',
  'SO2': 'so2IndexLevel',
  'O3': 'o3IndexLevel',
  'CO': 'coIndexLevel',
}

export function getLevelNameForPollutant(
  aqi: AirQualityIndex | null | undefined,
  pollutant: Pollutant
): string | null | undefined {
  if (!aqi) return null
  const key = POLLUTANT_INDEX_KEY[pollutant]
  const level = aqi[key] as { indexLevelName: string } | null
  return level?.indexLevelName
}

// Static map required — dynamic `text-[${color}]` classes are not included in Tailwind's JIT output
const AQI_TEXT_CLASS: Record<string, string> = {
  'Bardzo dobry': 'text-green-500',
  'Dobry': 'text-green-400',
  'Umiarkowany': 'text-yellow-400',
  'Dostateczny': 'text-orange-400',
  'Zły': 'text-red-500',
  'Bardzo zły': 'text-purple-600',
}

export function getAqiTextClass(levelName: string | null | undefined): string {
  if (!levelName) return 'text-gray-500'
  return AQI_TEXT_CLASS[levelName] ?? 'text-gray-500'
}

// Map GIOŚ index level id to marker color for Leaflet
export function getMarkerColor(levelName: string | null | undefined): string {
  if (!levelName) return '#6b7280'
  const map: Record<string, string> = {
    'Bardzo dobry': '#22c55e',
    'Dobry': '#4ade80',
    'Umiarkowany': '#facc15',
    'Dostateczny': '#fb923c',
    'Zły': '#ef4444',
    'Bardzo zły': '#9333ea',
  }
  return map[levelName] ?? '#6b7280'
}
