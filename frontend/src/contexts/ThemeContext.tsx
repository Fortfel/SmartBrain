import * as React from 'react'
import { ThemeContext } from '@/contexts/use-theme.ts'

/**
 * Available theme options for the application
 * @readonly
 */
export type ThemeType = 'light' | 'dark'

/**
 * Context type definition for theme management
 * @param theme - Current active theme ('light' or 'dark')
 * @param setTheme - State setter function for updating the theme
 * @param toggleTheme - Function to toggle between light and dark themes
 * @param isDarkMode - Boolean indicating if dark mode is active
 * @param isLightMode - Boolean indicating if light mode is active
 */
export type ThemeContextType = {
  theme: ThemeType
  setTheme: React.Dispatch<React.SetStateAction<ThemeType>>
  toggleTheme: () => void
  isDarkMode: boolean
  isLightMode: boolean
}

/**
 * Props for the ThemeProvider component
 * @param children - React nodes to be wrapped by the provider
 * @param defaultTheme - Optional default theme to use if no preference is found
 */
export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeType
}

/**
 * Provider component that makes theme context available to all child components
 * Manages theme state and persistence in localStorage
 * Syncs theme with HTML document attributes for styling
 * @returns React component that provides theme context to its children
 */
const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps): React.JSX.Element => {
  /**
   * Theme state with initialization logic that prioritizes:
   * 1. User's saved preference in localStorage
   * 2. System color scheme preference
   * 3. Default theme provided as prop
   */
  const [theme, setTheme] = React.useState<ThemeType>(() => {
    // Check if the user has a saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme
    } else {
      // If not, use the system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultTheme
    }
  })

  const isDarkMode = theme === 'dark'
  const isLightMode = theme === 'light'

  /**
   * Effect to persist theme changes to localStorage and update document attributes
   * Runs whenever the theme state changes
   */
  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  /**
   * Toggles between light and dark themes
   * Memoized to prevent unnecessary re-renders
   */
  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  /**
   * Memoized context value to prevent unnecessary re-renders of consuming components
   * Only updates when theme or derived values change
   */
  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDarkMode,
      isLightMode,
    }),
    [theme, toggleTheme, isDarkMode, isLightMode],
  )

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}

export { ThemeProvider }
