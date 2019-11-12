/* global window */

export default class DocumentTest {
  // Simplify the testing of deck.gl work that requires a document and canvas
  constructor(canvasCallback) {
    this.document = this._createDocument();
    this.canvasParent = null;
    this.testObject = null;
    this._setup(canvasCallback);
  }

  _createDocument() {
    // Creates a global document object via JSDOM or a deep clone of the browser one if available
    if (typeof window === undefined || !window.document) {
      const {JSDOM} = require('jsdom');
      const dom = new JSDOM(`<!DOCTYPE html>`);
      return dom.window.document;
    }
    const documentClone = window.document.cloneNode(true);
    return documentClone;
  }

  _setup(canvasCallback) {
    // Creates a canvas which can be passed to canvasCallback
    // to add a node to
    const canvas = this.document.createElement('canvas');

    const canvasParent = this.document.createElement('div');
    canvasParent.className = 'canvas-parent';
    canvasParent.appendChild(canvas);
    this.canvasParent = canvasParent;

    this.document.body.appendChild(canvasParent);
    this.testObject = canvasCallback(canvas);
  }

  finalize() {
    this.testObject.remove();
    this.canvasParent.remove();
  }
}
