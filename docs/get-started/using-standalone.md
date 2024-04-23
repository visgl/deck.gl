# Using deck.gl Standalone

The deck.gl core library and layers have no dependencies on React, Mapbox GL, or MapLibre GL and can be used by any JavaScript application.

Our [get-started examples](https://github.com/visgl/deck.gl/tree/master/examples/get-started) contains vanilla JavaScript templates that serve as a starting point for your application.


## Using @deck.gl/core

` @deck.gl/core` is a submodule of deck.gl that contains no React dependency.

The [Deck](../api-reference/core/deck.md) class takes deck.gl layer instances and viewport parameters, and renders those layers as a transparent overlay.

```bash
npm install @deck.gl/core @deck.gl/layers
```

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  latitude: 37.8,
  longitude: -122.45,
  zoom: 15
};

const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ],
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapViewState} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.8,
  longitude: -122.45,
  zoom: 15
};

type DataType = {
  position: [longitude: number, latitude: number];
  color: [r: number, g: number, b: number];
  radius: number;
};

const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new ScatterplotLayer<DataType>({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ],
      getPosition: (d: DataType) => d.position,
      getFillColor: (d: DataType) => d.color,
      getRadius: (d: DataType) => d.radius
    })
  ]
});
```

  </TabItem>
</Tabs>


## Using the Scripting API

deck.gl also offers a standalone bundled version of the library - a native JavaScript scripting interface like that of d3.js. You can now use deck.gl in prototype environments such as [Codepen](https://codepen.io), [JSFiddle](https://jsfiddle.net) and [Observable](https://observablehq.com). This effort aims to make it easier for designers, creative coders and data scientists everywhere to leverage the GPU for interactive visualizations. The scripting API offers out-of-the-box integration with [Mapbox GL JS](https://mapbox.com) or [MapLibre GL JS](https://maplibre.org). To add a base map to your visualization, you need to include the base map library and stylesheet:

To use deck.gl in a scripting environment, include the standalone version in a `script` tag:

<Tabs groupId="map-library">
  <TabItem value="mapbox" label="Mapbox">

```html
<script src="https://unpkg.com/deck.gl@latest/dist.min.js"></script>
<!-- optional if mapbox base map is needed -->
<script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet" />
<!-- Allow the map to render in full screen  -->
<style>
  body {
    width: 100vw;
    height: 100vh;
    margin: 0;
  }
</style>
```

  </TabItem>
  <TabItem value="maplibre" label="MapLibre">

```html
<script src="https://unpkg.com/deck.gl@latest/dist.min.js"></script>
<!-- optional if maplibre base map is needed -->
<script src="https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.css" rel="stylesheet" />
<!-- Allow the map to render in full screen  -->
<style>
  body {
    width: 100vw;
    height: 100vh;
    margin: 0;
  }
</style>
```

  </TabItem>
</Tabs>

It exposes two global objects `deck` and `luma`. Any exports from the deck.gl core can be accessed by `deck.<Class>`.

The scripting API's [DeckGL](../api-reference/core/deckgl.md) class extends the core `Deck` class with some additional features such as Mapbox or MapLibre integration.

<Tabs groupId="map-library">
  <TabItem value="mapbox" label="Mapbox">

```js
//This example renders a scatterplot with DeckGL, on top of a basemap rendered with mapbox-gl, using a map style JSON from Carto.
const {DeckGL, ScatterplotLayer} = deck;

new DeckGL({
  mapboxApiAccessToken: '<mapbox-access-token>',
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
    zoom: 15
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ],
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius
    })
  ]
});
```

  </TabItem>
  <TabItem value="maplibre" label="MapLibre">

```js
//This example renders a scatterplot with DeckGL, on top of a basemap rendered with maplibre-gl, using a map style JSON from Carto.
const {DeckGL, ScatterplotLayer} = deck;

new DeckGL({
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
    zoom: 15
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ],
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius
    })
  ]
});
```

  </TabItem>
</Tabs>

Check our codepen [showcase](https://codepen.io/vis-gl) and [observable profile](https://beta.observablehq.com/@pessimistress) for examples.
