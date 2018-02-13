# Deck Class

> React Note: If you are using React, you should not use this component directly. Instead you should be rendering the [`DeckGL` React Component](docs/api-reference/react/deckgl.md)

`Deck` is a class that takes deck.gl layer instances and viewport parameters, and renders those layers as a transparent overlay.

* Picking methods are supplied to enable applications to use their own event handling.

* TBA - child handling from react component.


## Usage

// Basic standalone use
```js
import {Deck, ScatterplotLayer} from 'deck.gl';

const App = (viewState, data) => (
  const deck = new Deck({
    layers: [new ScatterplotLayer({data})]
  });
  deck.setProps({viewState});
);
```

### Methods

##### constructor

Creates a new Deck instance.

`new Deck(props)`


##### delete

Frees resources associated with this object immediately.


##### setProps

Updates properties

`deck.setProps({...});`


##### pickObject

Get the closest pickable and visible object at screen coordinate.

`deck.pickObject({x, y, radius, layerIds})`

* `x` (Number) - x position in pixels
* `y` (Number) - y position in pixels
* `radius` (Number, optional) - radius of tolerance in pixels. Default `0`.
* `layerIds` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.

Returns: a single [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object, or `null` if nothing is found.


##### pickObjects

Get all pickable and visible objects within a bounding box.

`deck.pickObjects({x, y, width, height, layerIds})`

Parameters:
* `x` (Number) - left of the bounding box in pixels
* `y` (Number) - top of the bouding box in pixels
* `width` (Number, optional) - width of the bouding box in pixels. Default `1`.
* `height` (Number, optional) - height of the bouding box in pixels. Default `1`.
* `layerIds` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.

Returns: an array of unique [`info`](/docs/get-started/interactivity.md#the-picking-info-object) objects

Remarks:
- This query methods are designed to quickly find objects by utilizing the picking buffer. They offer more flexibility for developers to handle events in addition to the built-in hover and click callbacks.
- Note there is a limitation in the query methods: occluded objects are not returned. To improve the results, you may try setting the `layerIds` parameter to limit the query to fewer layers.

### Properties

##### `width` (Number, required)

Width of the canvas.

##### `height` (Number, required)

Height of the canvas.

##### `layers` (Array, required)

The array of deck.gl layers to be rendered. This array is expected to be an array of newly allocated instances of your deck.gl layers, created with updated properties derived from the current application state.

##### `layerFilter`

Optionally takes a function `({layer, viewport, isPicking}) => Boolean` that is called before a layer is rendered. Gives the application an opportunity to filter out layers from the layer list during either rendering or picking. Filtering can be done per viewport or per layer or both. This enables techniques like adding helper layers that work as masks during picking but do not show up during rendering. All the lifecycle methods are still triggered even a if a layer is filtered out using this prop.

##### `views`

A single `View`, or an array of [`View`](/docs/api-reference/view.md) instances (optionally mixed with [`Viewport`](/docs/api-reference/viewport.md) instances, although the latter is deprecated). If not supplied, a single `MapView` will be created. If an empty array is supplied, no `View` will be shown.

Remarks:
* During render and picking, deck.gl will render all the `View`s in the supplied order, this can matter if they overlap.
* `View`s represent your "camera(s)" (essentially view and projection matrices, together with viewport width and height). By changing the `views` property you change the view of your layers.

#### `viewState` (Object)

A geospatial `viewState` would typically contain the following fields:
* `latitude` (Number, optional) - Current latitude - used to define a mercator projection if `viewport` is not supplied.
* `longitude` (Number, optional) - Current longitude - used to define a mercator projection if `viewport` is not supplied.
* `zoom` (Number, optional) - Current zoom - used to define a mercator projection if `viewport` is not supplied.
* `bearing` (Number, optional) - Current bearing - used to define a mercator projection if `viewport` is not supplied.
* `pitch` (Number, optional) - Current pitch - used to define a mercator projection if `viewport` is not supplied.


#### Configuration Properties

##### `id` (String, optional)

Canvas ID to allow style customization in CSS.

##### `style` (Object, optional)

Css styles for the deckgl-canvas.

##### `pickingRadius` (Number, optional)

Extra pixels around the pointer to include while picking. This is helpful when rendered objects are difficult to target, for example irregularly shaped icons, small moving circles or interaction by touch. Default `0`.

##### `useDevicePixels` (Boolean, optional)

When true, device's full resolution will be used for rendering, this value can change per frame, like when moving windows between screens or when changing zoom level of the browser.

Default value is `true`.

Note: Consider setting to `false` unless you require high resolution, as it affects rendering performance.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `debug` (Boolean, optional)

Flag to enable debug mode.

Default value is `false`.

Note: debug mode is somewhat slower as it will use synchronous operations to keep track of GPU state.

##### `onWebGLInitialized` (Function, optional)

Callback, called once the WebGL context has been initiated

Callback arguments:
- `gl` - the WebGL context.

##### `onLayerHover` (Function, optional)

Callback - called when the object under the pointer changes.

Callback Arguments:
- `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object)
object for the topmost picked layer at the coordinate, null when no object is picked.
- `pickedInfos` - an array of info objects for all pickable layers that
are affected.
- `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object

##### `onLayerClick` (Function, optional)

Callback - called when clicking on the layer.

Callback Arguments:
- `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object)
object for the topmost picked layer at the coordinate, null when no object is picked.
- `pickedInfos` - an array of info objects for all pickable layers that are affected.
- `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object


## Remarks

- Since deck.gl is based on WebGL and uses a single WebGL context, it can only render into a single canvas. Thus all its `View`s will render into the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact).


## Source
[src/react/deckgl.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/deck.js)
