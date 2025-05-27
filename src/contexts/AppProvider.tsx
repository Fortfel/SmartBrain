import * as React from 'react'
import { ThemeProvider } from './ThemeContext.tsx'
import { AuthProvider } from './AuthContext.tsx'

type AppProviderProps = {
  children: React.ReactNode
}

const AppProvider = ({ children }: AppProviderProps): React.JSX.Element => {
  return (
    <ThemeProvider defaultTheme={'dark'}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

export { AppProvider }
