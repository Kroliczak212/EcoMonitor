import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CitySearch } from '@/components/filters/CitySearch'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold text-green-600 dark:text-green-400 shrink-0"
          >
            🌿 EcoMonitor
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <CitySearch />
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
