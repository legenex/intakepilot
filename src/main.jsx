import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/site.css'

// Suppress unhandled 404 promise rejections from the Base44 SDK axios client
// These occur in the preview sandbox where no valid app context exists yet
window.addEventListener('unhandledrejection', (event) => {
  const err = event.reason;
  if (err?.isAxiosError && err?.response?.status === 404) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)