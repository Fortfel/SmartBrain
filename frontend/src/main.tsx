import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/style/index.css'
import { App } from '@/App.tsx'
import { AppProvider } from '@/contexts/'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
