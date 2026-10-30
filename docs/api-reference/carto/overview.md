# @deck.gl/carto

Deck.gl is the preferred and official solution for creating modern geospatial web applications using [CARTO Location Intelligence platform](https://carto.com/).

With deck.gl and the **CARTO platform** you can directly access spatial datasets and tilesets that are hosted in your current cloud data warehouse. CARTO provides seamless integrations with Google BigQuery, Amazon Redshift, Snowflake, Databricks and PostgreSQL-compatible databases, eliminating the need to move your data into CARTO.

![](https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/osm_buildings.jpg)

The platform integrates with the CARTO Maps API to:

* Provide a geospatial backend storage for your geospatial data.
* Visualize large datasets overcoming browser memory limitations.
* Provide an SQL spatial interface to work directly with your data.

![](https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/eu_rivers.jpg)

## Install package[​](#install-package "Direct link to Install package")

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/carto
```

## Usage[​](#usage "Direct link to Usage")

### Automatically create layers configured in CARTO Builder[​](#automatically-create-layers-configured-in-carto-builder "Direct link to Automatically create layers configured in CARTO Builder")

```
import {Deck} from '@deck.gl/core';

import {fetchMap} from '@deck.gl/carto';



const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

fetchMap({cartoMapId}).then(map => new Deck(map));
```

### Custom layers connected to CARTO datasource[​](#custom-layers-connected-to-carto-datasource "Direct link to Custom layers connected to CARTO datasource")

```
import {DeckGL} from '@deck.gl/react';

import {VectorTileLayer} from '@deck.gl/carto';

import {vectorQuerySource} from '@carto/api-client';



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

### Examples[​](#examples "Direct link to Examples")

You can view a collection of working examples on the [CARTO documentation website](https://docs.carto.com/carto-for-developers/carto-for-deck.gl/examples).

### CARTO Layers[​](#carto-layers "Direct link to CARTO Layers")

The CARTO module contains a number of custom layers which can be used to visualize the data, which work in conjunction with the [data source](#carto-data-sources) functions:

* [H3TileLayer](https://deck.gl/docs/api-reference/carto/h3-tile-layer.md)
* [HeatmapTileLayer](https://deck.gl/docs/api-reference/carto/heatmap-tile-layer.md)
* [QuadbinTileLayer](https://deck.gl/docs/api-reference/carto/quadbin-tile-layer.md)
* [RasterTileLayer](https://deck.gl/docs/api-reference/carto/raster-tile-layer.md)
* [VectorTileLayer](https://deck.gl/docs/api-reference/carto/vector-tile-layer.md)

### CARTO Data sources[​](#carto-data-sources "Direct link to CARTO Data sources")

There are a number of [data source functions](https://deck.gl/docs/api-reference/carto/data-sources.md) for accessing data from the CARTO platform. These provide a simple way to fetch data from the CARTO platform, which can then be used with deck.gl layers.

#### Authentication[​](#authentication "Direct link to Authentication")

When defining a [data source](https://deck.gl/docs/api-reference/carto/data-sources.md) it is necessary to provide a:

* `accessToken`: token to [authenticate/authorize requests](https://docs.carto.com/carto-for-developers/key-concepts/authentication-methods) to the CARTO API,
* `connectionName`: name of [connection](https://docs.carto.com/carto-for-developers/key-concepts/connections) configured in the CARTO platform.

### Support for other deck.gl layers[​](#support-for-other-deckgl-layers "Direct link to Support for other deck.gl layers")

The CARTO module includes a [collection of layers](#carto-layers) for easy visualization of data from the CARTO platfrom. For performace and scalability, this data is served as tiles.

It is also straightforward to request data directly using the CARTO [SQL API](https://docs.carto.com/carto-for-developers/key-concepts/apis#sql). It can then be integrated with other deck.gl layers, for example:

```
import {DeckGL} from '@deck.gl/react';

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
