/* global document */

const scriptLoadPromises = {};

function alreadyLoaded(url) {
  // Save time by not reloading the same URL
  for (const scriptTag of document.querySelectorAll('script')) {
    if (scriptTag.src === url) {
      return true;
    }
  }
  return false;
}

function loadScript(url) {
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

export {loadScript, alreadyLoaded};
