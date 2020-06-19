const state = {
  onIninitialize: _ => _,
  onFinalize: _ => _,
  onMessage: null
};

export default class Transport {
  static setCallbacks({onInitialize, onFinalize, onMessage}) {
    if (onInitialize) {
      state.onInitialize = onInitialize;
    }
    if (onFinalize) {
      state.onFinalize = onFinalize;
    }
    if (onMessage) {
      state.onMessage = onMessage;
    }
    // this._flushQueuedConnections();
  }

  constructor(name = 'Transport') {
    this.name = name;
    this._messageQueue = [];
    this.userData = {};
  }

  // Back-channel messaging
  sendJSONMessage() {
    // eslint-disable-next-line
    console.error('Back-channel not implemented for this transport');
  }

  sendBinaryMessage() {
    // eslint-disable-next-line
    console.error('Back-channel not implemented for this transport');
  }

  //
  // API for transports (not intended for apps)
  //

  _initialize(options = {}) {
    const message = {transport: this, ...options};
    state.onInitialize(message);

    // console.debug('Resolving init promise', options); // eslint-disable-line
    // this._initResolvers.resolve(message);
  }

  _finalize(options = {}) {
    const message = {transport: this, ...options};

    // TODO - could potentially be called without Initialize being called
    state.onFinalize(message);
    this._destroyed = true;
  }

  _messageReceived(message = {}) {
    message = {transport: this, ...message};

    // TODO - this function could potentially be called before callback registered/ Initialize called
    // if (!state.onMessage) {
    //   console.error('Queueing transport message', message); // eslint-disable-line
    //   this._messageQueue.push(message);
    //   return;
    // }

    console.debug('Delivering transport message', message); // eslint-disable-line
    state.onMessage(message);
  }

  /*
  // This tries to handle the case that a transport connection initializes before the application
  // has set the callbacks.
  // Note: It is not clear that this can actually happen in the in initial Jupyter widget transport
  _flushQueuedConnections() {
    if (onInitialize) {
      state._initPromise.then(initArgs => {
        onInitialize(initArgs);

        if (state._onMessage) {
          // Send any queued messages
          let message;
          while ((message = this._messageQueue.pop())) {
            console.debug('Delivering queued transport message', message); // eslint-disable-line
            this._onMessage(message);
          }
        }
      });
    }
  }
  */
}
