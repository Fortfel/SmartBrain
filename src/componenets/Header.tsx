import * as React from 'react'
import Tilt from 'react-parallax-tilt'
import { Navigation } from '@/componenets/Navigation.tsx'
import Brain from '@/assets/img/Brain.tsx'

type HeaderProps = {
  isLoggedIn: boolean
}

const Header = ({ isLoggedIn }: HeaderProps): React.JSX.Element => {
  return (
    <header className="px-5 py-7">
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-5">
        <Navigation isLoggedIn={isLoggedIn} />
        <Tilt scale={1.2}>
          <Brain className="size-40 fill-primary-content drop-shadow-lg/30" />
        </Tilt>
      </div>
    </header>
  )
}

export { Header }
