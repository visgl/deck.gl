/* global document */

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
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  const head = document.querySelector('head');
  head.appendChild(script);
  return new Promise(resolve => {
    script.onload = resolve;
  });
}

export {loadScript, alreadyLoaded};
