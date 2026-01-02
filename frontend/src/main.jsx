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

// Show a beautiful update notification (mobile-first design)
function showUpdateNotification(registration) {
  // Remove existing notification if any
  const existing = document.getElementById('sw-update-notification');
  if (existing) existing.remove();

  // Create update notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.innerHTML = `
    <style>
      @keyframes swSlideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes swPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      #sw-update-card {
        position: fixed;
        bottom: 100px;
        left: 16px;
        right: 16px;
        max-width: 360px;
        margin: 0 auto;
        background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(138, 117, 186, 0.3);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(138, 117, 186, 0.2);
        z-index: 99999;
        animation: swSlideUp 0.4s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #sw-update-card .update-icon {
        font-size: 32px;
        margin-bottom: 12px;
        display: block;
        text-align: center;
      }
      #sw-update-card .update-title {
        color: #ffffff;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 8px;
      }
      #sw-update-card .update-desc {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        text-align: center;
        margin-bottom: 20px;
        line-height: 1.4;
      }
      #sw-update-card .update-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      #sw-update-card .btn-update {
        background: linear-gradient(135deg, #8A75BA 0%, #6B5B9A 100%);
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        max-width: 160px;
      }
      #sw-update-card .btn-update:active {
        transform: scale(0.95);
      }
      #sw-update-card .btn-later {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 500;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        max-width: 160px;
      }
      #sw-update-card .btn-later:active {
        transform: scale(0.95);
      }
    </style>
    <div id="sw-update-card">
      <span class="update-icon">🚀</span>
      <div class="update-title">New Version Available!</div>
      <div class="update-desc">A new version of StudyWise is ready. Update now for the best experience.</div>
      <div class="update-buttons">
        <button class="btn-update" id="sw-update-btn">Update Now</button>
        <button class="btn-later" id="sw-dismiss-btn">Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Handle update button click
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    notification.remove();
    window.location.reload();
  });

  // Handle dismiss button click
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-dismiss after 60 seconds
  setTimeout(() => {
    if (document.getElementById('sw-update-notification')) {
      notification.remove();
    }
  }, 60000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
