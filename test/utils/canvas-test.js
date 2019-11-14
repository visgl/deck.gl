/* global window */

/** Create a clean document object for testing */
function createDocument() {
  // Creates a global document object via JSDOM or a shallow clone of the browser's document
  let documentClone;
  if (typeof window === undefined || !window.document) {
    const {JSDOM} = require('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html>`);
    documentClone = dom.window.document.cloneNode(false);
  } else {
    documentClone = window.document.cloneNode(false);
  }
  const html = window.document.createElement('html');
  const body = window.document.createElement('body');
  html.appendChild(body);
  documentClone.appendChild(html);
  documentClone.body = body;
  return documentClone;
}

/* Create a clean canvas, its parent, and a document node for testing */
export default function setup() {
  // Creates a canvas which can be passed to canvasCallback
  // to add a node to
  const localDocument = createDocument();
  const canvas = localDocument.createElement('canvas');

  const canvasParent = localDocument.createElement('div');
  canvasParent.className = 'canvas-parent';
  canvasParent.appendChild(canvas);
  localDocument.body.appendChild(canvasParent);
  return {
    testDocument: localDocument,
    canvasContainer: canvasParent,
    canvas
  };
}
