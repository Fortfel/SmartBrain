import * as React from 'react'
import type { ThemeContextType } from '@/contexts/ThemeContext'

/**
 * React Context for theme state and operations
 * Provides access to current theme settings and theme toggle functionality
 * @remarks This context should be accessed using the useTheme hook rather than directly
 */
export const ThemeContext = React.createContext<ThemeContextType | null>(null)

/**
 * Custom hook to access theme context throughout the application
 * Provides a type-safe way to consume the ThemeContext
 * @throws Error if used outside of a ThemeProvider component
 * @returns Theme context object containing:
 *  - Current theme state (theme name, isDarkMode flag)
 *  - Theme toggle function for switching between light and dark modes
 */
export const useTheme = (): ThemeContextType => {
  const context = React.use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
