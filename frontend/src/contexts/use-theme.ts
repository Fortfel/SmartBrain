import * as React from 'react'
import type { ThemeContextType } from '@/contexts/ThemeContext'

export const ThemeContext = React.createContext<ThemeContextType | null>(null)

export const useTheme = (): ThemeContextType => {
  const context = React.use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
