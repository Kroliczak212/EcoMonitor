interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
  message?: string
}

export const ErrorFallback = ({ error, onRetry, message }: ErrorFallbackProps) => {
  const displayMessage = message ?? error?.message ?? 'Wystąpił nieoczekiwany błąd.'

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
      <span className="text-4xl mb-3" role="img" aria-label="Błąd">
        ⚠️
      </span>
      <p className="text-red-500 font-semibold text-base mb-1">Coś poszło nie tak</p>
      <p className="text-red-400 text-sm mb-4">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Spróbuj ponownie
        </button>
      )}
    </div>
  )
}
