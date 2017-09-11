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

##### `viewports`

* (`Viewport`|`Viewports[]`, optional) - A singe viewport, or an array of `Viewports` or "Viewport Descriptors".

Default: If not supplied, deck.gl will try to create a `WebMercatorViewport` from other props (longitude, latitude, ...).

This property should contain one or more ([`Viewport`](/docs/api-reference/viewport.md), optional)instances which represents your "camera" (essentially view and projection matrices, together with viewport width and height). By changing the `viewport` you change the view of your layers, e.g. as a result of mouse events or through programmatic animations.

deck.gl will render all the viewports in order.

If `viewports` is not supplied, deck.gl will look for web mercator projection parameters (latitude, longitude, zoom, bearing and pitch) and create a `WebMercatorViewport` (which is a subclass of `Viewport`).

##### `viewport`

Deprecated. Use `viewports` property instead, it can accept a single `Viewport` or an array with a single `Viewport`.

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

The array of deck.gl layers to be rendered. This array is expected to be an array of newly allocated instances of your deck.gl layers, created with updated properties derived from the current application state.

##### `style` (Object, optional)

Css styles for the deckgl-canvas.

##### `pickingRadius` (Number, optional)

Extra pixels around the pointer to include while picking. This is helpful when rendered objects are difficult to target, for example
irregularly shaped icons, small moving circles or interaction by touch.
Default `0`.

##### `useDevicePixelRatio` (Boolean, optional)

Default value is true.

When true, device's full resolution will be used for rendering, this value can change per frame, like when moving windows between screens or when changing zoom level of the browser.

Note: Set it false unless it is required, as it affects your application performance.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `debug` (Boolean, optional)

Flag to enable debug mode.

Note: debug mode is somewhat slower as it will use synchronous operations to keep track of GPU state.

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
- `pickedInfos` - an array of info objects for all pickable layers that are affected.
- `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object

### Methods

##### queryObject

Get the closest pickable and visible object at screen coordinate.

`queryObject({x, y, radius, layerIds})`

Parameters:
- `options` (Object)
  + `x` (Number) - x position in pixels
  + `y` (Number) - y position in pixels
  + `radius` (Number, optional) - radius of tolerance in pixels. Default `0`.
  + `layerIds` (Array, optional) - a list of layer ids to query from.
    If not specified, then all pickable and visible layers are queried.

Returns: a single [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object, or `null` if nothing is found.

##### queryVisibleObjects

Get all pickable and visible objects within a bounding box.

`queryVisibleObjects({x, y, width, height, layerIds})`

Parameters:
- `options` (Object)
  + `x` (Number) - left of the bounding box in pixels
  + `y` (Number) - top of the bouding box in pixels
  + `width` (Number, optional) - width of the bouding box in pixels. Default `1`.
  + `height` (Number, optional) - height of the bouding box in pixels. Default `1`.
  + `layerIds` (Array, optional) - a list of layer ids to query from.
    If not specified, then all pickable and visible layers are queried.

Returns: an array of unique [`info`](/docs/get-started/interactivity.md#the-picking-info-object) objects

Remarks:
- This query methods are designed to quickly find objects by utilizing the picking buffer. They offer more flexibility for developers to handle events in addition to the built-in hover and click callbacks.
- Note there is a limitation in the query methods: occluded objects are not returned. To improve the results, you may try setting the `layerIds` parameter to limit the query to fewer layers.

## Source
[src/react/deckgl.js](https://github.com/uber/deck.gl/blob/4.1-release/src/react/deckgl.js)
