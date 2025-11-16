import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './presentation/App.tsx'

// Apply dark theme by default
document.documentElement.classList.add('dark')
document.body.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
