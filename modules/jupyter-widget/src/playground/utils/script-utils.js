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
      script.onerror = () => {
        // Forget the failed load so a later call can retry
        delete scriptLoadPromises[url];
        reject(new Error(`Failed to load script ${url}`));
      };
    });
  }
  return scriptLoadPromises[url];
}

// Fired on `document` by the inline module that loadModule injects, since inline module scripts
// do not emit "load" events. `detail` is `{key, error}`; `error` is set when the import or the
// module's top-level evaluation threw.
export const MODULE_LOADED_EVENT = 'deckgl-custom-library-loaded';

// Loads an ES module and exposes its namespace as window[globalName]. Assigning the namespace
// triggers the same window-property setter that classic custom libraries rely on.
export function loadModule(url, globalName) {
  const key = `module:${globalName}:${url}`;
  if (!scriptLoadPromises[key]) {
    // JSON.stringify yields a valid JS string literal for any input; escaping "<" keeps a literal
    // "</script>" from ever appearing inside the inline module source.
    const quote = value => JSON.stringify(String(value)).replace(/</g, '\\u003c');
    const dispatch = error =>
      `document.dispatchEvent(new CustomEvent(${quote(MODULE_LOADED_EVENT)}, ` +
      `{detail: {key: ${quote(key)}, error: ${error}}}))`;
    const script = document.createElement('script');
    script.type = 'module';
    // A dynamic import inside try/catch reports fetch, parse and top-level evaluation failures alike
    script.textContent =
      `try { const m = await import(${quote(url)}); window[${quote(globalName)}] = m; ${dispatch('null')}; } ` +
      `catch (error) { ${dispatch('String((error && error.message) || error)')}; }`;
    scriptLoadPromises[key] = new Promise((resolve, reject) => {
      const fail = message => {
        document.removeEventListener(MODULE_LOADED_EVENT, onLoaded);
        // Forget the failed load so a later call can retry
        delete scriptLoadPromises[key];
        reject(new Error(`Failed to load module ${url}: ${message}`));
      };
      const onLoaded = event => {
        if (event.detail && event.detail.key === key) {
          document.removeEventListener(MODULE_LOADED_EVENT, onLoaded);
          if (event.detail.error) {
            fail(event.detail.error);
          } else {
            resolve();
          }
        }
      };
      document.addEventListener(MODULE_LOADED_EVENT, onLoaded);
      script.onerror = () => fail('script error');
      document.querySelector('head').appendChild(script);
    });
  }
  return scriptLoadPromises[key];
}
