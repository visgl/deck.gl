# Using deck.gl with React

deck.gl is a perfect match for
[React](https://facebook.github.io/react/) applications, since
deck.gl layers fit naturally into React's component render flow.

To use deck.gl with React, simply import the `DeckGL` React component and
render it as a child of another component, passing in your list of deck.gl
layers as a property.

    import MapGL from 'react-map-gl';
    import DeckGL from 'deck.gl/react';
    import {ScatterplotLayer, Viewport} from 'deck.gl';

    const data = [];
    const viewport = new Viewport();

    return (
      <MapGL>
        <DeckGL
          viewport={viewport}
          layers={[new ScatterplotLayer({data})]}
        />
      </MapGL>
    );

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
  instances with the instances from the previous render call, and intelligently
  compares the new properties and only update WebGL state when needed
  (just like React does for DOM components).

* Internally, the `DeckGL` component initializes a WebGL context
  attached to a canvas element, sets up the animation loop and calls provided
  callbacks on initial load and for each rendering frames. The `DeckGL`
  component also handles events propagation across layers, and prevents
  unnecessary calculations using React and deck.gl lifecycle functions.

## DeckGL React Component API

`DeckGL` is a React component that takes deck.gl layer instances and
viewport parameters, and renders those layers as a transparent overlay.

### Properties

##### `id` (String, optional)

Canvas ID to allow style customization.

##### `width` (Number, required)

Width of the canvas.

##### `height` (Number, required)

Height of the canvas.

##### `layers` (Array, required)

The array of `deck.gl` layers to be rendered. This array is expected to be
an array of newly allocated instances of your deck.gl layers, created with
updated properties derived from the current application state.

##### `blending` (Object, optional)

Blending settings.

##### `style` (Object, optional)

Css styles for the deckgl-canvas.

##### `pixelRatio` (Number, optional)

Will use device ratio by default.

##### `gl` (Object, optional)

gl context, will be autocreated if not supplied.

##### `debug` (Boolean, optional)

Flag to enable debug mode.

Note: debug mode is somewhat slower as it will use synchronous operations
to keep track of GPU state.

##### `onWebGLInitialized` (Function, optional)

Callback, called once the WebGL context has been initiated

Callback arguments:
- opts.gl - the WebGL context.

##### `onLayerHover` (Function, optional)

Callback - called when the mouse moves over the layers.

Arguments:
- `info` - the `info` object of the topmost
- `pickedInfos` - an array of info objects for all visible layers that
matched the picked coordinate, in top to bottom order.
- `event` - the original MouseEvent object

##### `onLayerClick` (Function, optional)

Callback - called when clicking on the layer.

Arguments:
- `info` - the `info` object of the topmost
- `pickedInfos` - an array of info objects for all visible layers that
matched the picked coordinate, in top to bottom order.
- `event` - the original MouseEvent object

## Remarks

* Picking: The info objects have a number of fields, most interesting are
  perhaps `layer` and `index`. If the data prop is an `Array`, `info.object`
  will contain the selected object in the array.
* Layers can add additional fields to the picking `info` object, check the
  documentation of each layer.
* Picking happens in top-to-bottom order (reverse of rendering), i.e.
  deck.gl traverses the layer list backwards during picking.
