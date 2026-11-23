// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './app';

const rootElement = document.querySelector('#root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
