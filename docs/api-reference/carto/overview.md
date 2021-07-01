# @deck.gl/carto

The preferred and official solution for creating modern web apps using the [CARTO Location Intelligence platform](https://carto.com/) is deck.gl. 

With deck.gl and the **CARTO 3 platform** you can access directly your datasets and tilesets hosted in your current data warehouse. The CARTO 3 platform provides integrations with Google BigQuery, Amazon Redshift, Snowflake and PostgreSQL-compatible databases. You don't need to move your data to CARTO plaform.

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/osm_buildings.jpg" />

It integrates with the CARTO Maps API to:

* Provide a geospatial backend storage for your geospatial data.
* Visualize large datasets which do not fit within browser memory.
* Provide an SQL spatial interface to work with your data.

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/eu_rivers.jpg" />


## Install package

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/carto
```

## Usage CARTO 2

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.QUERY,
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 200],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Usage CARTO 3

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com', 
  accessToken: 'XXX',
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.QUERY,
    connection: 'bigquery',
    data: 'SELECT * FROM cartobq.testtables.points_10k',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 200],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

> **CARTO 3** is currently available only in a private beta. If you want to test it, please contact us at [support@carto.com](mailto:support@carto.com?subject=Access%20to%20CARTO%203).

### Examples

You can see real examples for the following:

* [Scripting](https://carto.com/developers/deck-gl/examples/): Quick scripting examples to play with the module without NPM or Webpack. If you're not a web developer, this is probably what you're looking for.

* [React](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/react): integrate in a React application.

* [Pure JS](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/pure-js): integrate in a pure js application, using webpack.

### CARTO credentials

This is an object to define the connection to CARTO, including the credentials (and optionally the parameters to point to specific api endpoints). The configuration properties that must be defined depend on the CARTO API version used:

* `apiVersion` (optional): API version. Default: `API_VERSIONS.V2`. Possible values are:
  * API_VERSIONS.V1
  * API_VERSIONS.V2
  * API_VERSIONS.V3 (**CARTO 3**)

If using API v1 or v2, the following properties are used:

* `username` (required): unique username in the platform
* `apiKey` (optional): api key. Default: `default_public`
* `region` (optional): region where the user database is located, possible values are `us` or `eu`. Default: `us`, only need to be specified if you've specifically requested an account in `eu`
* `mapsUrl` (optional): Maps API URL Template. Default: 
  * `https://{username}.carto.com/api/v1/map` for v1
  * `https://maps-api-v2.{region}.carto.com/user/{username}` for v2

If using API v3, these are the available properties:

* `apiBaseUrl` (required): base URL for requests to the API (can be obtained in the CARTO 3 Workspace)
* `accessToken` (required): token to authenticate/authorize requests to the Maps API (private datasets)
* `mapsUrl` (optional): Maps API URL Template. Default: 
  * `https://{apiBaseUrl}/v3/maps` 

If you have a custom CARTO deployment (on-premise user or you're running CARTO from [Google Cloud Marketplace](https://console.cloud.google.com/marketplace/product/cartodb-public/carto-enterprise-byol)), you need to set the URLs to point to your instance. 

```js
setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public',
  mapsUrl: 'https://<domain>/maps-v2/user/{user}',
});
```

### Support for other deck.gl layers

The CARTO submodule includes the CartoLayer that simplify interaction with the CARTO platform. If you want to use other deck.gl layers (i.e. ArcLayer, H3HexagonLayer...), there are two possibilities depending on the API version you are using:

* If you are using the API v3, you can directly retrieve the data in the format expected by the layer using the `getData` function:

    ```js
    import { getData } from '@deck.gl/carto';
    import { H3HexagonLayer } from '@deck.gl/geo-layers/';

    const data =  await getData({
      type: MAP_TYPES.QUERY,
      source: `SELECT bqcarto.h3.ST_ASH3(internal_point_geom, 4) as h3, count(*) as count
                  FROM bigquery-public-data.geo_us_census_places.us_national_places 
                GROUP BY h3`,
      connection: 'connection_name',
      format: 'json'
    });

    new H3HexagonLayer({
      data,
      filled: true,
      getHexagon: d => d.h3,
      getFillColor: d => [0, (1 - d.count / 10) * 255, 0],
      getLineColor: [0, 0, 0, 200],
    });
    ```

    The formats available are JSON, GEOJSON, TILEJSON and NDJSON. [NDJSON](http://ndjson.org/) (Newline Delimited JSON) allows to handle incremental data loading https://deck.gl/docs/developer-guide/performance#handle-incremental-data-loading.

* If not using the CARTO 3 API version, you can use the SQL API to retrieve the data in the required format. Please check the examples [here](https://docs.carto.com/deck-gl/examples/clustering-and-aggregation/h3-hexagon-layer/)

### Constants

To make it easier to work with the CARTO module the following constants are provided:

| ENUMERATION     | VALUES      |
| --------------- | ----------- |
| API_VERSIONS    | V1          |
|                 | V2          | 
|                 | V3          |
| MAP_TYPES       | QUERY       |       
|                 | TABLE       |
|                 | TILESET     |
| FORMATS         | GEOJSON     |
|                 | JSON        |
|                 | TILEJSON    |
|                 | NDJSON      |

