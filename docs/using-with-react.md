# Using deck.gl with React

deck.gl was intentionally designed to be a perfect match for React
applications. deck.gl fits directly into React's component render flow by
enabling you to instantiate new copies of your layers whenever your
component tree is rendered, and just like React does for DOM components,
intelligently compares properties and only updates WebGL state when needed.

To use deck.gl with [React](https://facebook.github.io/react/),
import the `DeckGLOverlay` React component, which accepts an array of deck.gl
layers.


```
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl/react';
import {ScatterplotLayer} from 'deck.gl';

  ...
  render() {
    const viewport = new Viewport();
    return (
      <MapGL>
        <DeckGL
          viewport={viewport}
          layers={[
            new ScatterplotLayer({data})
          ]}
        />
      </MapGL>
    );
  }

```

## About react-map-gl

As shown in the example, the DeckGL component works especially well as
the child of a React component that displays a map using parameters similar
to the deck.gl Viewport (i.e. latitude, longitude, zoom etc). In this
configuration your layers will render a geospatial overlay over the underlying
map.

While an application could use its own Map component,
deck.gl has been developed side-by-side with (and extensively tested with)
the [react-map-gl](https://uber.github.io/react-map-gl/#/) component,
which is essentially a React wrapper around mapbox-gl.

It is possible to use deck.gl without react-map-gl, but the application
would have to implement its own event handling as all deck.gl examples
currently relies on react-map-gl in that regard.


## Using deck.gl without React

deck.gl in itself (i.e. the core library and the layers) is
completely independent of React (and could be used with any JavaScript
framework). While no such support is provided, such integrations are not
expected to be particularly difficult.


## DeckGL React Component API

A React component that takes in viewport parameters, layer instances and
generates an overlay consists of single/multiple layers sharing the same
rendering context. Internally, the deckgl-overlay initializes a WebGL context
attached to a canvas element, sets up the animation loop and calls provided
callbacks on initial load and for each rendering frames. The deckgl-overlay
also handles events propagation across layers, and prevents unnecessary
calculation taking advantage of the react lifecycle functions.

**Props**
* `id` (string, optional) canvas ID for customizing styling
* `width` (number, required) width of the canvas
* `height` (number, required) height of the canvas
* `layers` (array, required) the list of layers to be rendered
* `blending` (object, optional) blending settings
* `style` (object, optional) css styles for the deckgl-canvas
* `pixelRatio` (number, optional) pixelRatio, will use device ratio by default
* `gl` (object, optional) gl context - will be autocreated if not supplied
* `debug` (bool, optional) boolean flag for enabling debug mode -
   note that debug mode is somewhat slower as it will use synchronous
   operations to keep track of GPU state.
* `onWebGLInitialized` [function, optional] callback on initiating gl-context

