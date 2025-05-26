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

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps): React.JSX.Element => {
  const [theme, setTheme] = React.useState<ThemeType>(() => {
    return localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : defaultTheme
  })

  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  const isDarkMode = theme === 'dark'
  const isLightMode = theme === 'light'

  return <ThemeContext value={{ theme, setTheme, toggleTheme, isDarkMode, isLightMode }}>{children}</ThemeContext>
}

export { type ThemeType, type ThemeContextType, type ThemeProviderProps, ThemeContext, useTheme, ThemeProvider }
