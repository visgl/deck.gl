export default class Transport {
  static registerTransport(transport) {}
  static getDefaultTransport() {
    return null;
  }
  static getTransport(name, fallback = true) {
    return null;
  }

  setCallbacks({onInitialize, onFinalize, onMessage}) {
    this.onInitialize = onInitialize;
    this.onFinalize = onFinalize;
    this.onMessage = onMessage;
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

  // initialize() { return _loadPromise; }
}
