import * as React from 'react'
import Tilt from 'react-parallax-tilt'
import Brain from '@/assets/img/Brain.tsx'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { Container, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { loadPolygonMaskPlugin } from '@tsparticles/plugin-polygon-mask'
import { particlesOptions } from '@/assets/particlesOptions.ts'
import { Navigation, type NavigationProps } from '@/componenets/Navigation.tsx'

type HeaderProps = {
  brainAnimationDuration: number
  isDarkMode: boolean
} & NavigationProps

const Header = ({ brainAnimationDuration, isDarkMode, ...navigationProps }: HeaderProps): React.JSX.Element => {
  const [areParticlesLoaded, setAreParticlesLoaded] = React.useState(false)

  const particlesOptionsWithTheme: ISourceOptions = React.useMemo(() => {
    return particlesOptions
  }, [isDarkMode])

  React.useEffect(() => {
    initParticlesEngine(async (engine) => {
      // You can initiate the tsParticles instance (engine) here, adding custom shapes or presets

      // We could either run loadAll(engine) only or separately loadSlim(engine) and loadPolygonMaskPlugin(engine)
      // Second option has smaller file size

      // await loadAll(engine)
      // await loadFull(engine)
      await loadSlim(engine)
      // await loadBasic(engine)
      await loadPolygonMaskPlugin(engine)
    }).then(() => {
      setAreParticlesLoaded(true)
    })
  }, [])

  const handleParticlesLoaded = async (container?: Container) => {
    // console.log('Particles container loaded:', container)
    container?.loadTheme(isDarkMode ? 'dark' : 'light')
  }

  return (
    <header
      className="text-base-content line-color-base-content/20"
      // @ts-expect-error TS2353: Object literal may only specify known properties
      style={{ '--brain-animation-duration': `${brainAnimationDuration}s` }}
    >
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <Navigation isDarkMode={isDarkMode} {...navigationProps} />
        <Tilt scale={1.2}>
          <div className="relative">
            <Brain className="size-40 fill-current drop-shadow-lg/30" />

            {/* Flickering effect */}
            <div className="absolute inset-0 animate-visible-33-(--brain-animation-duration)">
              <div className="h-full w-full animate-shiny mask-radial-[70%_80%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center animate-shiny-color-white/30 animate-shiny-duration-(--brain-animation-duration) dark:animate-shiny-color-white/20"></div>
            </div>
          </div>
        </Tilt>
        <Tilt scale={1.2}>
          {areParticlesLoaded && (
            <div className={''}>
              <Particles
                id="tsparticles"
                className={'h-42 w-40'}
                particlesLoaded={handleParticlesLoaded}
                options={particlesOptionsWithTheme}
              />
              {/* Flickering effect */}
              <div className="absolute inset-0 animate-visible-33-(--brain-animation-duration)">
                <div className="h-full w-full animate-shiny mask-radial-[70%_80%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center animate-shiny-color-white/30 animate-shiny-duration-(--brain-animation-duration) dark:animate-shiny-color-white/20"></div>
              </div>
            </div>
          )}
        </Tilt>
      </div>
    </header>
  )
}

export { Header }
