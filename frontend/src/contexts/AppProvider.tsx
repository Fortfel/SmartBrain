import * as React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext.tsx'
import { AuthProvider } from '@/contexts/AuthContext.tsx'

/**
 * Props for the AppProvider component
 * @param children - React nodes to be wrapped by the provider
 */
export type AppProviderProps = {
  children: React.ReactNode
}

/**
 * Root provider component that combines all application contexts
 * Establishes the provider hierarchy with ThemeProvider as the outermost wrapper
 * followed by AuthProvider to ensure theme is available to authentication UI
 * @returns React component with nested context providers
 */
const AppProvider = ({ children }: AppProviderProps): React.JSX.Element => {
  return (
    <ThemeProvider defaultTheme={'dark'}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

export { AppProvider }
