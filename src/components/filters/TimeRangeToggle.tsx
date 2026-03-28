import type { TimeRange } from '@/types/app'

const TIME_RANGES: TimeRange[] = ['6h', '12h', '24h']

interface TimeRangeToggleProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export const TimeRangeToggle = ({ value, onChange }: TimeRangeToggleProps) => {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === range
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
