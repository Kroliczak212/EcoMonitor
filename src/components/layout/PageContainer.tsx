import { clsx } from 'clsx'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <main className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', className)}>
      {children}
    </main>
  )
}
