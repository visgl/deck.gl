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

    scriptLoadPromises[url] = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script ${url}`));
    });
  }
  return scriptLoadPromises[url];
}

// Fired on `document` by the inline module that loadModule injects, since inline module scripts
// do not emit "load" events.
export const MODULE_LOADED_EVENT = 'deckgl-custom-library-loaded';

// Loads an ES module and exposes its namespace as window[globalName]. Assigning the namespace
// triggers the same window-property setter that classic custom libraries rely on.
export function loadModule(url, globalName) {
  const key = `module:${globalName}:${url}`;
  if (!scriptLoadPromises[key]) {
    // JSON.stringify yields a valid JS string literal for any input; escaping "<" keeps a literal
    // "</script>" from ever appearing inside the inline module source.
    const quote = value => JSON.stringify(String(value)).replace(/</g, '\\u003c');
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent =
      `import * as m from ${quote(url)}; window[${quote(globalName)}] = m; ` +
      `document.dispatchEvent(new CustomEvent(${quote(MODULE_LOADED_EVENT)}, {detail: ${quote(key)}}));`;
    scriptLoadPromises[key] = new Promise((resolve, reject) => {
      const onLoaded = event => {
        if (event.detail === key) {
          document.removeEventListener(MODULE_LOADED_EVENT, onLoaded);
          resolve();
        }
      };
      document.addEventListener(MODULE_LOADED_EVENT, onLoaded);
      script.onerror = () => {
        document.removeEventListener(MODULE_LOADED_EVENT, onLoaded);
        reject(new Error(`Failed to load module ${url}`));
      };
      document.querySelector('head').appendChild(script);
    });
  }
  return scriptLoadPromises[key];
}
