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

##### `layerFilter` (Function)

Default: `null`

If supplied, will be called before a layer is drawn to determine whether it should be rendered. This gives the application an opportunity to filter out layers from the layer list during either rendering or picking. Filtering can be done per viewport or per layer or both. This enables techniques like adding helper layers that work as masks during picking but do not show up during rendering.

```js
new Deck({
  // ...
  layerFilter: ({layer, viewport}) => {
    if (viewport.id !== 'minimap' && layer.id === 'geofence') {
      // only display geofence in the minimap
      return false;
    }
    return true;
  }
}
```

Notes:

- `layerFilter` does not override the visibility defined by the layer's `visible` and `pickable` props.
- All the lifecycle methods are still triggered even a if a layer is filtered out using this prop.

Arguments:

- `layer` (Layer) - the layer to be drawn
- `viewport` (Viewport) - the current viewport
- `isPicking` (Boolean) - whether this is a picking pass
- `renderPass` (String) - the name of the current render pass. Some standard passes are:
  + `'screen'` - drawing to screen
  + `'picking:hover'` - drawing to offscreen picking buffer due to pointer move
  + `'picking:query'` - drawing to offscreen picking buffer due to user-initiated query, e.g. calling `deck.pickObject`.
  + `'shadow'` - drawing to shadow map

Returns:

`true` if the layer should be drawn.

##### `getCursor` (Function)

A custom callback to retrieve the cursor type. Receives an `interactionState` object and returns a string that is a [CSS cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor).

Default: `({isDragging}) => isDragging ? 'grabbing' : 'grab'`

Remarks:

* It is worth noting that when supplying a custom image for the cursor icon, Chrome requires a fallback option to be supplied, otherwise the custom image will not be loaded; e.g. `getCursor={() => 'url(images/custom.png), auto'}`

##### `views` (Array)

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

Transitions between two viewState objects can also be achieved by providing set of fields to `viewState` prop, for more details check [ViewState Transitions](/docs/api-reference/view-state-transitions.md)).

#### `initialViewState` (Object)

If `initialViewState` is provided, the `Deck` component will track view state changes from any attached `controller` using internal state, with `initialViewState` as its initial view state.

If the `initialViewState` prop changes, the internally tracked view state will be updated to match the new "initial" view state.

Notes:

* The `props.onViewStateChange` callback will still be called, if provided.
* If `props.viewState` is supplied by the application, the supplied `viewState` will always be used, "shadowing" the `Deck` component's internal `viewState`.
* In simple applications, use of the `initialViewState` prop can avoid the need to track the view state in the application.
* One drawback of using `initialViewState` for reactive/functional applications is that the `Deck` component becomes more stateful.

##### `controller` (Function | Boolean | Object)

Options for viewport interactivity, e.g. pan, rotate and zoom with mouse, touch and keyboard. This is a shorthand for defining interaction with the `views` prop if you are using the default view (i.e. a single `MapView`).

```js
new Deck({
  ...
  views: [new MapView({controller: true})]
})
```

is equivalent to:

```js
new Deck({
  ...
  // views: undefined
  controller: true
})
```

`controller` can be one of the following types:

* `null` or `false`: the viewport is not interactive.
* `true`: initiates the default controller - a [MapController](/docs/api-reference/map-controller.md), with default options.
* `Controller` class (not instance): initiates the provided controller with default options. Must be a subclass of the [MapController](/docs/api-reference/map-controller.md).
* `Object`: controller options. This will be merged with the default controller options.
  + `controller.type`: the controller class, must be a subclass of the [MapController](/docs/api-reference/map-controller.md).
  + For other options, consult the documentation of [Controller](/docs/api-reference/controller.md).

Default `null`.

#### `effects` (Array)

The array of effects to be rendered.A lighting effect will be added if an empty array is supplied.Refer to effect's documentation to see details
* [LightingEffect](/docs/effects/lighting-effect.md)

### Configuration Properties

##### `id` (String, optional)

Canvas ID to allow style customization in CSS.

##### `style` (Object, optional)

CSS styles for the deckgl-canvas.

##### `touchAction` (String, optional)

