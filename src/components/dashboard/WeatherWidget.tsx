import { useWeather } from '@/hooks/useWeather'
import { getWeatherInfo } from '@/utils/weatherIcons'
import {
  formatTemperature,
  formatWindSpeed,
  formatHumidity,
} from '@/utils/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorFallback } from '@/components/ui/ErrorFallback'

interface WeatherWidgetProps {
  lat: number
  lon: number
}

export const WeatherWidget = ({ lat, lon }: WeatherWidgetProps) => {
  const { data: weather, isLoading, error, refetch } = useWeather(lat, lon)

  if (isLoading) {
    return <Skeleton variant="card" className="h-44" />
  }

  if (error || !weather) {
    return (
      <ErrorFallback
        message="Nie udało się pobrać danych pogodowych."
        onRetry={() => refetch()}
      />
    )
  }

  const { current, daily } = weather
  const weatherInfo = getWeatherInfo(current.weather_code)
  const todayMin = daily.temperature_2m_min[0]
  const todayMax = daily.temperature_2m_max[0]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wide">
        Pogoda
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl" role="img" aria-label={weatherInfo.label}>
          {weatherInfo.icon}
        </span>
        <div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {formatTemperature(current.temperature_2m)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300">{weatherInfo.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/60 dark:bg-blue-900/40 rounded-lg py-2 px-1">
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">Wiatr</p>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {formatWindSpeed(current.wind_speed_10m)}
          </p>
        </div>
        <div className="bg-white/60 dark:bg-blue-900/40 rounded-lg py-2 px-1">
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">Wilgotność</p>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {formatHumidity(current.relative_humidity_2m)}
          </p>
        </div>
        <div className="bg-white/60 dark:bg-blue-900/40 rounded-lg py-2 px-1">
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">Min/Max</p>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {todayMin !== undefined && todayMax !== undefined
              ? `${Math.round(todayMin)}° / ${Math.round(todayMax)}°`
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
