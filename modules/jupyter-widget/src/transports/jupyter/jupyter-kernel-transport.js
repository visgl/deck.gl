// Jupyter Widget based Transport implementation

import Transport from '../transport';

/**
 * A Transport subclass for communicating with Jupyter kernels
 * via the Jupyter Widget API.
 */
export default class JupyterKernelTransport extends Transport {
  constructor() {
    super('Jupyter Kernel');
  }

  // TODO - implement back-channel messaging for event handling etc
  sendJsonMessage({json, type}) {
    // this._jupyterModel. ...
  }
}

export const jupyterKernelTransport = new JupyterKernelTransport();
