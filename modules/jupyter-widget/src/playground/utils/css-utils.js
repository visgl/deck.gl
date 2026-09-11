// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
export function loadCSS(url) {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  if (links.some(existing => existing.getAttribute('href') === url)) {
    // Already loaded, e.g. by another view of the same widget
    return;
  }
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
