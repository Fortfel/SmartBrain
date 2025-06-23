import * as React from 'react'
import { clsx } from 'clsx'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { Container, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { particlesOoptionsLinks } from '@/assets/particlesOptions.ts'
import { Header } from '@/components/Header.tsx'
import { MainContent } from '@/components/MainContent.tsx'
import { SignIn } from '@/components/SignIn/SignIn.tsx'
import { useTheme, useAuth } from '@/contexts'

/**
 * Configuration constants for the application
 */
const BRAIN_ANIMATION_DURATION = 1.8 // in seconds

/**
 * Memoized Particles component to prevent unnecessary re-renders
 */
const MemoizedParticles = React.memo(Particles)

/**
 * Main application component that orchestrates the entire UI
 * Handles particle animations, theme management, and authentication
 * @returns React component representing the entire application
 */
const App = (): React.JSX.Element => {
  const [areParticlesLoaded, setAreParticlesLoaded] = React.useState(false)
  const { theme, isDarkMode } = useTheme()
  const { user, logout } = useAuth()

  const loginDialogRef = React.useRef<HTMLDialogElement>(null)

  const particlesOptionsWithTheme: ISourceOptions = particlesOoptionsLinks

  /**
   * Initializes the particles engine on component mount
   * Loads the slim version of particles for better performance
   */
  React.useEffect(() => {
    /**
     * Asynchronously initializes the particles engine
     * @returns Promise resolving when particles are initialized
     */
    const initializeParticles = async (): Promise<void> => {
      try {
        await initParticlesEngine(async (engine) => {
          // await loadAll(engine)
          // await loadFull(engine)
          await loadSlim(engine)
          // await loadBasic(engine)
        })
        setAreParticlesLoaded(true)
      } catch (error) {
        console.error('Failed to initialize particles engine:', error)
      }
    }

    void initializeParticles()
  }, [])

  /**
   * Callback executed when particles are loaded
   * Applies the current theme to the particles container
   * @param container - The particles container instance
   * @returns Promise resolving when theme is applied
   */
  const handleParticlesLoaded = React.useCallback(
    async (container?: Container): Promise<void> => {
      await container?.loadTheme(theme)
    },
    [theme],
  )

  /**
   * Handles sign in button clicks
   * Logs out if user is already signed in, otherwise shows login dialog
   */
  const handleSignInClick = (): void => {
    if (user) {
      logout()
    } else {
      loginDialogRef.current?.showModal()
    }
  }

  const heroBackgroundGrid = clsx('absolute inset-0 -z-10 bg-size-[50px_50px]', {
    'bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)]':
      isDarkMode,
    'bg-[linear-gradient(to_right,#8080801F_1px,transparent_1px),linear-gradient(to_bottom,#8080801F_1px,transparent_1px)]':
      !isDarkMode,
    'mask-t-to-[calc(100%-200px)]': true,
  })

  return (
    <>
      {areParticlesLoaded && (
        <MemoizedParticles
          id="tsparticles-links"
          particlesLoaded={handleParticlesLoaded}
          options={particlesOptionsWithTheme}
        />
      )}
      <div className="relative flex min-h-dvh flex-col gap-15 overflow-x-hidden">
        <div className={heroBackgroundGrid}></div>
        <div className="hero-background"></div>
        <Header brainAnimationDuration={BRAIN_ANIMATION_DURATION} onSignInClick={handleSignInClick} />
        <MainContent />
        <SignIn ref={loginDialogRef} />
      </div>
    </>
  )
}

export { App }
