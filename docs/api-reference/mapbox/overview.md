# @deck.gl/mapbox

Use deck.gl layers as custom mapbox layers, enabling seamless interleaving of mapbox and deck.gl layers.

<img src="https://raw.github.com/uber-common/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


## Advantages and Limitations

### Advantages

* mapbox and deck.gl layers can be freely "interleaved", enabling a number of layer mixing effects, such as drawing behind map labels, z-occlusion between deck.gl 3D objects and Mapbox buildings, etc.
* mapbox and deck.gl will share a single canvas and WebGL context, saving system resources.

### Limitations

* deck.gl's multi-view system cannot be used.
* Unless used with react-map-gl, WebGL2 based deck.gl features, such as attribute transitions and GPU accelerated aggregation layers cannot be used.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.js'></script>
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

To create a mapbox-compatible deck.gl layer:

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

To add the layer to mapbox:

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
import React from 'react';
import DeckGL, {ScatterplotLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

import {MapboxLayer} from '@deck.gl/mapbox';

const INITIAL_VIEW_STATE = {
    longitude: -74.50,
    latitude: 40,
    zoom: 9
};

export class App extends React.Component {
  state = {};

  // DeckGL and mapbox will both draw into this WebGL context
  _onWebGLInitialized = (gl) => {
    this.setState({gl});
  }

  _onMapLoad = () => {
    const map = this._map;
    const deck = this._deck;

    map.addLayer(new MapboxLayer({id: 'my-scatterplot', deck}));
  }

  render() {
    const {gl} = this.state;
    const layers = [
        new ScatterplotLayer({
            id: 'my-scatterplot',
            data: [
                {position: [-74.5, 40], size: 100}
            ],
            getPosition: d => d.position,
            getRadius: d => d.size,
            getFillColor: [255, 0, 0]
        })
    ];

    return (
      <DeckGL
        ref={ref => {
          // save a reference to the Deck instance
          this._deck = ref && ref.deck;
        }}
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onWebGLInitialized={this._onWebGLInitialized}
      >
        {gl && (
          <StaticMap
            ref={ref => {
              // save a reference to the mapboxgl.Map instance
              this._map = ref && ref.getMap();
            }}
            gl={gl}
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
            onLoad={this._onMapLoad}
          />
        )}
      </DeckGL>
    );
  }
}
```


## Injecting Layers into Mapbox


### Adding a 3D deck layer

In this cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a mapbox basemap, while seemlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and mapbox layer catalogs. In this case, the mapbox [`map.addLayer(layer)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API method can be used to add a mix of deck.gl and mapbox layers to the top of the layer stack from the currently loaded mapbox style.


### Inserting a 2D deck layer before an existing mapbox layer

One major use case for mixing deck.gl and mapbox layers is that some important information in the mapbox map is hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

A bit more control is provided by the optional `before` parameter of the mapbox [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API. Using this parameter, it is possible to inject a `MapboxLayer` instance just before any existing mapbox layer in the layer stack of the currently loaded style.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).
