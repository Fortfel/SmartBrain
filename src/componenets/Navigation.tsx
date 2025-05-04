import * as React from 'react'

type NavigationProps = {
  isLoggedIn: boolean
}

const Navigation = ({ isLoggedIn }: NavigationProps): React.JSX.Element => {
  const loginButton = <a className="cursor-pointer text-lg font-bold">{isLoggedIn ? 'Sign Out' : 'Sign In'}</a>

  return (
    <nav className="flex w-full items-center justify-end gap-3 text-primary-content [&>a:hover]:text-primary-content/80">
      <h2 className="flex-1 text-2xl font-bold">SmartBrain</h2>
      {loginButton}
      <span>TOGGLE</span>
    </nav>
  )
}

export { Navigation }
