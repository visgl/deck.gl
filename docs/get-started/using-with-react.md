# Using deck.gl with React

deck.gl works perfectly for [React](https://facebook.github.io/react/)-based applications. All deck.gl layers fit naturally into React's component render flow.

To use deck.gl with React, simply import the `DeckGL` React component and
render it as a child of another component, passing in your list of deck.gl
layers as a property.

```
// Import React
import React, {Component} from 'react';
import {render} from 'react-dom';

// Import Mapbox via react-map-gl
import MapGL from 'react-map-gl';

// Import deck.gl and the layer you'd like to use
import DeckGL, {LineLayer} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// The root React component
class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -122.41669,
        zoom: 16.140440,
        bearing: -20.55991,
        pitch: 60
      },
      width: 500,
      height: 500
    };
  }

  render() {
    const {viewport, width, height} = this.state;

    return (
      <MapGL
        // Viewport props for Mapbox
        {...viewport}
        width={width}
        height={height}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGL
          // The same viewport props for deck.gl
          {...viewport}
          width={width}
          height={height}
          // Create a debug deck.gl instance
          debug
          layers={[
            new LineLayer({
              // Data to be used by the LineLayer
              data: [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}]
            })
          ]} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
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


See [full API doc (link update needed)](/docs/api-reference/deckgl.md) for the `DeckGL` component.
