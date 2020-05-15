/* global document */
const ERROR_BOX_CLASSNAME = 'error-box';

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

// TODO - add message?
export function createErrorBox() {
  const errorBox = document.createElement('div');
  errorBox.className = ERROR_BOX_CLASSNAME;
  Object.assign(errorBox.style, {
    width: '100%',
    height: '20px',
    position: 'absolute',
    zIndex: '1000',
    backgroundColor: 'lemonchiffon',
    cursor: 'pointer'
  });
  errorBox.onclick = e => {
    errorBox.style.display = 'none';
  };
  return errorBox;
}

export function getErrorBox() {}
