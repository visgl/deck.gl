# Using deck.gl with React

deck.gl works perfectly for [React](https://facebook.github.io/react/)-based applications. All deck.gl layers fit naturally into React's component render flow.

To use deck.gl with React, simply import the `DeckGL` React component and
render it as a child of another component, passing in your list of deck.gl
layers as a property.

```jsx
/// app.js
import React, {Component} from 'react';
import MapGL from 'react-map-gl';
import DeckGL, {LineLayer} from 'deck.gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'MAPBOX_ACCESS_TOKEN';

// Viewport settings that is shared between mapbox and deck.gl
const viewport = {
   width: 500,
   height: 500,
   longitude: -100,
   latitude: 40.7,
   zoom: 3,
   pitch: 0,
   bearing: 0
}

// Data to be used by the LineLayer
const data = [
  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

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

Remarks

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
