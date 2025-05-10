import * as React from 'react'
import { clsx } from 'clsx'
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

  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  function handleThemeChange() {
    setIsDarkMode(!isDarkMode)
  }

  //todo clsx for hero-bacground-grid
  const heroBackgroundGrid = clsx('absolute inset-0 -z-10 bg-size-[50px_50px]', {
    'bg-[linear-gradient(to_right,#80808034_1px,transparent_1px),linear-gradient(to_bottom,#80808034_1px,transparent_1px)]':
      isDarkMode,
    // 'bg-[linear-gradient(to_right,#80808034_1px,transparent_1px),linear-gradient(to_bottom,#80808034_1px,transparent_1px)]': !isDarkMode,

    // 'mask-radial-[70%_70%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center': true,
    // mask
    '': true,
  })

  return (
    <>
      <div className={heroBackgroundGrid}></div>
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
