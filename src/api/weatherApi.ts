import type { WeatherResponse } from '@/types/weather'

const BASE_URL = import.meta.env.PROD
  ? 'https://api.open-meteo.com/v1'
  : '/api/weather'

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'Europe/Warsaw',
    forecast_days: '1',
  })
  const res = await fetch(`${BASE_URL}/forecast?${params}`)
  if (!res.ok) throw new Error('Błąd pobierania pogody')
  return res.json()
}
