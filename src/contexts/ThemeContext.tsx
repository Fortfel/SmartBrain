import * as React from 'react'

type ThemeType = 'light' | 'dark'

type ThemeContextType = {
  theme: ThemeType
  setTheme: React.Dispatch<React.SetStateAction<ThemeType>>
  toggleTheme: () => void
  isDarkMode: boolean
  isLightMode: boolean
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeType
}

const ThemeContext = React.createContext<ThemeContextType | null>(null)

const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps): React.JSX.Element => {
  const [theme, setTheme] = React.useState<ThemeType>(() => {
    // Check if the user has a saved theme preference
    const savedTheme = localStorage.getItem('theme') as ThemeType
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

export { type ThemeType, type ThemeContextType, type ThemeProviderProps, ThemeContext, useTheme, ThemeProvider }
