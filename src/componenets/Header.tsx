import * as React from 'react'
import Tilt from 'react-parallax-tilt'
import { Navigation } from '@/componenets/Navigation.tsx'
import Brain from '@/assets/img/Brain.tsx'

type HeaderProps = {
  isLoggedIn: boolean
}

const Header = ({ isLoggedIn }: HeaderProps): React.JSX.Element => {
  return (
    <header className="px-5 [--brain-animation-duration:1.8s]">
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <Navigation isLoggedIn={isLoggedIn} />
        <Tilt scale={1.2}>
          <div className="relative">
            <Brain className="size-40 fill-primary-content drop-shadow-lg/30" />
            <div className="absolute inset-0 animate-visible-33-(--brain-animation-duration)">
              <div className="h-full w-full animate-shiny mask-radial-[70%_80%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center animate-shiny-color-white/20 animate-shiny-duration-(--brain-animation-duration)"></div>
            </div>
          </div>
        </Tilt>
      </div>
    </header>
  )
}

export { Header }
