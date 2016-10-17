# Using deck.gl with React

deck.gl was designed to be a perfect match for
[React](https://facebook.github.io/react/) applications.
deck.gl layers fit directly into React's component render flow.

To use deck.gl with React, import the `DeckGL` React component and render
it as a child of the map component you want it to render on top of.

The `layers` propertry is the key to using the DeckGL React component.
This is where you pass in an array of `deck.gl` layers. This array is
expected to be an array of newly allocated instances of your
deck.gl layers, created with updated properties derived from the current
application state.

To achive the overlay effect, the `DeckGL` component creates a transparent
`canvas` DOM element, into which the deck.gl layers passed in the `layers`
prop will render (using WebGL). Since this canvas is transparent, any
other component you have underneath (typically a map) will visible behind
the layers.

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

## About performance

When the DeckGl component tree is drawn to screen, it matches the new Layer
instances with the instances from the previous render call, and intelligently
compares the new properties and only update WebGL state when needed
(just like React does for DOM components).

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

