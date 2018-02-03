# DeckGL (React Component)

`DeckGL` is the main interface to deck.gl for React applications. `DeckGL` is a React component that takes a list of deck.gl layer instances and a view state, and renders those layers on a transparent canvas that can be used as an overlay over other components like maps.

Make sure to read the [Using deck.gl with React](/docs/get-started/using-with-react.md) article.


## Usage

// Basic standalone use
```js
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = (viewState, data) => (
  <DeckGL
    {...viewState}
    layers={[new ScatterplotLayer({data})]} />
);
```

Like any React component, `DeckGL` can accept child components. Child components can be automatically positioned and sized to fit perfectly underneath any `View` in the list of `views`. Child components are often maps (e.g. the `StaticMap` component from react-map-gl), but can be any React components.

// Multiple views and an auto-positioned base map
```js
  const views = [
    new FirstPersonView({...}),
    new MapView({id: 'basemap', ...})
  ];

  render() {
    return (
      <DeckGL
        width={width}
        height={height}
        layers={this._renderLayers()}
        views={views} />

        <StaticMap
          viewId='basemap'
          {...viewState}/>

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

##### `views` (`View[]`, optional)

An array of `View`s (or optionally `Viewport`s, mainly for backward compatibility).

This property should contain one or more [`View`](/docs/api-reference/view.md) instances which represents your "cameras" from which to display your data. By changing the `views` property you change the view(s) of your layers, e.g. as a result of mouse events or through programmatic animations.

Default: If the `views` property is not supplied, deck.gl will create a full screen `MapView`, which requires the app to supply geospatial view state (like longitude, latitude, ...).

> deck.gl will render all the views in the provided order. This may not matter as depth testing is enabled by default by deck.gl (unless transparent layers are being rendered, in which case rendering order starts to matter again), but is useful when rendering 2D layers and disabling depth testing.


##### `viewState` (Object, optional)

A set of parameters that specify a view point. The exact parameters depend on the choice of `View` and `Controller` classes in use. For geospatial views, the view state should contain fields like `longitude`, `latitude`, `zoom` etc..


#### View State Properties

If a `viewState` prop is not supplied, `DeckGL` will attempt to autocreate a geospatial view state from the following props.

##### `latitude` (Number, optional)

Current latitude - used to define a mercator projection if `viewState` is not supplied.

##### `longitude` (Number, optional)

Current longitude - used to define a mercator projection if `viewState` is not supplied.

##### `zoom` (Number, optional)

Current zoom - used to define a mercator projection if `viewState` is not supplied.

##### `bearing` (Number, optional)

Current bearing - used to define a mercator projection if `viewState` is not supplied.

##### `pitch` (Number, optional)

Current pitch - used to define a mercator projection if `viewState` is not supplied.


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

> replaces deprecated method `queryVisibleObjects`.

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
- * Since deck.gl is WebGL based (and WebGL contexts are limited to a single canvas), deck.gl can only render into a single canvas. Thus all views need to render into in the same canvas. (You could of course use multiple DeckGL instances, but that can have significant resource and performance impact).



##### `children`

The following semantics of the standard React `children` property are considered experimental.

**JSX layers**

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop.
```jsx
  <DeckGL {...viewState}>
    <LineLayer id="line-layer" data={data} />
  <DeckGL />
```
For more information on this syntax and its limitations, see [Using deck.gl with React](/docs/get-started/using-with-react.md) article.


**Autopositioned Children**

To make it easy to use React components in combination with deck.gl views (e.g. to place a base map under a view, or add a label on top of a view), deck.gl can make such components automatically adjust as that view is added, removed or resized.

`DeckGL` classifies any top-level children (`props.children`) that have a `viewId` property as "view base components". It will perform special processing on them as follows:
* It resizes and repositions any `viewId` children to precisely match the extends of the deck.gl view with the corresponding id.
* It automatically hides any `viewId` children whose id is not matched by any current deck.gl view.
* It injects view state properties (`longitude`, `latitude` etc).
* Also injects the `visible: viewport.isMapSynched()` prop to hide base maps that cannot display per the current view state parameters.

Additional Notes:
* The DeckGL components own `canvas` element is added last to the child list, to sit on top of all the base components, however Z index can be used to override this.
* Child repositioning is done with CSS styling on a wrapper div, resizing is done through width and height properties.
* Hiding of children is performed by removing the elements from the child list
* Children without the `viewId` property are rendered as is.


## Source
[src/react/deckgl.js](https://github.com/uber/deck.gl/blob/5.1-release/src/react/deckgl.js)
