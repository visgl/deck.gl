# Using deck.gl with React

While not directly based on React, deck.gl is designed from ground up to work with [React](https://facebook.github.io/react/) based applications. deck.gl layers fit naturally into React's component render flow and flux/redux based appications. deck.gl layers will be performantly rerendered whenever you rerender your normal JSX or React components.


## The DeckGL React Component

To use deck.gl with React, simply import the `DeckGL` React component and render it as a child of another component, passing in your list of deck.gl layers as a property.

```jsx
/// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

// DeckGL react component
function App() {
  const layers = [
    new LineLayer({id: 'line-layer', data})
  ];

  return <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers} />;
}

```

## Adding a Base Map

An important companion to deck.gl is `react-map-gl`. It is a React wrapper for [Mapbox](https://mapbox.com) that can share the same web mercator viewport settings.

```jsx
/// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import {Map} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'your_mapbox_token';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

function App({data}) {
  const layers = [
    new LineLayer({id: 'line-layer', data})
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}

```

For more detailed examples and options, see [using with Mapbox](../developer-guide/base-maps/using-with-mapbox.md).

## Using JSX with deck.gl Layers

It is possible to use JSX syntax to create deck.gl layers as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers` prop. There are no performance advantages to this syntax but it can allow for a more consistent, React-like coding style.

```jsx
function App() {
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true} >
      <LineLayer id="line-layer" data={data} />
    </DeckGL>
  );
}
```

For more information on this syntax and its limitations, see [DeckGL API](../api-reference/react/deckgl.md).


## Using JSX with deck.gl views

It is possible to use JSX syntax to create deck.gl views as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `views` prop.

The following code renders the same set of layers in two viewports, splitting the canvas into two columns:

```jsx
import {MapView, FirstPersonView} from '@deck.gl/core';

function App() {
  const layers = [
    new LineLayer({id: 'line-layer', data})
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers} >
      <MapView id="map" width="50%" controller={true}>
        <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
      </MapView>
      <FirstPersonView width="50%" x="50%" fovy={50} />
    </DeckGL>
  );
}
```

For more information on this syntax, see [DeckGL API](../api-reference/react/deckgl.md).


## Using deck.gl with SSR

Frameworks such as `Next.js` and `Gatsby` leverage Server Side Rendering to improve page loading performance. Some of deck.gl's upstream dependencies, such as `d3`, have opted to become [ES modules](https://nodejs.org/api/packages.html) and no longer support `require()` from the default Node entry point. This will cause SSR to fail. Possible mitigations are:

- If the framework provides such a config, you may be able to replace the offending commonjs entry point (e.g. `@deck.gl/layers`) with the corresponding ESM entry point (`@deck.gl/layers/dist/esm`).
- Otherwise, isolate the deck.gl imports and exclude them from SSR. Since deck.gl renders into a WebGL context, it wouldn't benefit from SSR to begin with. Below is a minimal sample for `Next.js`:

```jsx title="/src/components/map.js"
import DeckGL, {TextLayer} from 'deck.gl';

export default function Map() {
  return <DeckGL ... />
}
```

```jsx title="/src/pages/app.js"
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('../components/map'), {ssr: false});

export default function App() {
  return <Map />;
}
```

More examples are discussed in [this issue](https://github.com/visgl/deck.gl/issues/7735).

## Remarks

* The `DeckGL` component is typically rendered as a child of a
  map component like [react-map-gl](https://visgl.github.io/react-map-gl),
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


See [full API doc](../api-reference/react/deckgl.md) for the `DeckGL` component.
