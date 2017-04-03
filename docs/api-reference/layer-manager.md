# LayerManager Class

The `LayerManager` class handles updates, drawing and picking for a set of layers.

If you are using the [`DeckGL`](/docs/api-reference/deckgl.md) React Component, a layer
manager is created under the hood to handle rendering cycles.

## Constructor

Parameters:

- `opts` (Object)
  * `gl` ([WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext))

## Methods

##### `setViewport`

Parameters:

- `viewport` ([Viewport](/docs/api-reference/viewport.md)) - The new viewport

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
[src/lib/layer-manager.js](https://github.com/uber/deck.gl/blob/4.0-release/src/lib/layer-manager.js)
