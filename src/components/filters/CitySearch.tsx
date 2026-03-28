import { useRef, useState } from 'react'
import { useStations } from '@/hooks/useStations'
import { useDebounce } from '@/hooks/useDebounce'
import type { Station } from '@/types/gios'

interface CitySearchProps {
  onSelectStation?: (station: Station) => void
}

export const CitySearch = ({ onSelectStation }: CitySearchProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = 'city-search-listbox'
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)
  const { data: stations = [] } = useStations()

  const filtered =
    debouncedQuery.length >= 2
      ? stations
          .filter((s) =>
            s.city.name.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 8)
      : []

  const showDropdown = isOpen && debouncedQuery.length >= 2 && filtered.length > 0

  const handleSelect = (station: Station) => {
    onSelectStation?.(station)
    setQuery(station.city.name)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none text-sm">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
          placeholder="Szukaj miasta..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1) }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
        />
      </div>

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Wyniki wyszukiwania"
          className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-50 max-h-64 overflow-y-auto"
        >
          {filtered.map((station, index) => (
            <li
              key={station.id}
              id={`city-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={() => handleSelect(station)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full px-4 py-3 cursor-pointer flex items-center gap-2 text-left transition-colors ${
                index === activeIndex
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-gray-400 text-sm">📍</span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                  {station.city.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {station.stationName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
