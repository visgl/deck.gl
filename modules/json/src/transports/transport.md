# Transport

The `Transport` base class is intended to abstract a number of client-host communication mechanisms, including:

- Jupyter Widget based communication between a browser and a notebook
- Browser: `postMessage` based communication between tabs and iframes
- Android: Communication between Java application and JavaScript running in a `WebView` component
- iOS: Communication between Swift and JavaScript running in a `UIWebView` component

Longer term goals:

- `WebSocket` based transport
- Possibly add additional transports such as Colab notebook specific APIs.

## Features

- Binary data
- Back-channel: Events
- Back-channel: Errors
