export interface FavoriteStation {
  id: number
  stationName: string
  cityName: string
}

export type Theme = 'light' | 'dark'

export type Pollutant = 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'O3' | 'CO'

export type TimeRange = '6h' | '12h' | '24h'
