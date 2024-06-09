# @deck.gl/carto

Deck.gl is the preferred and official solution for creating modern geospatial web applications using [CARTO Location Intelligence platform](https://carto.com/).

With deck.gl and the **CARTO platform** you can directly access spatial datasets and tilesets that are hosted in your current cloud data warehouse. CARTO provides seamless integrations with Google BigQuery, Amazon Redshift, Snowflake, Databricks and PostgreSQL-compatible databases, eliminating the need to move your data into CARTO.

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/osm_buildings.jpg" />

The platform integrates with the CARTO Maps API to:

- Provide a geospatial backend storage for your geospatial data.
- Visualize large datasets overcoming browser memory limitations.
- Provide an SQL spatial interface to work directly with your data.

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/eu_rivers.jpg" />

## Install package

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/carto
```

## Usage

### Automatically create layers configured in CARTO Builder

```js
import {Deck} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
fetchMap({cartoMapId}).then(map => new Deck(map));
```

### Custom layers connected to CARTO datasource

```jsx
import DeckGL from '@deck.gl/react';
import {VectorTileLayer, vectorQuerySource} from '@deck.gl/carto';

function App() {
  const data = vectorQuerySource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    sqlQuery: 'SELECT * FROM cartobq.testtables.points_10k',
  });

  const layer = new VectorTileLayer({
    data,
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 200],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  });

  return <DeckGL layers={[layer]} />;
}
```

### Examples

You can view a collection of working examples on the [CARTO documentation website](https://docs.carto.com/carto-for-developers/carto-for-deck.gl/examples).

### CARTO Layers

The CARTO module contains a number of custom layers which can be used to visualize the data, which work in conjunction with the [data source](#carto-data-sources) functions:

- [H3TileLayer](./h3-tile-layer.md)
- [QuadbinTileLayer](./quadbin-tile-layer.md)
- [QuadbinHeatmapTileLayer](./quadbin-heatmap-tile-layer.md)
- [RasterTileLayer](./raster-tile-layer.md)
- [VectorTileLayer](./vector-tile-layer.md)

### CARTO Data sources

There are a number of [data source functions](./data-sources.md) for accessing data from the CARTO platform. These provide a simple way to fetch data from the CARTO platform, which can then be used with deck.gl layers.

#### Authentication

When defining a [data source](./data-sources.md) it is necessary to provide a:

- `accessToken`: token to [authenticate/authorize requests](https://docs.carto.com/carto-for-developers/key-concepts/authentication-methods) to the CARTO API,
- `connectionName`: name of [connection](https://docs.carto.com/carto-for-developers/key-concepts/connections) configured in the CARTO platform.

### Support for other deck.gl layers

The CARTO module includes a [collection of layers](#carto-layers) for easy visualization of data from the CARTO platfrom. For performace and scalability, this data is served as tiles.

It is also straightforward to request data directly using the CARTO [SQL API](https://docs.carto.com/carto-for-developers/key-concepts/apis#sql). It can then be integrated with other deck.gl layers, for example:


```jsx
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {query} from '@deck.gl/carto';

function App() {
  const data = query({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    sqlQuery: 'SELECT * FROM cartobq.testtables.points_10k',
  });

  const layer = new ScatterplotLayer({
    data,
    dataTransform: data => data.rows,
    getPosition: d => d.geom.coordinates,
    getRadius: d => d.size
  });

  return <DeckGL layers={[layer]} />;
}
```
