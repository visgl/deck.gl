/* global document */
// TODO - make sure this can be called multiple times without adding elements
export function loadCSS(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

export function createContainer(width, height) {
  const container = document.createElement('div');
  container.style.width = Number.isFinite(width) ? `${width}px` : width;
  container.style.height = `${height}px`;
  container.style.position = 'relative';
  return container;
}
