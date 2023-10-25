# @deck.gl/carto

Deck.gl is the preferred and official solution for creating modern geospatial web applications using [CARTO Location Intelligence platform](https://carto.com/).

With deck.gl and the all-new **CARTO 3 platform** you can directly access spatial datasets and tilesets that are hosted in your current cloud data warehouse. CARTO 3 provides seamless integrations with Google BigQuery, Amazon Redshift, Snowflake, Databricks and PostgreSQL-compatible databases, eliminating the need to move your data into CARTO.

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
    connectionName: 'bigquery',
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

You can see working examples for the following:

- [Scripting](https://carto.com/developers/deck-gl/examples/): Quick scripting examples to play with the module without NPM or Webpack. If you're not a web developer, this is probably what you're looking for.

- [React](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/react): Integrate in a React application.

- [Pure JS](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/pure-js): Integrate in a pure js application, using webpack.

### CARTO Layers

The CARTO module contains a number of custom layers which can be used to visualize the data, which work in conjunction with the [data source](#carto-data-sources) functions:

- [H3TileLayer](./carto-layer.md)
- [QuadbinTileLayer](./carto-layer.md)
- [RasterTileLayer](./carto-layer.md)
- [VectorTileLayer](./carto-layer.md)

### CARTO Data sources

There are a number of data source functions for accessing data from the CARTO platform. These provide a simple way to fetch data from the CARTO platform, which can then be used with deck.gl layers. When

#### Authentication

When defining a data source it is necessary to provide a:

- `accessToken`: token to authenticate/authorize requests to the CARTO API,
- `connectionName`: name of connection configured in the CARTO platform.

### Support for other deck.gl layers

The CARTO module includes a [collection of layers](#carto-layers) for easy visualization of data from the CARTO platfrom. For performace and scalability, this data is served as tiles.

It is also straightforward to request data in two additional formats, `'geojson'` and `'json'`. It can then be integrated with other deck.gl layers, for example:


```js
function App() {
  const data = vectorTableSource({
    accessToken: 'XXX',
    connectionName: 'bigquery',
    tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',
    format: 'geojson'
  });

  const layer = new GeoJsonLayer({
    data,
    getFillColor: d => d.properties.color
  });

  return <DeckGL layers={[layer]} />;
}
```
