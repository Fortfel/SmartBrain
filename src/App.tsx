import * as React from 'react'
import { clsx } from 'clsx'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { Container, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { particlesOoptionsLinks } from '@/assets/particlesOptions.ts'
import { Header } from '@/componenets/Header.tsx'
import { MainContent } from '@/componenets/MainContent.tsx'
import { SignIn } from '@/componenets/SignIn/SignIn.tsx'
import { useTheme } from '@/contexts/ThemeContext.tsx'
import { useAuth } from '@/contexts/AuthContext.tsx'

// Configuration
const BRAIN_ANIMATION_DURATION = 1.8 // in seconds

const MemoizedParticles = React.memo(Particles)

const App = (): React.JSX.Element => {
  const [areParticlesLoaded, setAreParticlesLoaded] = React.useState(false)
  const { theme, isDarkMode } = useTheme()
  const { user, logout } = useAuth()

  const loginDialogRef = React.useRef<HTMLDialogElement>(null!)

  const particlesOptionsWithTheme: ISourceOptions = particlesOoptionsLinks

  React.useEffect(() => {
    initParticlesEngine(async (engine) => {
      // await loadAll(engine)
      // await loadFull(engine)
      await loadSlim(engine)
      // await loadBasic(engine)
    }).then(() => {
      setAreParticlesLoaded(true)
    })
  }, [])

  const handleParticlesLoaded = React.useCallback(
    async (container?: Container) => {
      container?.loadTheme(theme)
    },
    [theme],
  )

  const handleSignInClick = () => {
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

    // mask
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
      <div className={`relative flex min-h-dvh flex-col gap-15 overflow-x-hidden`}>
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
