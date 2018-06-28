# DeckGL (React Component)

`DeckGL` is the main interface to deck.gl for React applications. `DeckGL` is a React component that takes a list of deck.gl layer instances and a view state, and renders those layers on a transparent canvas that can be used as an overlay over other components like maps.

Make sure to read the [Using deck.gl with React](/docs/get-started/using-with-react.md) article.

The `DeckGL` class is a React wrapper of the `Deck` JavaScript class which exposes essentially the same props. The `Deck` class should not be used directly in React applications.


## Usage

```js
// Basic usage
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = (data) => (
  <DeckGL
    longitude={-122.45}
    latitude={37.78}
    zoom={12}
    layers={[new ScatterplotLayer({data})]} />
);
```

Like any React component, `DeckGL` can accept child components. Child components are often maps (e.g. the `StaticMap` component from react-map-gl), but can be any React components.

```js
import DeckGL, {MapController} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

const App = (data) => (
  <DeckGL
    initialViewState={{longitude: -122.45, latitude: 37.78, zoom: 12}}
    controller={MapController}
    layers={[new ScatterplotLayer({data})]}
  >
    {({width, height, viewState}) => (
        <StaticMap
          {...viewState}
          width={width}
          height={height}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
      )}
  </DeckGL>
);

```

## Properties

`DeckGL` accepts all [Deck](/docs/api-reference/deck.md#properties) properties, with these additional semantics:


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

> Caveat: The JSX layer syntax is limitated in that it only works when the layers are direct children of the `DeckGL` component. deck.gl layers are not true React components and cannot be rendered independently by React, and the JSX support depends on deck.gl intercepting the JSX generated child elements before React tries to render them.


#### JSX views

It is possible to use JSX syntax to create deck.gl views as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `views` prop.

```jsx
  <DeckGL initialViewState={...viewState} layers={layers} >
    <MapView id="map" width="50%" controller={MapController} >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </MapView>
    <FirstPersonView width="50%" x="50%" fovy={50} />
  <DeckGL />
```

If a certain view id is used in both JSX views and the `views` prop, the view instance in the `views` prop has priority. This makes it possible to use the pure-JS `views` API while positioning child components in JSX:

```jsx
  const views = [
    new MapView({id: 'map', width: '50%', controller: MapController}),
    new FirstPersonView({width: '50%', x: '50%', fovy: 50})
  ];

  <DeckGL initialViewState={...viewState} layers={layers} views={views} >
    <View id="map">
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </View>
  <DeckGL />
```


#### Position Children in Viewport

To make it easy to use React components in combination with deck.gl views (e.g. to place a base map under a view, or add a label on top of a view), deck.gl can make such components automatically adjust as that view is added, removed or resized.

`DeckGL` injects its child elements with the following props:

* `x` - the left offset of the current view, in pixels
* `y` - the top offset of the current view, in pixels
* `width` - the width of the current view, in pixels
* `height` - the height of the current view, in pixels
* `viewState` - the view state of the current view
* `viewport` - the `Viewport` instance of the current view

If the element is a direct child of `DeckGL`, the current view is the default (first) view.
If the element is nested under a `<View>` tag, the current view is the one corresponding to the containing View's `id` prop.

Each element is wrapped in a DOM container that:

* is offset to be relative to the deck.gl view with the corresponding view id.
* is resized to match the extent of the deck.gl view with the corresponding view id.


#### Render callbacks

You may supply a function as a child to the `DeckGL` or `View` node (see **JSX views**). The function will be called to retrieve the React children when the viewport updates.

The following arguments are passed:

* `x` - the left offset of the current view, in pixels
* `y` - the top offset of the current view, in pixels
* `width` - the width of the current view, in pixels
* `height` - the height of the current view, in pixels
* `viewState` - the view state of the current view
* `viewport` - the `Viewport` instance of the current view

This is useful when you need to specify custom rendering logic for a child:

```jsx
  <DeckGL {...viewState}>
    {({x, y, width, height, viewState, viewport}) => (
      <Marker
        project={viewport.project}
        longitude={-122.45}
        latitude={37.8}
        width={24}
        height={24} />
    )}
  <DeckGL />
```

Additional Notes:

* The DeckGL components own `canvas` element is added last to the child list, to sit on top of all the base components, however Z index can be used to override this.
* Child repositioning is done with CSS styling on a wrapper div.
* Children that do not belong to any `<View>` tag and are functions are called with the properties of the default view.
* Children that do not belong to any `<View>` tag and are valid React elements are rendered as is.


## Methods

All [Deck](/docs/api-reference/deck.md#methods) methods are available on the `DeckGL` component.


## Source

[modules/react/src/deckgl.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/react/src/deckgl.js)
