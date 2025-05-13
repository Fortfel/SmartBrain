import * as React from 'react'
import Brain from '@/assets/img/Brain.tsx'
import { ThemeController, type ThemeControllerProps } from '@/componenets/ThemeController.tsx'

export type NavigationProps = {
  isLoggedIn: boolean
} & ThemeControllerProps

const Navigation = ({ isLoggedIn, ...themeControllerProps }: NavigationProps): React.JSX.Element => {
  const loginButton = <a className="cursor-pointer text-lg font-bold">{isLoggedIn ? 'Sign Out' : 'Sign In'}</a>

  return (
    <nav className="line-b flex w-full items-center gap-[clamp(0.5rem,2.5vw,1.5rem)] px-[clamp(0.5rem,2.5vw,1.5rem)] py-5 text-base-content [&_a:hover]:text-current/70">
      <div className="flex flex-1 cursor-default items-center gap-2">
        <Brain className="size-6 fill-current" />
        <h2 className="text-2xl font-bold">SmartBrain</h2>
      </div>
      {loginButton}
      <ThemeController {...themeControllerProps} />
    </nav>
  )
}

export { Navigation }
