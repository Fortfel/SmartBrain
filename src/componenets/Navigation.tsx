import * as React from 'react'
import Brain from '@/assets/img/Brain.tsx'

type NavigationProps = {
  isLoggedIn: boolean
}

const Navigation = ({ isLoggedIn }: NavigationProps): React.JSX.Element => {
  const loginButton = <a className="cursor-pointer text-lg font-bold">{isLoggedIn ? 'Sign Out' : 'Sign In'}</a>

  return (
    <nav className="line-b flex w-full items-center gap-3 px-2 py-5 text-primary-content line-color-primary-content/20 [&>a:hover]:text-primary-content/80">
      <div className="flex flex-1 cursor-default items-center gap-2">
        <Brain className="size-6 fill-primary-content" />
        <h2 className="text-2xl font-bold">SmartBrain</h2>
      </div>
      {loginButton}
      <span>TOGGLE</span>
    </nav>
  )
}

export { Navigation }
