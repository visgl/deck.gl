# VectorTileLayer

`VectorTileLayer` is a layer for visualizing tiled vector data. It extends the [`MVTLayer`](../geo-layers/mvt-layer.md) with CARTO-specific optimizations for efficient vector tile rendering, including binary data format support and separate geometry/attribute loading.

## Usage 

```tsx
import {DeckGL} from '@deck.gl/react';
import {VectorTileLayer, vectorTableSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = vectorTableSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',
  });

  const layer = new VectorTileLayer({
    data,
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 200],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```ts
import {VectorTileLayer} from '@deck.gl/carto';
new VectorTileLayer({});
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
new deck.carto.VectorTileLayer({});
```

## Properties

The properties of [`MVTLayer`](../geo-layers/mvt-layer.md) will be inherited.

#### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](./data-sources.md) to fetch this from the CARTO API:

- [vectorTableSource](./data-sources#vectortablesource)
- [vectorQuerySource](./data-sources#vectorquerysource)
- [vectorTilesetSource](./data-sources#vectortilesetsource)

## Source

[modules/carto/src/layers/vector-tile-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/vector-tile-layer.ts)
