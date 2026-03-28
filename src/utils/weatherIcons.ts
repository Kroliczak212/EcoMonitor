// WMO Weather interpretation codes → emoji icon + label
export interface WeatherInfo {
  icon: string
  label: string
}

export function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0) return { icon: '☀️', label: 'Bezchmurnie' }
  if (code <= 2) return { icon: '⛅', label: 'Częściowe zachmurzenie' }
  if (code === 3) return { icon: '☁️', label: 'Zachmurzenie' }
  if (code <= 49) return { icon: '🌫️', label: 'Mgła' }
  if (code <= 59) return { icon: '🌦️', label: 'Mżawka' }
  if (code <= 69) return { icon: '🌧️', label: 'Deszcz' }
  if (code <= 79) return { icon: '❄️', label: 'Śnieg' }
  if (code <= 84) return { icon: '🌨️', label: 'Deszcz ze śniegiem' }
  if (code <= 94) return { icon: '⛈️', label: 'Burza' }
  return { icon: '🌩️', label: 'Burza z gradem' }
}
