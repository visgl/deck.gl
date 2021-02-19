# Transport

The `Transport` base class is intended to abstract a number of client-host communication mechanisms.

The basic pattern is that the application registers callbacks to listen for connections, messages and disconnections. Note that the application should not assume that there is only a single connection. There can be multiple remote connections at one time (i.e. multiple cells in a Jupyter Notebook, or multiple UIWebWidgets in an iOS app), which can be tracked by listening to the `onInitialize` and `onFinalize` events.

Some examples of communication mechanisms that could be managed via the `Transport` API:

- Jupyter Widget based communication between a browser and a notebook
- Browser: `postMessage` based communication between tabs and iframes
- Android: Communication between Java application and JavaScript running in a `WebView` component
- iOS: Communication between Swift and JavaScript running in a `UIWebView` component


## Usage

Listening to transport connections, disconnections and messages

```js
Transport.setCallbacks({
  onInitialize: (message) => console.log('A new transport connected'),
  onFinalize: (message) => console.log('A transport disconnected'),
  onMessage: (message) => console.log('A message arrived on a connection')
});
```

## Static Members

### Transport.setCallbacks(callbacks: object): void

The following callbacks can be set:

- `callbacks.onInitialize`
- `callbacks.onMessage`
- `callbacks.onFinalize`


## Methods

### constructor

> Note: The `Transport` class should not be instantiated explicitly by JavaScript applications. `Transport` instances are automatically created.


## Remarks

Longer term goals:

- `WebSocket` based transport
- Possibly add additional transports such as Colab notebook specific APIs.
- Binary data
- Back-channel: Events
- Back-channel: Errors
