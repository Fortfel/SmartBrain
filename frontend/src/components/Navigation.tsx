import * as React from 'react'
import Brain from '@/assets/img/Brain.tsx'
import { ThemeController } from '@/components/ThemeController.tsx'
import { useAuth } from '@/contexts'

/**
 * Props for the Navigation component
 * @param onSignInClick - Callback function triggered when sign in/out button is clicked
 */
export type NavigationProps = {
  onSignInClick: () => void
}

/**
 * Navigation component that displays the app header with logo, sign in/out button, and theme controller
 * Adapts its display based on authentication state
 * @returns React component representing the navigation bar
 */
const Navigation = ({ onSignInClick }: NavigationProps): React.JSX.Element => {
  const { user } = useAuth()

  return (
    <nav className="line-b flex w-full items-center gap-[clamp(0.5rem,2.5vw,1.5rem)] px-[clamp(0.5rem,2.5vw,1.5rem)] py-5 text-base-content [&_a:hover]:text-current/70">
      <div className="flex flex-1 cursor-default items-center gap-2">
        <Brain className="size-6 fill-current" />
        <h2 className="text-2xl font-bold">SmartBrain</h2>
      </div>
      <a className="cursor-pointer text-lg font-bold" onClick={onSignInClick}>
        {user ? 'Sign Out' : 'Sign In'}
      </a>
      <ThemeController />
    </nav>
  )
}

export { Navigation }
