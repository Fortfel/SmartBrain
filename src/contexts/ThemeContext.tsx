import * as React from 'react'
import { ThemeContext } from '@/contexts/use-theme.ts'

export type ThemeType = 'light' | 'dark'

export type ThemeContextType = {
  theme: ThemeType
  setTheme: React.Dispatch<React.SetStateAction<ThemeType>>
  toggleTheme: () => void
  isDarkMode: boolean
  isLightMode: boolean
}

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeType
}

const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps): React.JSX.Element => {
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

  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
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
