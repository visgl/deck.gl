# DeckGL (React Component)

`DeckGL` is a React component that takes deck.gl layer instances and viewport parameters, and renders those layers as a transparent overlay.

Make sure to read the [Using deck.gl with React](/docs/get-started/using-with-react.md) article.


## Usage

// Basic standalone use
```js
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = (viewport, data) => (
  <DeckGL
    {...viewport}
    layers={[new ScatterplotLayer({data})]} />
);
```

## Experimental Usage

`DeckGL` can accept child components. Child components can be automatically positioned underneath the deck.gl `viewports`. Such child components are often maps (e.g. represented by instances of the `StaticMap` component from [react-map-gl]()), but can be any React components.

// Multiple viewports and a base map
```js
  const viewports = [
    new FirstPersonViewport({...}),
    new WebMercatorViewport({id: 'basemap', ...})
  ];

  render() {
    return (
      <DeckGL
        width={viewportProps.width}
        height={viewportProps.height}
        layers={this._renderLayers()}
        viewports={viewports} />

        <StaticMap
          viewportId='basemap'
          {...viewportProps}/>

      </DeckGL>
    );
  }
```


### Properties

##### `width` (Number, required)

Width of the canvas.

##### `height` (Number, required)

Height of the canvas.

##### `layers` (Array, required)

The array of deck.gl layers to be rendered. This array is expected to be an array of newly allocated instances of your deck.gl layers, created with updated properties derived from the current application state.

##### `layerFilter`

Optionally takes a function `({layer, viewport, isPicking}) => Boolean` that is called before a layer is rendered. Gives the application an opportunity to filter out layers from the layer list during either rendering or picking. Filtering can be done per viewport or per layer or both. This enables techniques like adding helper layers that work as masks during picking but do not show up during rendering. All the lifecycle methods are still triggered even a if a layer is filtered out using this prop.


#### View State Properties

If you do not supply any `viewports` deck.gl will attempt to autocreate one from the following props.

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


### Methods

The picking methods are supplied to enable applications to use their own event handling.

##### pickObject

Get the closest pickable and visible object at screen coordinate.

`deck.pickObject({x, y, radius, layerIds})`

Parameters:
- `options` (Object)
  + `x` (Number) - x position in pixels
  + `y` (Number) - y position in pixels
  + `radius` (Number, optional) - radius of tolerance in pixels. Default `0`.
  + `layerIds` (Array, optional) - a list of layer ids to query from.
    If not specified, then all pickable and visible layers are queried.

Returns: a single [`info`](/docs/get-started/interactivity.md#the-picking-info-object) object, or `null` if nothing is found.

NOTE: replaces deprecated method `queryObject`.

##### pickObjects

Get all pickable and visible objects within a bounding box.

`deck.pickObjects({x, y, width, height, layerIds})`

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
- * Since deck.gl is WebGL based, it can only render into a single canvas. Thus all its viewports need to be in the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact).

NOTE: replaces deprecated method `queryVisibleObjects`.


### Experimental Properties

These properties are considered experimental and can change in the next minor version of deck.gl. They are included as previews of functionality that is being developed.

##### `viewports`

A singe viewport, or an array of `Viewport`s or "Viewport Descriptors".

* (`Viewport`|`Viewports[]`, optional) - A singe viewport, or an array of `Viewports` or "Viewport Descriptors".

Default: If not supplied, deck.gl will try to create a `WebMercatorViewport` from other props (longitude, latitude, ...).

This property should contain one or more ([`Viewport`](/docs/api-reference/viewport.md), optional)instances which represents your "camera" (essentially view and projection matrices, together with viewport width and height). By changing the `viewport` you change the view of your layers, e.g. as a result of mouse events or through programmatic animations.

deck.gl will render all the viewports in order.

If `viewports` is not supplied, deck.gl will look for web mercator projection parameters (latitude, longitude, zoom, bearing and pitch) and create a `WebMercatorViewport` (which is a subclass of `Viewport`).


##### `children`

The following semantics of the standard React `children` property are considered experimental.

**JSX layers**

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop.
```jsx
  <DeckGL {...viewport}>
    <LineLayer id="line-layer" data={data} />
  <DeckGL />
```
For more information on this syntax and its limitations, see [Using deck.gl with React](/docs/get-started/using-with-react.md) article.


**Autopositioned Children**

To make it easy to use React components in combination with deck.gl viewports (e.g. to place a base map under a viewport, or add a label on top of a viewport), deck.gl can make such components automatically adjust as that viewport is added, removed or resized.

`DeckGL` classifies any top-level children (`props.children`) that have a `viewportId` property as "viewport base components". It will perform special processing on them as follows:
* It resizes and repositions any `viewportId` children to precisely match the extends of the deck.gl viewport with the corresponding id.
* It automatically hides any `viewportId` children whose id is not matched by any current deck.gl viewport.
* It injects viewport properties (`longitude`, `latitude` etc).
* Also injects the `visible: viewport.isMapSynched()` prop to hide base maps that cannot display per the current viewport parameters.

Additional Notes:
* The DeckGL components own `canvas` element is added last to the child list, to sit on top of all the base components, however Z index can be used to override this.
* Child repositioning is done with CSS styling on a wrapper div, resizing is done through width and height properties.
* Hiding of children is performed by removing the elements from the child list
* Children without the `viewportId` property are rendered as is.


## Source
[src/react/deckgl.js](https://github.com/uber/deck.gl/blob/5.0-release/src/react/deckgl.js)
