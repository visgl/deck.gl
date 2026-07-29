import * as React from 'react';
import {createRoot} from 'react-dom/client';

import App from './app';

export function renderToDOM(container: Element | DocumentFragment | null) {
  if (!container) {
    return;
  }

  const workerUrl = new URL('./pyodide-worker.ts', import.meta.url);
  createRoot(container).render(<App workerUrl={workerUrl} />);
}
