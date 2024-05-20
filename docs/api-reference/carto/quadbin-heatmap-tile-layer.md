# QuadbinHeatmapTileLayer (Experimental)

`QuadbinHeatmapTileLayer` is a layer for visualizing tiled data described using the [Quadbin Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#quadbin) using a heatmap. 

## Usage 

```tsx
import DeckGL from '@deck.gl/react';
import {QuadbinHeatmapTileLayer, quadbinTilesetSource} from '@deck.gl/carto';

function App({viewState}) {
  const data = quadbinTilesetSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tilesets.quadbin'
  });

  const layer = new QuadbinHeatmapTileLayer({
    data,
    getFillColor: d => d.properties.color
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
import {QuadbinHeatmapTileLayer} from '@deck.gl/carto';
new QuadbinHeatmapTileLayer({});
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
new deck.carto.QuadbinHeatmapTileLayer({});
```

## Properties

Inherits all properties from [`QuadbinTileLayer`](./quadbin-tile-layer.md), with exceptions indicated below.

#### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](./data-sources.md) to fetch this from the CARTO API:

- [quadbinTableSource](./data-sources#quadbintablesource)
- [quadbinQuerySource](./data-sources#quadbinquerysource)
- [quadbinTilesetSource](./data-sources#quadbintilesetsource)

