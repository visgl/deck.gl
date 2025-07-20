// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */

// Ensure we only load a script once
const scriptLoadPromises = {};

export function loadScript(url) {
  if (!scriptLoadPromises[url]) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    const head = document.querySelector('head');
    head.appendChild(script);

    scriptLoadPromises[url] = new Promise(resolve => {
      script.onload = resolve;
    });
  }
  return scriptLoadPromises[url];
}
