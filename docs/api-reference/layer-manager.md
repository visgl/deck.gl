# LayerManager Class (Advanced)

Note: The `LayerManager` class is an internal class that is exposed primarily to enable deck.gl to be used without React. If you are using the [`DeckGL`](/docs/api-reference/deckgl.md) React Component, a layer manager is created under the hood to handle layer management, and you do not need to use this class.

The `LayerManager` class handles updates, drawing and picking for a set of layers.

For more information consult the [Using Standalone](/docs/advanced/using-standalone.md) article.


## Constructor

Parameters:

- `opts` (Object)
  * `gl` ([WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext))

## Methods

##### `setViewport`

Parameters:

- `viewport` ([Viewport](/docs/api-reference/viewport.md)) - The new viewport

##### `setParameters`

Parameters:

- `parameters` (Object)
  * `useDevicePixelRatio` (Boolean) - Whether to use retina/HD display or not.

##### `updateLayers`

Parameters:

- `updateParams` (Object)
  * `newLayers` (Array) - Array of layers

##### `drawLayers`

Parameters:

- `drawParams` (Object)
  * `pass` (Number) - The render pass identifier, for debugging purpose

##### `pickLayers`

Parameters:

- `pickParams` (Object)
  * `x` (Number) - The x position of the pointer
  * `y` (Number) - The y position of the pointer
  * `mode` (String) - One of `hover` or `click`

## Source
[src/lib/layer-manager.js](https://github.com/uber/deck.gl/blob/4.1-release/src/lib/layer-manager.js)
