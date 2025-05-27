import * as React from 'react'

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  return <>{children}</>
}

export { AuthProvider }
