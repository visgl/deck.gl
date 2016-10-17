# React Integration

While deck.gl in itself (the core library and all provided layers) is completely
independent of React, the design is a perfect match for React applications
and a React integration is provided, in the form of the
`DeckGLOverlay` React component, which accepts an array of deck.gl layers.

This component works especially well as the child of a React component that
displays a map using parameters similar to the deck.gl Viewport (i.e.
latitude, longitude, zoom etc), and has been developed side-by-side with the
react-map-gl module.


## DeckGLOverlay:

* **deckgl-overlay**
A react component that takes in viewport parameters, layer instances and
generates an overlay consists of single/multiple layers sharing the same
rendering context. Internally, the deckgl-overlay initializes a WebGL context
attached to a canvas element, sets up the animation loop and calls provided
callbacks on initial load and for each rendering frames. The deckgl-overlay
also handles events propagation across layers, and prevents unnecessary
calculation taking advantage of the react lifecycle functions.

  **Parameters**
  * `id` (string, optional) canvas ID for customizing styling
  * `width` (number, required) width of the canvas
  * `height` (number, required) height of the canvas
  * `layers` (array, required) the list of layers to be rendered
  * `blending` (object, optional) blending settings
  * `gl` (object, optional) gl context
  * `debug` (bool, optional) boolean flag for enabling debug mode
  * `camera` (Camera, optional) a luma.gl camera instance
  * `style` (object, optional) css styles for the deckgl-canvas
  * `pixelRatio` (number, optional) pixelRatio, will use device ratio by default

  **Callbacks**
  * `onWebGLInitialized` [function, optional] callback on initiating gl-context
