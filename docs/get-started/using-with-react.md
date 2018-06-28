# Using deck.gl with React

While not directly based on React, deck.gl is designed from ground up to work with [React](https://facebook.github.io/react/)-based applications. deck.gl layers fit naturally into React's component render flow and flux/redux based appications. deck.gl layers will be performantly rerendered whenever you rerender your normal JSX or React components.


## The DeckGL React Component

To use deck.gl with React, simply import the `DeckGL` React component and render it as a child of another component, passing in your list of deck.gl layers as a property.

```jsx
/// app.js
import React from 'react';
import DeckGL, {LineLayer} from 'deck.gl';

// Viewport settings
const viewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}];

// DeckGL react component
class App extends React.Component {
  render() {
    const layers = [
      new LineLayer({id: 'line-layer', data})
    ];

    return (
      <DeckGL {...viewState} layers={layers} />
    );
  }
}

```

## Adding a Base Map

An important companion to deck.gl is `react-map-gl`. It is a React wrapper for [Mapbox](https://mapbox.com) that can share the same web mercator viewport settings.

```jsx
/// app.js
import React from 'react';
import DeckGL, {MapController, LineLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'MAPBOX_ACCESS_TOKEN';

// Initial viewport settings
const initialViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}];

class App extends React.Component {
  render() {
    const layers = [
      new LineLayer({id: 'line-layer', data})
    ];

    return (
      <DeckGL
        initialViewState={initialViewState}
        controller={MapController}
        layers={layers}
      >
        <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
      </DeckGL>
    );
  }
}

```

## Using JSX with deck.gl Layers

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop. There are no performance advantages to this syntax but it can allow for a more consistent, React-like coding style.

```jsx
  render() {
    return (
      <DeckGL {...viewState}>
        <LineLayer id="line-layer" data={data} />
      <DeckGL />
    );
  }
```

For more information on this syntax and its limitations, see [DeckGL API](/docs/api-reference/api/deckgl.md).


## Using JSX with deck.gl views

It is possible to use JSX syntax to create deck.gl views as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `views` prop.

The following code renders the same set of layers in two viewports, splitting the canvas into two columns:

```jsx
  render() {
    const layers = [
      new LineLayer({id: 'line-layer', data})
    ];

    return (
      <DeckGL initialViewState={initialViewState} layers={layers} >
        <MapView id="map" width="50%" controller={MapController}>
          <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        </MapView>
        <FirstPersonView width="50%" x="50%" fovy={50} />
      <DeckGL />
    );
  }
```

For more information on this syntax, see [DeckGL API](/docs/api-reference/api/deckgl.md).


## Remarks

* The `DeckGL` component is typically rendered as a child of a
  map component like [react-map-gl](https://uber.github.io/react-map-gl/#/),
  but could be rendered as a child of any React component that you want to
  overlay your layers on top of.

* To achive the overlay effect, the `DeckGL` component creates a transparent
  `canvas` DOM element, into which the deck.gl layers passed in the `layers`
  prop will render (using WebGL). Since this canvas is transparent, any
  other component you have underneath (typically a map) will visible behind
  the layers.

* When the deck.gl layer list is drawn to screen, it matches the new Layer
  instances with the instances from the previous render call, intelligently
  compares the new properties and only updates WebGL state when needed
  (just like React does for DOM components).

* Internally, the `DeckGL` component initializes a WebGL context
  attached to a canvas element, sets up the animation loop and calls provided
  callbacks on initial load and for each rendered frame. The `DeckGL`
  component also handles events propagation across layers, and prevents
  unnecessary calculations using React and deck.gl lifecycle functions.


See [full API doc](/docs/api-reference/react/deckgl.md) for the `DeckGL` component.
