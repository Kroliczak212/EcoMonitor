interface EmptyStateProps {
  title: string
  description?: string
  icon?: string
}

export const EmptyState = ({ title, description, icon }: EmptyStateProps) => {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      {icon && (
        <span className="text-5xl" role="img" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</p>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">{description}</p>
      )}
    </div>
  )
}
