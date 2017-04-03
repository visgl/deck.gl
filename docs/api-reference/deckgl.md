# DeckGL (React Component)

`DeckGL` is a React component that takes deck.gl layer instances and
viewport parameters, and renders those layers as a transparent overlay.

```js
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = (viewport, data) => (
  <DeckGL
    {...viewport}
    layers={[new ScatterplotLayer({data})]} />
);
```

### Properties

##### `id` (String, optional)

Canvas ID to allow style customization in CSS.

##### `viewport` ([Viewport](/docs/api-reference/viewport.md), optional)

This property should contain a `Viewport` instance which represents your
"camera" (essentially view and projection matrices, together with viewport
width and height). By changing the `viewport` you change the view of your
layers, e.g. as a result of mouse events or through programmatic animations.

If `viewport` is not supplied, deck.gl will look for web mercator projection
parameters (latitude, longitude, zoom, bearing and pitch) and create a
`WebMercatorViewport` (which is a subclass of `Viewport`).

##### `width` (Number, required)

Width of the canvas.

##### `height` (Number, required)

Height of the canvas.

##### `latitude` (Number, optional)

Current latitude - used to define a mercator projection if `viewport` is not supplied.

##### `longitude` (Number, optional)

Current longitude - used to define a mercator projection if `viewport` is not supplied.

##### `zoom` (Number, optional)

Current zoom - used to define a mercator projection if `viewport` is not supplied.

##### `bearing` (Number, optional)

Current bearing - used to define a mercator projection if `viewport` is not supplied.

##### `pitch` (Number, optional)

Current pitch - used to define a mercator projection if `viewport` is not supplied.

##### `layers` (Array, required)

The array of deck.gl layers to be rendered. This array is expected to be
an array of newly allocated instances of your deck.gl layers, created with
updated properties derived from the current application state.

##### `style` (Object, optional)

Css styles for the deckgl-canvas.

##### `pixelRatio` (Number, optional)

Will use device ratio by default.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `debug` (Boolean, optional)

Flag to enable debug mode.

Note: debug mode is somewhat slower as it will use synchronous operations
to keep track of GPU state.

##### `onWebGLInitialized` (Function, optional)

Callback, called once the WebGL context has been initiated

Callback arguments:
- `gl` - the WebGL context.

##### `onLayerHover` (Function, optional)

Callback - called when the object under the pointer changes.

Callback Arguments:
- `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object)
object for the topmost picked layer at the coordinate
- `pickedInfos` - an array of info objects for all pickable layers that
are affected.
- `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object

##### `onLayerClick` (Function, optional)

Callback - called when clicking on the layer.

Callback Arguments:
- `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object)
object for the topmost picked layer at the coordinate
- `pickedInfos` - an array of info objects for all pickable layers that
are affected.
- `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object

## Source
[src/react/deckgl.js](https://github.com/uber/deck.gl/blob/4.0-release/src/react/deckgl.js)
