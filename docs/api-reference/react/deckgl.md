# DeckGL (React Component)

`DeckGL` is the main interface to deck.gl for React applications. `DeckGL` is a React component that takes a list of deck.gl layer instances and a view state, and renders those layers on a transparent canvas that can be used as an overlay over other components like maps.

Make sure to read the [Using deck.gl with React](/docs/get-started/using-with-react.md) article.

The `DeckGL` class is a React wrapper of the `Deck` JavaScript class which exposes essentially the same props. The `Deck` class should not be used directly in React applications.


## Usage

```js
// Basic usage
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = (viewState, data) => (
  <DeckGL
    {...viewState}
    layers={[new ScatterplotLayer({data})]} />
);
```

Like any React component, `DeckGL` can accept child components. Child components can be automatically positioned and sized to fit perfectly underneath any `View` in the list of `views`. Child components are often maps (e.g. the `StaticMap` component from react-map-gl), but can be any React components.

```js
import DeckGL, {MapView, FirstPersonView} from 'deck.gl';
// Multiple views and an auto-positioned base map
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

## Properties

`DeckGL` accepts all [Deck](/docs/api-reference/deck.md#properties) properties, with these additional semantics:


##### `views` (`View[]`, optional)

An array of `View`s (or optionally `Viewport`s, mainly for backward compatibility).

This property should contain one or more [`View`](/docs/api-reference/view.md) instances which represents your "cameras" from which to display your data. By changing the `views` property you change the view(s) of your layers, e.g. as a result of mouse events or through programmatic animations.

Default: If the `views` property is not supplied, deck.gl will create a full screen `MapView`, which requires the app to supply geospatial view state (like longitude, latitude, ...).

> deck.gl will render all the views in the provided order. This may not matter as depth testing is enabled by default by deck.gl (unless transparent layers are being rendered, in which case rendering order starts to matter again), but is useful when rendering 2D layers and disabling depth testing.

##### `controller` (Function | Boolean | Object, optional)

Specify the options for viewport interaction. The value is applied to the default (first) view. See [`View`](/docs/api-reference/view.md) for more information.

Default `null`.


### View State Properties

For backwards compatibility, the `DeckGL` component can be used without the `viewState` prop. If a `viewState` prop is not supplied, `DeckGL` will attempt to autocreate a geospatial view state from the following props.

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


### Children

The following semantics of the standard React `children` property are considered experimental.


#### JSX layers

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop.

```jsx
  <DeckGL {...viewState}>
    <LineLayer id="line-layer" data={data} />
  <DeckGL />
```

For more information on this syntax and its limitations, see [Using deck.gl with React](/docs/get-started/using-with-react.md) article.


#### Auto-Positioned Children

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


## Methods

All [Deck](/docs/api-reference/deck.md#methods) methods are available on the `DeckGL` component.


## Source

[modules/react/src/deckgl.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/react/src/deckgl.js)
