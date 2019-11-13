/* global window */

/** Provides a clean document object for testing */
function createDocument() {
  // Creates a global document object via JSDOM or a shallow clone of the browser's document
  if (typeof window === undefined || !window.document) {
    const {JSDOM} = require('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html>`);
    return dom.window.document;
  }
  const documentClone = window.document.cloneNode(false);
  return documentClone;
}

/** Provides a setup for testing */
export function setup() {
  // Creates a canvas which can be passed to canvasCallback
  // to add a node to
  const localDocument = createDocument();
  const canvas = localDocument.createElement('canvas');

  const canvasParent = localDocument.createElement('div');
  canvasParent.className = 'canvas-parent';
  canvasParent.appendChild(canvas);
  localDocument.body.appendChild(canvasParent);
  return canvasParent;
}
