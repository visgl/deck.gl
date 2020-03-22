const registeredTransports = [];

export default class Transport {
  static registerTransport(transport) {
    registeredTransports.push(transport);
  }

  static getDefaultTransport() {
    if (registeredTransports.length === 0) {
      throw new Error('No JSON transport registered');
    }
    return registeredTransports[0];
  }

  static getTransport(name, fallback = true) {
    let transport = registeredTransports.find(transport_ => transport_.name.startsWith(name));
    if (!transport && fallback) {
      transport = Transport.getDefaultTransport();
    }
    return transport;
  }

  constructor(name = 'Transport') {
    this.name = name;

    // Set up an initialization  promise, so that we can defer the call of onInitialize
    this._initPromise = new Promise((resolve, reject) => {
      this._initResolvers = {resolve, reject};
    });
    this._messageQueue = [];

    this.userData = {};

    this.onIninitialize = _ => _;
    this.onFinalize = _ => _;
    this.onMessage = null;
  }

  setCallbacks({onInitialize, onFinalize, onMessage}) {
    if (onInitialize) {
      this.onInitialize = onInitialize;
    }
    if (onFinalize) {
      this._onFinalize = onFinalize;
    }
    if (onMessage) {
      this._onMessage = onMessage;
    }

    if (onInitialize) {
      this._initPromise.then(initArgs => {
        onInitialize(initArgs);

        if (this._onMessage) {
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
    console.debug('Resolving init promise', options); // eslint-disable-line
    this._initResolvers.resolve({transport: this, ...options});
  }

  _finalize(options = {}) {
    // TODO - could potentially be called without Initialize being called
    this.onFinalize({transport: this, ...options});
    this._destroyed = true;
  }

  _messageReceived(message = {}) {
    message = {transport: this, ...message};

    // TODO - could potentially be called without Initialize being called
    if (!this.onMessage) {
      console.debug('Queueing transport message', message); // eslint-disable-line
      this._messageQueue.push(message);
      return;
    }

    console.debug('Delivering transport message', message); // eslint-disable-line
    this.onMessage(message);
  }
}
