import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Register Service Worker for PWA with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('SW update found, new worker installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available, show update prompt
              showUpdateNotification(registration);
            }
          });
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });

    // Listen for SW messages (like update notifications)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED') {
        console.log('SW updated to version:', event.data.version);
      }
    });
  });
}

// Show a subtle update notification
function showUpdateNotification(registration) {
  // Create update notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #8A75BA 0%, #6B5B9A 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(138, 117, 186, 0.4);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      animation: slideUp 0.3s ease-out;
    ">
      <span>🚀 New version available!</span>
      <button id="sw-update-btn" style="
        background: white;
        color: #6B5B9A;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
      ">Update</button>
      <button id="sw-dismiss-btn" style="
        background: transparent;
        color: white;
        border: none;
        padding: 4px;
        cursor: pointer;
        opacity: 0.8;
        font-size: 16px;
      ">✕</button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(notification);

  // Handle update button click
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    notification.remove();
    // Reload to get new version
    window.location.reload();
  });

  // Handle dismiss button click
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (document.getElementById('sw-update-notification')) {
      notification.remove();
    }
  }, 30000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
