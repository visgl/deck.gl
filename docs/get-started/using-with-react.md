# Using deck.gl with React

While not directly based on React, deck.gl is designed from ground up to work with [React](https://facebook.github.io/react/) based applications. deck.gl layers fit naturally into React's component render flow and flux/redux based applications. deck.gl layers will be performantly rerendered whenever you rerender your normal JSX or React components.


## The DeckGL React Component

To use deck.gl with React, simply import the `DeckGL` React component and render it as a child of another component, passing in your list of deck.gl layers as a property.

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13
};

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

function App() {
  const layers = [
    new LineLayer<DataType>({
      id: 'line-layer',
      data: '/path/to/data.json',
      getSourcePosition: (d: DataType) => d.from,
      getTargetPosition: (d: DataType) => d.to,
    })
  ];

  return <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={layers} />;
}

```

## Adding a Base Map

The vis.gl community maintains two React libraries that seamlessly work with deck.gl.

- `react-map-gl` - a React wrapper for [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides) and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/). Several integration options are discussed in [using with Mapbox](../developer-guide/base-maps/using-with-mapbox.md).
- `@vis.gl/react-google-maps` - a React wrapper for [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript). See [using with Google Maps](../developer-guide/base-maps/using-with-google-maps.md).

## Using JSX Layers, Views, and Widgets

It is possible to use JSX syntax to create deck.gl layers, views, and widgets as React children of the `DeckGL` React components, instead of providing them as ES6 class instances to the `layers`, `views`, or `widgets` prop, respectively. There are no performance advantages to this syntax but it can allow for a more consistent, React-like coding style.

```jsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {ZoomWidget} from '@deck.gl/react';
import {Map} from 'react-map-gl';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13
};

function App() {
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
    >
      <LineLayer
        id="line-layer"
        data="/path/to/data.json"
        getSourcePosition={d => d.from}
        getTargetPosition={d => d.to} />

      <MapView id="map" width="50%" controller >
        <Map mapStyle="mapbox://styles/mapbox/light-v9" />
      </MapView>

      <FirstPersonView width="50%" x="50%" fovy={50} />

      <ZoomWidget/>
    </DeckGL>
  );
}
```

For more information on this syntax and its limitations, see [DeckGL API](../api-reference/react/deckgl.md).


## Performance Remarks

- Comparing to the `Deck` class in vanilla JavaScript, the `DeckGL` React component is a thin wrapper and in itself does not add any significant performance overhead. However, applications should be mindful that callbacks such as `onHover`, `onViewStateChange` etc. could potentially be invoked on every animation frame, and updating app states within these callbacks will trigger React to rerender (at least part of) the component tree. Therefore, apps should be diligent in following React best practices in general, such as avoiding expensive recalculation with `useMemo` hooks.

- When the component containing `DeckGL` indeed needs to rerender, there is no performance concern in recreating the deck.gl layer instances, even if their props are not changed. When deck.gl receives new layer instances, it compares them with the existing layers, and only updates GPU resources when needed, just like React does for DOM components. Learn more about how it works in this [FAQ](../developer-guide/using-layers.md#should-i-be-creating-new-layers-on-every-render).


## Using deck.gl with SSR

Frameworks such as `Next.js` and `Gatsby` leverage Server Side Rendering to improve page loading performance. As of v9.0, deck.gl is fully [ES module](https://nodejs.org/api/packages.html) compliant with support for both ESM-style `import` and CommonJS-style `require()`. Depending on your project settings and the server-side bundler, everything likely would just work.

For some projects, SSR may fail with an error message `Error: require() of ES Module 'xxx'`. This is because some of deck.gl's upstream dependencies, such as `d3`, have opted to become ESM-only and no longer support `require()`. Possible mitigations are:

- Add `type: "module"` to the project's package.json. This will require other CommonJS-style scripts in the project be updated, as detailed in [Node.js documentation](https://nodejs.org/api/esm.html#enabling). Or,
- Isolate the deck.gl imports and exclude them from SSR. Since deck.gl renders into a WebGL2/WebGPU context, it wouldn't benefit from SSR to begin with. Below is a minimal sample for `Next.js`:

```jsx title="/src/components/map.js"
import DeckGL from '@deck.gl/react';
import {TextLayer} from '@deck.gl/layers';

export default function Map() {
  const layers = [
    new TextLayer({...})
  ];

  return <DeckGL layers={layers} />
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
