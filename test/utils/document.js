/* global window */

function applyConstructorOrFunction(functionOrConstructor, ...args) {
  try {
    return new functionOrConstructor(...args); // eslint-disable-line new-cap
  } catch (err) {
    return functionOrConstructor(...args);
  }
}

export default class DocumentTest {
  // Simplify the testing of deck.gl work that requires a document and canvas
  constructor(canvasCallback) {
    this.document = this._createDocument();
    this.canvasParent = null;
    this.testObject = null;
    this.canvasCallback = canvasCallback;
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

  setup() {
    // Creates a canvas which can be passed to canvasCallback
    // to add a node to
    const canvas = this.document.createElement('canvas');
    const canvasParent = this.document.createElement('div');
    canvasParent.className = 'canvas-parent';
    canvasParent.appendChild(canvas);
    this.canvasParent = canvasParent;
    this.document.body.appendChild(canvasParent);
    this.testObject = applyConstructorOrFunction(this.canvasCallback, canvas);
  }

  teardown() {
    this.testObject.remove();
    this.canvasParent.remove();
  }
}
