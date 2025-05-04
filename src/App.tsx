import * as React from 'react'

import { Header } from '@/componenets/Header.tsx'
import { MainContent } from '@/componenets/MainContent.tsx'

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  return (
    <div
      className={`h-screen 
      bg-linear-to-r from-[#ff6be0] to-[#06aedc]
      `}
    >
      <Header isLoggedIn={isLoggedIn} />
      <MainContent />
    </div>
  )
}

export { App }
