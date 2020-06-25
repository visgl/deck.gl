# @deck.gl/mapbox

Use deck.gl layers as custom Mapbox layers, enabling seamless interleaving of Mapbox and deck.gl layers.

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


## Advantages and Limitations

### Advantages

* Mapbox and deck.gl layers can be freely "interleaved", enabling a number of layer mixing effects, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc.
* Mapbox and deck.gl will share a single canvas and WebGL context, saving system resources.

### Limitations

* deck.gl's multi-view system cannot be used.
* Unless used with react-map-gl, WebGL2 based deck.gl features, such as attribute transitions and GPU accelerated aggregation layers cannot be used.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.1.0/dist.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.js'></script>
<script type="text/javascript">
  const {MapboxLayer} = deck;
</script>
```

### Install from NPM

```bash
npm install @deck.gl/mapbox
```

```js
import {MapboxLayer} from '@deck.gl/mapbox';
```


## Examples

### Using with Pure JS

To create a Mapbox-compatible deck.gl layer:

```js
import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';

const myDeckLayer = new MapboxLayer({
  id: 'my-scatterplot',
  type: ScatterplotLayer,
  data: [
    {position: [-74.5, 40], size: 100}
  ],
  getPosition: d => d.position,
  getRadius: d => d.size,
  getColor: [255, 0, 0]
});
```

To add the layer to Mapbox:

```js
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = '<your access token here>';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-74.50, 40],
  zoom: 9
});

map.on('load', () => {
  map.addLayer(myDeckLayer);
});
```


### Using with React

```js
import React, {useState, useRef, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';

import {MapboxLayer} from '@deck.gl/mapbox';

const INITIAL_VIEW_STATE = {
  longitude: -74.50,
  latitude: 40,
  zoom: 9
};

const data = [
  {position: [-74.5, 40], size: 100}
];

function App() {
  // DeckGL and mapbox will both draw into this WebGL context
  const [glContext, setGLContext] = useState();
  const deckRef = useRef(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current.getMap();
    const deck = deckRef.current.deck;

    // You must initialize an empty deck.gl layer to prevent flashing
    map.addLayer(
      // This id has to match the id of the deck.gl layer
      new MapboxLayer({ id: "my-scatterplot", deck }),
      // Optionally define id from Mapbox layer stack under which to add deck layer
      'beforeId'
    );
  }, []);

  const layers = [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data,
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 0, 0]
    })
  ];

  return (
    <DeckGL
      ref={deckRef}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onWebGLInitialized={setGLContext}
      glOptions={{
        /* To render vector tile polygons correctly */
        stencil: true
      }}
    >
      {glContext && (
        /* This is important: Mapbox must be instantiated after the WebGLContext is available */
        <StaticMap
          ref={mapRef}
          gl={glContext}
          mapStyle="mapbox://styles/mapbox/light-v9"
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onLoad={onMapLoad}
        />
      )}
    </DeckGL>
  );
}
```


## Injecting Layers into Mapbox


### Adding a 3D deck layer

In this cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a Mapbox basemap, while seemlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and Mapbox layer catalogs. In this case, the Mapbox [`map.addLayer(layer)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API method can be used to add a mix of deck.gl and Mapbox layers to the top of the layer stack from the currently loaded Mapbox style.


### Inserting a 2D deck layer before an existing Mapbox layer

One major use case for mixing deck.gl and Mapbox layers is that some important information in the Mapbox map is hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the Mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

A bit more control is provided by the optional `before` parameter of the Mapbox [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API. Using this parameter, it is possible to inject a `MapboxLayer` instance just before any existing Mapbox layer in the layer stack of the currently loaded style.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of Mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).