Allow browser default touch actions. See [hammer.js doc](http://hammerjs.github.io/touch-action/).

Default: `none`.

By default, the deck canvas captures all touch interactions. This prop is useful for mobile applications to unblock default scrolling behavior. For example, use the combination `controller: {dragPan: false}` and `touchAction: 'pan-y'` to allow vertical page scroll when dragging over the canvas.

##### `pickingRadius` (Number, optional)

Extra pixels around the pointer to include while picking. This is helpful when rendered objects are difficult to target, for example irregularly shaped icons, small moving circles or interaction by touch. Default `0`.

#### `getTooltip` (Function, optional)

Callback that takes a hovered-over point and renders a tooltip. If the prop is not specified, the tooltip is hidden.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being hovered.

If the callback returns `null`, the tooltip is hidden, with the CSS `display` property set to `none`.
If the callback returns a string, that string is rendered in a tooltip with the default CSS styling described below.
Otherwise, the callback can return an object with the following fields:

* `text` (String, optional) - Specifies the `innerText` attribute of the tooltip.
* `html` (String, optional) - Specifies the `innerHTML` attribute of the tooltip. Note that this will override the specified `innerText`.
* `className` (String, optional) - Class name to attach to the tooltip element. The element has the default class name of `deck-tooltip`.
* `style` (Object, optional) - An object of CSS styles to apply to the tooltip element, which can override the default styling.

By default, the tooltip has the following CSS style:

```css
z-index: 1;
position: absolute;
color: #a0a7b4;
background-color: #29323c;
padding: 10px;
```

##### `useDevicePixels` (Boolean|Number, optional)

Controls the resolution of drawing buffer used for rendering.

* `true`: `Device (physical) pixels` resolution is used for rendering, this resolution is defined by `window.devicePixelRatio`. On Retina/HD systems this resolution is usually twice as big as `CSS pixels` resolution.
* `false`: `CSS pixels` resolution (equal to the canvas size) is used for rendering.
* `Number` (Experimental): Specified Number is used as a custom ratio (drawing buffer resolution to `CSS pixel` resolution) to determine drawing buffer size, a value less than `one` uses resolution smaller than `CSS pixels`, gives better performance but produces blurry images, a value greater than `one` uses resolution bigger than CSS pixels resolution (canvas size), produces sharp images but at a lower performance.

Default value is `true`.

Note:

* Consider setting to `false` or to a Number less than `one` if better rendering performance is needed.

* When it is set to a high Number (like, 4 or more), it is possible to hit the system limit for allocating drawing buffer, such cases will log a warning and fallback to system allowed resolution.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `glOptions` (Object, optional)

Additional options used when creating the WebGLContext. See [WebGL context attributes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext).

##### `_framebuffer` (Object, optional)

(Experimental) Render to a custom frame buffer other than to screen.

##### `parameters` (Object, optional)

Expects an object with WebGL settings. This object will be passed to luma.gl's `setParameters` function to configure the WebGL context, e.g. to disable depth testing, change blending modes etc.

The `parameters` will be set before each frame is rendered. Naturally, any WebGL `parameters` prop supplied to individual layers will still override global parameters for that layer.

To get access to static parameter values, applications can `import GL from 'luma.gl'`. Please refer to the luma.gl [setParameters](https://luma.gl/docs/api-reference/gltools/parameter-setting) API for documentation on supported parameters and values.

An alternative way to set `parameters`  is to instead define the `onWebGLInitialized` callback (it receives the `gl` context as parameter) and call the luma.gl `setParameters` method inside it.


##### `debug` (Boolean, optional)

Flag to enable WebGL debug mode.

Default value is `false`.

Notes:

* debug mode is slower as it will use synchronous operations to keep track of GPU state.
* Enabling debug mode also requires an extra luma.gl import:

```js
import 'luma.gl/debug'
```

##### `_animate` (Experimental)

Forces deck.gl to redraw layers every animation frame. Normally deck.gl layers are only redrawn if any change is detected.


### Event Callbacks

##### `onWebGLInitialized` (Function, optional)

Called once the WebGL context has been initiated.

Callback arguments:

* `gl` - the WebGL context.

##### `onViewStateChange` (Function)

The `onViewStateChange` callback is fired when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard.

`onViewStateChange({viewState, interactionState, oldViewState})`

* `viewState` - An updated [view state](/docs/developer-guide/views.md) object.
* `interactionState` - Describes the interaction that invoked the view state change. May include the following fields:
  + `inTransition` (Boolean)
  + `isDragging` (Boolean)
  + `isPanning` (Boolean)
  + `isRotating` (Boolean)
  + `isZooming` (Boolean)
* `oldViewState` - The previous [view state](/docs/developer-guide/views.md) object.

Returns:

* The application can return an updated view state. If a view state is returned, it will be used instead of the passed in `viewState` to update the application's internal view state (see `initialViewState`).

##### `onHover` (Function, optional)

Called when the pointer moves over the canvas.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being hovered.
* `event` - the original gesture event

##### `onClick` (Function, optional)

Called when clicking on the canvas.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being clicked.
* `event` - the original gesture event

##### `onDragStart` (Function, optional)

Called when the user starts dragging on the canvas.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event

##### `onDrag` (Function, optional)

Called when dragging the canvas.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event

##### `onDragEnd` (Function, optional)

Called when the user releases from dragging the canvas.

Callback arguments:

* `info` - the [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event


##### `onLoad` (Function, optional)

Called once after gl context and Deck components (`ViewManager`, `LayerManager`, etc) are created. It is safe to trigger viewport transitions after this event.


##### `onResize` (Function, optional)

Called when the canvas resizes.

Callback arguments:

* `size`
  - `width` (Number) - the new width of the deck canvas, in client pixels
  - `height` (Number) - the new height of the deck canvas, in client pixels


##### `onBeforeRender` (Function, optional)

Called just before the canvas rerenders.

Callback arguments:

* `gl` - the WebGL context.


##### `onAfterRender` (Function, optional)

Called right after the canvas rerenders.

Callback arguments:

* `gl` - the WebGL context.



##### `onError` (Function, optional)

Called if deck.gl encounters an error. By default, deck logs the error to console and attempt to continue rendering the rest of the scene.

Callback arguments:

* `error` ([Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))
* `source` - the source of the error, likely a Layer instance


##### `_onMetrics` (Function, optional) **Experimental**

Called once every second with performance metrics.

Callback arguments:

* `stats` (Object)
  + `fps` (Number)
  + `redraw` (Number) - number of times the WebGLContext was rerendered.
  + `deck.setProps` (Number) - number of times `setProps` was called.


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

##### `redraw`

Attempt to draw immediately, rather than waiting for the next draw cycle. By default, deck flushes all changes to the canvas on each animation frame. This behavior might cause the deck canvas to fall out of sync with other components if synchronous updates are required.

Redrawing frequently outside of rAF may cause performance problems. Only use this method if the render cycle must be managed manually.

```js
deck.redraw(force);
```

* `force` (Boolean) - if `false`, only redraw if necessary (e.g. changes have been made to views or layers). If `true`, skip the check. Default `false`.


##### `pickObject`

Get the closest pickable and visible object at the given screen coordinate.

```js
deck.pickObject({x, y, radius, layerIds})
```

* `x` (Number) - x position in pixels
* `y` (Number) - y position in pixels
* `radius` (Number, optional) - radius of tolerance in pixels. Default `0`.
* `layerIds` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.
* `unproject3D` (Boolean, optional) - if `true`, `info.coordinate` will be a 3D point by unprojecting the `x, y` screen coordinates onto the picked geometry. Default `false`.

Returns:

* a single [`info`](/docs/developer-guide/interactivity.md#the-picking-info-object) object, or `null` if nothing is found.


##### `pickMultipleObjects`

Performs deep picking. Finds all close pickable and visible object at the given screen coordinate, even if those objects are occluded by other objects.

```js
deck.pickMultipleObjects({x, y, radius, layerIds, depth})
```

* `x` (Number) - x position in pixels
* `y` (Number) - y position in pixels
* `radius`=`0` (Number, optional) - radius of tolerance in pixels.
* `layerIds`=`null` (Array, optional) - a list of layer ids to query from. If not specified, then all pickable and visible layers are queried.
* `depth`=`10` - Specifies the max
* `unproject3D` (Boolean, optional) - if `true`, `info.coordinate` will be a 3D point by unprojecting the `x, y` screen coordinates onto the picked geometry. Default `false`.

Returns:

* An array of [`info`](/docs/developer-guide/interactivity.md#the-picking-info-object) objects. The array will be empty if no object was picked.

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

* an array of unique [`info`](/docs/developer-guide/interactivity.md#the-picking-info-object) objects

Notes:

* The query methods are designed to quickly find objects by utilizing the picking buffer.
* The query methods offer more flexibility for developers to handle events compared to the built-in hover and click callbacks.


## Member Variables

#### metrics

A map of various performance statistics for the last 60 frames of rendering. Metrics gathered in deck.gl are the following:
- 'fps': average number of frames rendered per second
- 'updateAttributesTime': time spent updating layer attributes
- 'setPropsTime': time spent setting deck properties
- 'framesRedrawn': number of times the scene was rendered
- 'pickTime': total time spent on picking operations
- 'pickCount': number of times a pick operation was performed
- 'gpuTime': total time spent on GPU processing
- 'gpuTimePerFrame': average time spent on GPU processing per frame
- 'cpuTime': total time spent on CPU processing
- 'cpuTimePerFrame': average time spent on CPU processing per frame
- 'bufferMemory': total GPU memory allocated for buffers
- 'textureMemory': total GPU memory allocated for textures
- 'renderbufferMemory': total GPU memory allocated for renderbuffers
- 'gpuMemory': total allocated GPU memory


## Remarks

* Since deck.gl is based on WebGL and uses a single WebGL context, it can only render into a single canvas. Thus all its `View`s will render into the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact).


## Source

[modules/core/src/lib/deck.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/lib/deck.js)
