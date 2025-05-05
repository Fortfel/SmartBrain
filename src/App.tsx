import * as React from 'react'
import { Header } from '@/componenets/Header.tsx'
import { MainContent } from '@/componenets/MainContent.tsx'

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  return (
    <div className={`relative h-screen overflow-x-hidden`}>
      <div className="hero-background"></div>
      <div className="absolute inset-0 -z-1 h-full w-full bg-[linear-gradient(to_right,#80808034_1px,transparent_1px),linear-gradient(to_bottom,#80808034_1px,transparent_1px)] mask-b-from-transparent mask-b-from-18 mask-b-to-black mask-b-to-100 mask-radial-[50%_80%] mask-radial-from-transparent mask-radial-from-60% mask-radial-to-black mask-radial-to-120% mask-radial-at-center bg-size-[50px_50px]"></div>
      <Header isLoggedIn={isLoggedIn} />
      <MainContent />
    </div>
  )
}

export { App }
