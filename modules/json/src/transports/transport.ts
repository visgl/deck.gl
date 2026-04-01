// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Callback hooks invoked during the transport lifecycle.
 */
export type TransportCallbacks = {
  /** Invoked when a transport connection is initialized. */
  onInitialize: (message: any) => void;
  /** Invoked when a transport connection is finalized. */
  onFinalize: (message: any) => void;
  /** Invoked when the transport receives a message. */
  onMessage: (message: any) => void;
};

/* global document */
const state: TransportCallbacks = {
  onInitialize: _ => _,
  onFinalize: _ => _,
  onMessage: _ => _
};

/** Helper class for Python / Jupyter integration */
export class Transport {
  /**
   * Registers lifecycle callbacks shared by all transport instances.
   * @param callbacks Partial callback set to install.
   */
  static setCallbacks({onInitialize, onFinalize, onMessage}: Partial<TransportCallbacks>) {
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

  /** Human-readable transport name. */
  name: string;
  /** Queue of inbound messages received before callbacks are ready. */
  _messageQueue = [];
  /** Arbitrary user data associated with the transport instance. */
  userData = {};
  /** Whether the transport has been finalized. */
  _destroyed: boolean = false;

  /**
   * Creates a transport instance.
   * @param name Human-readable transport name.
   */
  constructor(name = 'Transport') {
    this.name = name;
  }

  /**
   * Return a root DOM element for this transport connection
   * @returns default implementation returns document.body
   * Jupyter Notebook transports will return an element associated with the notebook cell
   */
  getRootDOMElement(): HTMLElement | null {
    return typeof document !== 'undefined' ? document.body : null;
  }

  /**
   * Sends a JSON message through the transport back-channel.
   */
  sendJSONMessage() {
    // eslint-disable-next-line
    console.error('Back-channel not implemented for this transport');
  }

  /**
   * Sends a binary message through the transport back-channel.
   */
  sendBinaryMessage() {
    // eslint-disable-next-line
    console.error('Back-channel not implemented for this transport');
  }

  //
  // API for transports (not intended for apps)
  //

  /**
   * Marks the transport as initialized and emits the initialize callback.
   * @param options Additional payload fields merged into the callback message.
   */
  _initialize(options = {}) {
    const message = {transport: this, ...options};
    state.onInitialize(message);

    // console.debug('Resolving init promise', options); // eslint-disable-line
    // this._initResolvers.resolve(message);
  }

  /**
   * Marks the transport as finalized and emits the finalize callback.
   * @param options Additional payload fields merged into the callback message.
   */
  _finalize(options = {}) {
    const message = {transport: this, ...options};

    // TODO - could potentially be called without Initialize being called
    state.onFinalize(message);
    this._destroyed = true;
  }

  /**
   * Delivers a received message to the registered message callback.
   * @param message Additional payload fields merged into the callback message.
   */
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

  /**
   * Serializes an object to JSON while tolerating circular references where possible.
   * @param v Value to serialize.
   * @returns A JSON string with cycles removed or deduplicated where possible.
   */
  static _stringifyJSONSafe(v) {
    const cache = new Set();
    return JSON.stringify(v, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          // Circular reference found
          try {
            // If this value does not reference a parent it can be deduped
            return JSON.parse(JSON.stringify(value));
          } catch (err) {
            // discard key if value cannot be deduped
            return undefined;
          }
        }
        // Store value in our set
        cache.add(value);
      }
      return value;
    });
  }
}
