import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/site.css'

// Suppress unhandled 404 promise rejections from the Base44 SDK axios client.
// The SDK's axios interceptor strips structured properties from errors before
// they bubble up, so we have to match on multiple signals (message string,
// status code, response shape, even partial matches).
window.addEventListener('unhandledrejection', (event) => {
  const err = event.reason;
  if (!err) return;

  // Match by message string (most reliable across SDK transformations)
  const msg = err?.message || err?.toString?.() || '';
  const isStatus404 =
    msg.includes('404') ||
    msg.includes('status code 404') ||
    msg.includes('Request failed with status code 404');

  // Match by structured properties (when they survive)
  const isAxios404 = err?.isAxiosError && err?.response?.status === 404;
  const isResponse404 = err?.response?.status === 404 || err?.status === 404;

  // Match by URL path heuristics (entity get/filter calls)
  const url = err?.config?.url || err?.request?.responseURL || '';
  const isEntityCall = url.includes('/entities/') || url.includes('/api/');

  if (isStatus404 || isAxios404 || isResponse404 || (isEntityCall && msg.includes('404'))) {
    event.preventDefault();
    console.warn('[suppressed 404]', url || msg);
    return;
  }

  // Also suppress generic "Network Error" for offline/preview-sandbox cases
  if (msg === 'Network Error' || msg.includes('Network Error')) {
    event.preventDefault();
    console.warn('[suppressed network error]', msg);
  }
});

// Same handler for legacy .error events (some axios versions emit these instead)
window.addEventListener('error', (event) => {
  const msg = event?.message || event?.error?.message || '';
  if (msg.includes('Request failed with status code 404')) {
    event.preventDefault();
    console.warn('[suppressed error event 404]', msg);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)