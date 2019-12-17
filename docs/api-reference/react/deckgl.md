# DeckGL (React Component)

`DeckGL` is the main interface to deck.gl for React applications. `DeckGL` is a React component that takes a list of deck.gl layer instances and a view state, and renders those layers on a transparent canvas that can be used as an overlay over other components like maps.

Make sure to read the [Using deck.gl with React](/docs/get-started/using-with-react.md) article.

The `DeckGL` class is a React wrapper of the `Deck` JavaScript class which exposes essentially the same props. The `Deck` class should not be used directly in React applications.


## Usage

```js
// Basic usage
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';

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
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';

const App = (data) => (
  <DeckGL
    initialViewState={{longitude: -122.45, latitude: 37.78, zoom: 12}}
    controller={true}
    layers={[new ScatterplotLayer({data})]}
  >
    <StaticMap
      mapStyle="mapbox://styles/mapbox/dark-v9"
      mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
  </DeckGL>
);

```

## Properties

`DeckGL` accepts all [Deck](/docs/api-reference/deck.md#properties) properties, with these additional semantics:

### React Context

##### `ContextProvider` (React.Component, optional)

A [Context.Provider](https://reactjs.org/docs/context.html#contextprovider) component. If supplied, will be rendered as the ancester to all children. The passed through context contains the following values:

- `viewport` ([Viewport](/docs/api-reference/viewport.md)) - the current viewport
- `container` (DOMElement) - the DOM element containing the deck canvas
- `eventManager` ([EventManager](https://github.com/uber-web/mjolnir.js/blob/master/docs/api-reference/event-manager.md))

```jsx
/// Example using react-map-gl controls with deck.gl
import DeckGL from '@deck.gl/react';
import {_MapContext as MapContext, NavigationControl} from 'react-map-gl';

<DeckGL ... ContextProvider={MapContext.Provider}>
  <div style={NAVIGATION_CONTROL_STYLES}>
    <NavigationControl />
  </div>
</DeckGL>
```


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
    <MapView id="map" width="50%" controller={true} >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </MapView>
    <FirstPersonView width="50%" x="50%" fovy={50} />
  <DeckGL />
```

If a certain view id is used in both JSX views and the `views` prop, the view instance in the `views` prop has priority.

```jsx
  const views = [
    new MapView({id: 'map', width: '50%', controller: true}),
    new FirstPersonView({width: '50%', x: '50%', fovy: 50})
  ];

  <DeckGL initialViewState={...viewState} layers={layers} views={views} >
    <View id="map">
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </View>
  <DeckGL />
```


#### Position Children in Views

To make it easy to use React components in combination with deck.gl views (e.g. to place a base map under a view, or add a label on top of a view), deck.gl can make such components automatically adjust as that view is added, removed or resized.

Each child element of `DeckGL` is positioned inside a view. All children of a view is wrapped in a DOM container that:

* is offset to be relative to the deck.gl view that it corresponds to.
* is resized to match the extent of the deck.gl view with the corresponding view id.
* is hidden if the view id is missing from `DeckGL`'s `views` prop.

The containing view of each element is determined as follows:

- If the element is a direct child of `DeckGL`, it is positioned inside the default (first) view.
- If the element is nested under a `<View id={id}>` tag, it is positioned inside the view corresponding to the `id` prop. 


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

All [Deck](/docs/api-reference/deck.md#methods) methods are available on the `DeckGL` component, but not all of them can be explicitly called. For example, to rerender your component, you can pass updated props to `DeckGL` component directly, while you should call `setProps` with new props in `Deck`. 

The public methods you can call explicitly list below:

* `pickObject`
* `pickMultipleObjects`
* `pickObjects`

We do recommend you to use the pure JavaScript version of deck.gl if you are more comfortable with an imperative programming style (e.g. `deck.setProps()`).

## Source

[modules/react/src/deckgl.js](https://github.com/uber/deck.gl/blob/master/modules/react/src/deckgl.js)
