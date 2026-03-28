import { clsx } from 'clsx'

interface BadgeProps {
  level: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}

const AQI_COLOR_MAP: Record<string, string> = {
  'Bardzo dobry': 'bg-green-500 text-white',
  'Dobry': 'bg-green-400 text-white',
  'Umiarkowany': 'bg-yellow-400 text-gray-900',
  'Dostateczny': 'bg-orange-400 text-white',
  'Zły': 'bg-red-500 text-white',
  'Bardzo zły': 'bg-purple-600 text-white',
}

export const Badge = ({ level, size = 'md' }: BadgeProps) => {
  const colorClass = level ? (AQI_COLOR_MAP[level] ?? 'bg-gray-400 text-white') : 'bg-gray-400 text-white'
  const label = level ?? 'Brak danych'

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-3 py-1 rounded-full font-medium',
    lg: 'text-base px-4 py-1.5 rounded-full font-semibold',
  }[size]

  return (
    <span className={clsx('inline-block', colorClass, sizeClass)}>
      {label}
    </span>
  )
}
