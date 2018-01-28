# Using deck.gl with React

While not directly based on React, deck.gl is designed from ground up to work with [React](https://facebook.github.io/react/)-based applications. deck.gl layers fit naturally into React's component render flow and flux/redux based appications. deck.gl layers will be performantly rerendered whenever you rerender your normal JSX or React components.


## The `DeckGL` React Component

To use deck.gl with React, simply import the `DeckGL` React component and render it as a child of another component, passing in your list of deck.gl layers as a property.

```jsx
/// app.js
import React, {Component} from 'react';
import DeckGL, {LineLayer} from 'deck.gl';

// Viewport settings
// Viewport settings that is shared between mapbox and deck.gl
const viewport = {
  width: 500,
  height: 500,
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

export default class App extends Component {
  render() {
    return (
      <DeckGL {...viewport} layers={[
        new LineLayer({id: 'line-layer', data})
      ]} />
    );
  }
}

```

## Adding a Base Map

An important companion to deck.gl is `react-map-gl`. It can provide both a base map as well as event handling for deck.gl.

```jsx
/// app.js
import MapGL from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'MAPBOX_ACCESS_TOKEN';

... // as in previous example
... // Note: Viewport settings are shared between mapbox and deck.gl

export default class App extends Component {
  render() {
    return (
      <MapGL {...viewport} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
        <DeckGL {...viewport} layers={[
          new LineLayer({id: 'line-layer', data})
        ]} />
      </MapGL>
    );
  }
}

```

## Using JSX with deck.gl Layers

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop. There are no performance advantages to this syntax but it can allow for a more consistent, React-like coding style.
```jsx
  render() {
    return (
      <DeckGL {...viewport}>
        <LineLayer id="line-layer" data={data} />
      <DeckGL />
    );
  }
```

> Caveat: The JSX layer syntax is limitated in that it only works when the layers are direct children of the `DeckGL` component. deck.gl layers are not true React components and cannot be rendered independently by React, and the JSX support depends on deck.gl intercepting the JSX generated child elements before React tries to render them.


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


See [full API doc](/docs/api-reference/deckgl.md) for the `DeckGL` component.
