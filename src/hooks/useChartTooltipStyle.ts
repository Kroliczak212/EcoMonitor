import { useAppStore } from '@/store/useAppStore'

/**
 * Returns a Recharts-compatible contentStyle object for <Tooltip> that
 * respects the current light/dark theme. Recharts does not accept className
 * on its tooltip container, so this is the only way to support dark mode.
 */
export function useChartTooltipStyle(): React.CSSProperties {
  const theme = useAppStore((s) => s.theme)
  return theme === 'dark'
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px', color: '#f3f4f6' }
    : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }
}
