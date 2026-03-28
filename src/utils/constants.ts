import type { Pollutant } from '@/types/app'

// WHO 24h norms in μg/m³ (except CO: μg/m³, O3: μg/m³ 8h peak)
export const WHO_NORMS: Record<Pollutant, number> = {
  'PM2.5': 15,
  'PM10': 45,
  'NO2': 25,
  'SO2': 40,
  'O3': 100,
  'CO': 4000,
}

export const POLLUTANT_LABELS: Record<Pollutant, string> = {
  'PM2.5': 'Pył PM2.5',
  'PM10': 'Pył PM10',
  'NO2': 'Dwutlenek azotu',
  'SO2': 'Dwutlenek siarki',
  'O3': 'Ozon',
  'CO': 'Tlenek węgla',
}

export const POLLUTANT_UNITS: Record<Pollutant, string> = {
  'PM2.5': 'μg/m³',
  'PM10': 'μg/m³',
  'NO2': 'μg/m³',
  'SO2': 'μg/m³',
  'O3': 'μg/m³',
  'CO': 'μg/m³',
}

export const POLLUTANTS: Pollutant[] = ['PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO']
