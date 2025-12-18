import { createRoot } from 'react-dom/client';

import './index.css';
import '@saebyn/glowing-telegram-video-editor/styles.css';

import App from '@/App.tsx';

const { VITE_MOCKS_ENABLED: MOCKS_ENABLED } = import.meta.env;

const container = document.getElementById('root');

if (!container) {
  throw new Error('No container found');
}

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (!MOCKS_ENABLED) {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  await worker.start();
}

const root = createRoot(container);

enableMocking().then(() => {
  root.render(<App />);
});
