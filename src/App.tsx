import * as React from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { type Container, type ISourceOptions } from '@tsparticles/engine'
import { loadPolygonMaskPlugin } from '@tsparticles/plugin-polygon-mask'
// import { loadAll } from '@tsparticles/all' // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from 'tsparticles' // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from '@tsparticles/slim' // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from '@tsparticles/basic' // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.
import { particlesOptions, options, logo1, logo2 } from '@/assets/particlesOptions.ts'

import { Header } from '@/componenets/Header.tsx'
import { MainContent } from '@/componenets/MainContent.tsx'

// Configuration
const BRAIN_ANIMATION_DURATION = 1.8 // in seconds

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  })
  const [areParticlesLoaded, setAreParticlesLoaded] = React.useState(false)

  const particlesOptionsWithTheme: ISourceOptions = React.useMemo(() => {
    return {
      ...logo1,
    }
  }, [isDarkMode])

  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
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

  const particlesLoaded = async (container?: Container) => {
    console.log('Particles container loaded:', container)
  }

  function handleThemeChange() {
    setIsDarkMode(!isDarkMode)
  }

  //todo clsx for hero-bacground-grid

  return (
    <>
      {areParticlesLoaded && (
        <>
          <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={particlesOptionsWithTheme} />
        </>
      )}
      {/*<div className="absolute inset-0 -z-30 h-full w-full bg-[linear-gradient(to_right,#80808034_1px,transparent_1px),linear-gradient(to_bottom,#80808034_1px,transparent_1px)]  bg-size-[50px_50px]"></div>*/}
      <div className={`relative flex flex-col gap-15 overflow-x-hidden`}>
        <div className="hero-background"></div>

        <Header
          isLoggedIn={isLoggedIn}
          brainAnimationDuration={BRAIN_ANIMATION_DURATION}
          isDarkMode={isDarkMode}
          onThemeChange={handleThemeChange}
        />
        <MainContent />
      </div>
    </>
  )
}

export { App }
