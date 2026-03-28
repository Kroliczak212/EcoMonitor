import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr.replace(' ', 'T')), 'HH:mm', { locale: pl })
  } catch {
    return dateStr
  }
}

export function formatValue(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(decimals)
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`
}

export function formatWindSpeed(value: number): string {
  return `${Math.round(value)} km/h`
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`
}
