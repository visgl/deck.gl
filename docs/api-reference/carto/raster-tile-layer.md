# RasterTileLayer (Experimental)

`RasterTileLayer` is a layer for visualizing tiled raster data.

## Usage 

```tsx
import DeckGL from '@deck.gl/react';
import {RasterTileLayer, rasterTilesetSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = rasterTilesetSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'cartobq.public_account.temperature_raster'
  });

  const layer = new RasterTileLayer({
    data,
    getFillColor: d => {
      const {band_1} = d.properties;
      return [10 * (band_1 - 20), 0, 300 - 5 * band_1];
    }
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {RasterTileLayer} from '@deck.gl/carto';
new RasterTileLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>
```

```js
new deck.carto.RasterTileLayer({});
```

## Properties

Inherits all properties from [`ColumnLayer`](../layers/column-layer.md) and [`TileLayer`](../geo-layers/tile-layer.md), with exceptions indicated below.


##### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use the [rasterTilesetSource](./data-sources.md#rastertilesetsource) to fetch this from the CARTO API.

## Source

[modules/carto/src/layers/raster-tile-layer.ts](https://github.com/visgl/deck.gl/tree/9.0-release/modules/carto/src/layers/raster-tile-layer.ts)
