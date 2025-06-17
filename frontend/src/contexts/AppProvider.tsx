import * as React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext.tsx'
import { AuthProvider } from '@/contexts/AuthContext.tsx'

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
