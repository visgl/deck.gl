# TileLayer

This TileLayer takes in a function `getTileData` that fetches tiles, and renders it in a GeoJsonLayer or with the layer returned in `renderSubLayers`.

```js
import DeckGL from 'deck.gl';
import {TileLayer} from '@deck.gl/experimental-layers';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

export const App = ({viewport}) => {
  function getTileData({x, y, z}) {
    const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MAPBOX_TOKEN}`;
    return fetch(mapSource)
      .then(response => response.arrayBuffer())
      .then(buffer => vectorTileToGeoJSON(buffer, x, y, z));
  }

  function vectorTileToGeoJSON(buffer, x, y, z) {
    const tile = new VectorTile(new Protobuf(buffer));
    const features = [];
    for (const layerName in tile.layers) {
      const vectorTileLayer = tile.layers[layerName];
      for (let i = 0; i < vectorTileLayer.length; i++) {
        const vectorTileFeature = vectorTileLayer.feature(i);
        const feature = vectorTileFeature.toGeoJSON(x, y, z);
        features.push(feature);
      }
    }
    return features;
  }
  const layer = new TileLayer({
    stroked: false,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],
    getTileData
  });
  return <DeckGL {...viewport} layers={[layer]} />;
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties, along with `renderSubLayer`, `getTileData`, `onGetTileDataError`, `onDataLoaded`, `maxZoom`, `minZoom` and `maxCacheSize`.

##### `maxZoom` (Number)

The maximum zoom level of the tiles from consumers' data. If provided, and the current map zoom level is greater than `maxZoom`, we will fetch data at `maxZoom` instead of the current zoom level.

- Default: `null`

##### `minZoom` (Number)

The minimum zoom level of the tiles from consumers' data. If provided, and the current map zoom level is smaller than `minZoom`, we will fetch data at `minZoom` instead of the current zoom level.

- Default: `null`

##### `maxCacheSize` (Number)

The maximum cache size for a tile layer. If not defined, it is calculated using the number of tiles in the current viewport times constant 5 (5 is picked because it's a common zoom range).

- Default: `null`

### Render Options

##### `onDataLoaded` (Function)
`onDataLoaded` is a function that is called when all tiles in the current viewport are loaded. Data in the viewport is passed in as an array to this callback function.

- Default: `onDataLoaded: (data) => null`

##### `getTileData` (Function)

`getTileData` is a function that takes `{x, y, z}` as parameters, and returns a promise, which resolves to data in tile z-x-y.

- Default: `getTileData: ({x, y, z}) => Promise.resolve(null)`

##### `onGetTileDataError` (Function)
`onGetTileDataError` called when a tile failed to load.

- Default: `(err) => console.error(err)`

##### `renderSubLayers` (Function)

Renders a sub-layer with the `data` prop being the resolved value of `getTileData`, and other props that are passed in the `TileLayer`

- Default: `props => new GeoJsonLayer(props)`
