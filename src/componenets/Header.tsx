import * as React from 'react'
import Tilt from 'react-parallax-tilt'
import { Navigation, type NavigationProps } from '@/componenets/Navigation.tsx'
import Brain from '@/assets/img/Brain.tsx'

type HeaderProps = {
  brainAnimationDuration: number
} & NavigationProps

const Header = ({ brainAnimationDuration, ...navigationProps }: HeaderProps): React.JSX.Element => {
  return (
    <header
      className="text-base-content line-color-base-content/20"
      // @ts-expect-error TS2353: Object literal may only specify known properties
      style={{ '--brain-animation-duration': `${brainAnimationDuration}s` }}
    >
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <Navigation {...navigationProps} />
        <Tilt scale={1.2}>
          <div className="relative">
            <Brain className="size-40 fill-base-content drop-shadow-lg/30" />
            <div className="absolute inset-0 animate-visible-33-(--brain-animation-duration)">
              <div className="h-full w-full animate-shiny mask-radial-[70%_80%] mask-radial-from-40% mask-radial-to-70% mask-radial-at-center animate-shiny-color-white/30 animate-shiny-duration-(--brain-animation-duration) dark:animate-shiny-color-white/20"></div>
            </div>
          </div>
        </Tilt>
      </div>
    </header>
  )
}

export { Header }
