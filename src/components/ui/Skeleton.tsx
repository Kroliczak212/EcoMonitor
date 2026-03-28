import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'chart' | 'circle'
}

export const Skeleton = ({ className, variant = 'text' }: SkeletonProps) => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded'

  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-xl',
    chart: 'h-64 w-full rounded-xl',
    circle: 'h-10 w-10 rounded-full',
  }

  return <div className={clsx(base, variants[variant], className)} />
}
