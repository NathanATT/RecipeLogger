import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorProvider } from './context/ErrorProvider'; 
import './index.css'
import './App.css'
import './styles/forms.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorProvider> 
      <App />
    </ErrorProvider>
  </React.StrictMode>,
)