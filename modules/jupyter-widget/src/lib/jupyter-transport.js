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

  // TODO - implement back-channel messaging for event handling etc
  sendJsonMessage({json, type}) {
    // this.jupyterModel. ...
  }
}

export const jupyterTransport = new JupyterTransport();

Transport.registerTransport(jupyterTransport);
