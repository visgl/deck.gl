export default class Transport {
  static registerTransport(transport) {}
  static getDefaultTransport() {
    return null;
  }
  static getTransport(name, fallback = true) {
    return null;
  }

  constructor(name = 'Transport') {
    this.name = name;

    // Set up an initialization  promise, so that we can defer the call of onInitialize
    this._initPromise = new Promise((resolve, reject) => {
      this._initResolvers = {resolve, reject};
    });

    this.userData = {};

    this.onIninitialize = _ => _;
    this.onFinalize = _ => _;
    this.onMessage = options => console.debug('transport message', options); // eslint-disable-line
  }

  async setCallbacks({onInitialize, onFinalize, onMessage}) {
    if (onInitialize) {
      this.onInitialize = onInitialize;
    }
    if (onFinalize) {
      this._onFinalize = onFinalize;
    }
    if (this.onMessage) {
      this._onMessage = onMessage;
    }

    if (this.onIninitialize) {
      const initArgs = await this._initPromise;
      this.onInitialize(initArgs);
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
    this._initResolvers.resolve({transport: this, ...options});
  }

  _finalize(options = {}) {
    // TODO - could potentially be called without Initialize being called
    this.onFinalize({transport: this, ...options});
    this._destroyed = true;
  }

  _messageReceived(options = {}) {
    // TODO - could potentially be called without Initialize being called
    this.onMessage({transport: this, ...options});
  }
}
