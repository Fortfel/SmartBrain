import * as React from 'react'
import { clsx } from 'clsx'
import Tilt from 'react-parallax-tilt'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { Container, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { loadPolygonMaskPlugin } from '@tsparticles/plugin-polygon-mask'
import { particlesOptionsPolygon } from '@/assets/particlesOptions.ts'
import { Navigation, type NavigationProps } from '@/componenets/Navigation.tsx'
import { useTheme } from '@/contexts/ThemeContext.tsx'

type HeaderProps = {
  brainAnimationDuration: number
} & NavigationProps

const MemoizedParticles = React.memo(Particles)

const Header = ({ brainAnimationDuration, ...navigationProps }: HeaderProps): React.JSX.Element => {
  const [areParticlesLoaded, setAreParticlesLoaded] = React.useState(false)
  const { theme } = useTheme()

  const particlesOptionsWithTheme: ISourceOptions = particlesOptionsPolygon

  React.useEffect(() => {
    initParticlesEngine(async (engine) => {
      // We could either run loadAll(engine) only or separately loadSlim(engine) and loadPolygonMaskPlugin(engine)
      // Second option has smaller file size

      await loadSlim(engine)
      await loadPolygonMaskPlugin(engine)
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

  const shinyEffect = clsx('absolute inset-0', {
    // animation
    'animate-shiny animate-shiny-duration-(--brain-animation-duration)': true,
    // mask
    'mask-radial-[70%_70%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center': true,
    // light/dark
    'animate-shiny-color-white/15 dark:animate-shiny-color-white/20': true,
  })

  return (
    <header
      className="text-base-content line-color-base-content/20"
      // @ts-expect-error TS2353: Object literal may only specify known properties
      style={{ '--brain-animation-duration': `${brainAnimationDuration}s` }}
    >
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <Navigation {...navigationProps} />
        <Tilt scale={1.2}>
          {areParticlesLoaded && (
            <div className={'relative'}>
              <MemoizedParticles
                id="tsparticles-polygon"
                className={'h-42 w-40'}
                particlesLoaded={handleParticlesLoaded}
                options={particlesOptionsWithTheme}
              />
              {/* Flickering effect */}
              <div className="absolute inset-0 animate-visible-33-(--brain-animation-duration)">
                <div className={shinyEffect}></div>
              </div>
            </div>
          )}
        </Tilt>
      </div>
    </header>
  )
}

export { Header }
