import { useAppStore } from '@/store/useAppStore'
import { POLLUTANTS, POLLUTANT_LABELS } from '@/utils/constants'

export const PollutantSelect = () => {
  const selectedPollutant = useAppStore((s) => s.selectedPollutant)
  const setSelectedPollutant = useAppStore((s) => s.setSelectedPollutant)

  return (
    <select
      value={selectedPollutant}
      onChange={(e) => setSelectedPollutant(e.target.value as typeof selectedPollutant)}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200"
    >
      {POLLUTANTS.map((pollutant) => (
        <option key={pollutant} value={pollutant}>
          {POLLUTANT_LABELS[pollutant] ?? pollutant}
        </option>
      ))}
    </select>
  )
}
