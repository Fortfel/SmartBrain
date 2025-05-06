import * as React from 'react'
import { ImageLinkForm } from '@/componenets/ImageLinkForm.tsx'

const MainContent = (): React.JSX.Element => {
  return (
    <main className="min-h-[600px] px-5 font-courier">
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <p className={'text-center text-lg font-semibold'}>
          Fortel, your current rank is...
          <br />
          #5
        </p>
        <ImageLinkForm />
      </div>
    </main>
  )
}

export { MainContent }
