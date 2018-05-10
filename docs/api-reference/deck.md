# Deck Class

`Deck` is a class that takes deck.gl layer instances and viewport parameters, renders those layers as a transparent overlay, and handles events.

If you are using React, you should not use this component directly. Instead you should be rendering the [`DeckGL` React Component](/docs/api-reference/react/deckgl.md).


## Usage

```js
// Basic standalone use
import {Deck, ScatterplotLayer} from 'deck.gl';

const App = (viewState, data) => (
  const deck = new Deck({
    layers: [new ScatterplotLayer({data})]
  });
  deck.setProps({viewState});
);
```


## Constructor

Creates a new Deck instance.

```js
const deck = new Deck(props);
```

Parameters:

See the [Properties](#properties) section.


## Properties

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

##### `viewState` (Object)

A geospatial `viewState` would typically contain the following fields:

* `latitude` (Number, optional) - Current latitude - used to define a mercator projection if `viewport` is not supplied.
* `longitude` (Number, optional) - Current longitude - used to define a mercator projection if `viewport` is not supplied.
* `zoom` (Number, optional) - Current zoom - used to define a mercator projection if `viewport` is not supplied.
* `bearing` (Number, optional) - Current bearing - used to define a mercator projection if `viewport` is not supplied.
* `pitch` (Number, optional) - Current pitch - used to define a mercator projection if `viewport` is not supplied.


#### `initialViewState` (Object)

If `initialViewState` is provided, the `Deck` component will track view state changes from any attached `controller` using internal state, with `initialViewState` as its initial view state.

Notes:

* The `props.onViewStateChange` callback will still be called, if provided.
* If `props.viewState` is supplied by the application, the supplied `viewState` will always be used, "shadowing" the `Deck` component's internal `viewState`.
* In simple applications, use of the `initialViewState` prop can avoid the need track the view state in the application .
* One drawback of using `initialViewState` for reactive/functional applications is that the `Deck` component becomes more stateful.


### Configuration Properties

##### `id` (String, optional)

Canvas ID to allow style customization in CSS.

##### `style` (Object, optional)

Css styles for the deckgl-canvas.

##### `pickingRadius` (Number, optional)

Extra pixels around the pointer to include while picking. This is helpful when rendered objects are difficult to target, for example irregularly shaped icons, small moving circles or interaction by touch. Default `0`.

##### `useDevicePixels` (Boolean, optional)

When true, device's full resolution will be used for rendering, this value can change per frame, like when moving windows between screens or when changing zoom level of the browser.

Default value is `true`.

Note:

* Consider setting to `false` unless you require high resolution, as it affects rendering performance.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `debug` (Boolean, optional)

Flag to enable debug mode.

Default value is `false`.

Notes:

* debug mode is slower as it will use synchronous operations to keep track of GPU state.
* Enabling debug mode requires an extra luma.gl import:

```js
import 'luma.gl/debug'
````

### Event Callbacks

##### `onWebGLInitialized` (Function, optional)

Callback, called once the WebGL context has been initiated

Callback arguments:

* `gl` - the WebGL context.

##### `onViewStateChange` (Function)

The `onViewStateChange` callback is fired when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard.

`onViewStateChanged({viewState})`

* `viewState` - An updated [view state](/docs/developer-guide/view-state.md) object containing parameters such as `longitude`, `latitude`, `zoom` etc.

Returns:

* The application can return an updated view state. If a view state is returned, it will be used instead of the passed in `viewState` to update the application's internal view state (see `initialViewState`).

##### `onLayerHover` (Function, optional)

Callback - called when the object under the pointer changes.

Callback Arguments:

* `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object for the topmost picked layer at the coordinate, null when no object is picked.
* `pickedInfos` - an array of info objects for all pickable layers that are affected.
* `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object

##### `onLayerClick` (Function, optional)

Callback - called when clicking on the layer.

Callback Arguments:

* `info` - the [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object for the topmost picked layer at the coordinate, null when no object is picked.
* `pickedInfos` - an array of info objects for all pickable layers that are affected.
* `event` - the original [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) object


## Methods

##### `finalize`

Frees resources associated with this object immediately (rather than waiting for garbage collection).

`deck.finalize()`


##### `setProps`

Updates properties.

```js
deck.setProps({...});
```

See the Properties section on this page for more detail on which props can be set.


##### `pickObject`

Get the closest pickable and visible object at the given screen coordinate.

```js
deck.pickObject({x, y, radius, layerIds})
```

* `x` (Number) - x position in pixels
* `y` (Number) - y position in pixels
* `radius` (Number, optional) - radius of tolerance in pixels. Default `0`.
* `layerIds` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.

Returns:

* a single [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object, or `null` if nothing is found.


##### `pickMultipleObjects`

Performs deep picking. Finds all close pickable and visible object at the given screen coordinate, even if those objects are occluded by other objects.

```js
deck.pickObject({x, y, radius, layerIds, depth})
```

* `x` (Number) - x position in pixels
* `y` (Number) - y position in pixels
* `radius`=`0` (Number, optional) - radius of tolerance in pixels.
* `layerIds`=`null` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.
* `depth`=`10` - Specifies the max

Returns:

* An array of [`info`](/docs/get-started/interactivity.md#the-picking-info-object) objects. The array will be empty if no object was picked.

Notes:

* Deep picking is implemented as a sequence of simpler picking operations and can have a performance impact. Should this become a concern, you can use the `depth` parameter to limit the number of matches that can be returned, and thus the maximum number of picking operations.


##### `pickObjects`

Get all pickable and visible objects within a bounding box.

```js
deck.pickObjects({x, y, width, height, layerIds})
```

Parameters:

* `x` (Number) - left of the bounding box in pixels
* `y` (Number) - top of the bouding box in pixels
* `width` (Number, optional) - width of the bouding box in pixels. Default `1`.
* `height` (Number, optional) - height of the bouding box in pixels. Default `1`.
* `layerIds` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.

Returns:

* an array of unique [`info`](/docs/get-started/interactivity.md#the-picking-info-object) objects

Notes:

* The query methods are designed to quickly find objects by utilizing the picking buffer.
* The query methods offer more flexibility for developers to handle events compared to the built-in hover and click callbacks.


## Remarks

* Since deck.gl is based on WebGL and uses a single WebGL context, it can only render into a single canvas. Thus all its `View`s will render into the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact).


## Source

[modules/core/src/core/lib/deck.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/lib/deck.js)
