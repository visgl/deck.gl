# H3TileLayer

`H3TileLayer` is a layer for visualizing tiled data described using the [H3 Spatial Index](https://docs.carto.com/data-and-analysis/analytics-toolbox-for-bigquery/key-concepts/spatial-indexes#h3).

## Usage 

```tsx
import {DeckGL} from '@deck.gl/react';
import {H3TileLayer} from '@deck.gl/carto';
import {h3QuerySource} from '@carto/api-client';

function App({viewState}) {
  const data = h3QuerySource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    sqlQuery: 'select * from carto-demo-data.demo_tables.chicago_crime_sample',
  });

  const layer = new H3TileLayer({
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
import {H3TileLayer} from '@deck.gl/carto';
new H3TileLayer({});
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
new deck.carto.H3TileLayer({});
```

## Properties

Inherits all properties from [`H3HexagonLayer`](../geo-layers/h3-hexagon-layer.md) and [`TileLayer`](../geo-layers/tile-layer.md), with exceptions and additions noted below.

#### `data` (TilejsonResult) {#data}

Required. A valid `TilejsonResult` object.

Use one of the following [Data Sources](./data-sources.md) to fetch this from the CARTO API:

- [h3TableSource](./data-sources#h3tablesource)
- [h3QuerySource](./data-sources#h3querysource)
- [h3TilesetSource](./data-sources#h3tilesetsource)

## Source

[modules/carto/src/layers/h3-tile-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/h3-tile-layer.ts)
