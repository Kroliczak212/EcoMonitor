import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Skeleton } from '@/components/ui/Skeleton'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const StationDetailPage = lazy(() => import('@/pages/StationDetailPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))

export function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-16 lg:pb-0">
          <Suspense
            fallback={
              <div className="p-8 space-y-4">
                <Skeleton variant="card" />
                <Skeleton variant="chart" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/station/:id" element={<StationDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
