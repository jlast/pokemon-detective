import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.VITE_CODEX_PREVIEW === 'true' && (
      <div className="codex-preview-notice" role="region" aria-label="Preview controls">
        <span><strong>Codex preview</strong> · Sample cases · Progress saved in this browser</span>
        <button type="button" onClick={() => {
          localStorage.removeItem('pokemystery:codex-preview:v1')
          localStorage.removeItem('pokemystery:completed-case-ids')
          localStorage.removeItem('pokemystery:solved-case-ids')
          window.location.assign('/')
        }}>Reset preview</button>
      </div>
    )}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
