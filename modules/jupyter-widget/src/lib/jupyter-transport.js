// Jupyter Widget based Transport implementation

import {Transport} from '@deck.gl/json';

/**
 * A Transport subclass for communicating with Jupyter kernels
 * via the Jupyter Widget API.
 */
export default class JupyterTransport extends Transport {
  constructor() {
    super('Jupyter Transport (JavaScript <=> Jupyter Kernel)');
    this.jupyterModel = null; // Set manually by the Jupyter Widget View
    this.jupyterView = null; // Set manually by the Jupyter Widget View
  }

  getRootDOMElement() {
    return this.jupyterView.el;
  }

  /**
   * back-channel messaging for event handling etc
   */
  sendJSONMessage(type, data) {
    const string = Transport._stringifyJSONSafe({type, data});
    this.jupyterModel.send(string);
  }
}
