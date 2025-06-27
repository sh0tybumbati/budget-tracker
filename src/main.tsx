import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BudgetTracker from './Budget.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BudgetTracker />
  </StrictMode>,
)