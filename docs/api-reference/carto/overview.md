# @deck.gl/carto

The preferred and official solution for creating modern web apps using the [CARTO Location Intelligence platform](https://carto.com/) is deck.gl. The CARTO platform provides cloud native integrations with Google BigQuery, Amazon Redshift, Snowflake and PostgreSQL-compatible databases.

With deck.gl and the CARTO platform you can access directly your datasets and tilesets hosted in cloud native data platforms. It supports both medium-size (up to 50 MB) datasets using the GeoJSON format and very large datasets using vector tiles from pre-generated tilesets.

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/osm_buildings.jpg" />

It integrates with the [CARTO Maps API](https://carto.com/developers/maps-api/reference/) to:

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

## Usage

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials, MAP_TYPES} from '@deck.gl/carto';

setDefaultCredentials({
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

### Examples

You can see real examples for the following:

* [Scripting](https://carto.com/developers/deck-gl/examples/): Quick scripting examples to play with the module without NPM or Webpack. If you're not a web developer, this is probably what you're looking for.

* [React](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/react): integrate in a React application.

* [Pure JS](https://github.com/CartoDB/viz-doc/tree/master/deck.gl/examples/pure-js): integrate in a pure js application, using webpack.


### CARTO configuration object

This is an object to define the configuration to use in order to connect to the CARTO platform. The configuration properties that must be defined depend on the CARTO API version used:

* `apiVersion` (optional): API version. Default: `API_VERSIONS.V2`. Possible values are:
  * API_VERSIONS.V1
  * API_VERSIONS.V2
  * API_VERSIONS.V3

If using API v1 or v2, the following properties are used:

* `username` (required): unique username in the platform
* `apiKey` (optional): api key. Default: `default_public`
* `region` (optional): region where the user database is located, possible values are `us` or `eu`. Default: `us`, only need to be specified if you've specifically requested an account in `eu`
* `sqlUrl` (optional): SQL API URL Template. Default: `https://{user}.carto.com/api/v2/sql`

If using API v3, these are the available properties:

* `accessToken` (required): token to authenticate/authorize requests to the Maps API
* `apiBaseUrl` (required): base URL for requests to the API (can be obtained in the CARTO Cloud Native Workspace)

The following properties are available with all the API versions:

* `mapsUrl` (optional): Maps API URL Template. Default: 
  * `https://{username}.carto.com/api/v1/map` for v1
  * `https://maps-api-v2.{region}.carto.com/user/{username}` for v2
  * `https://{apiBaseUrl}/v3/maps` for v3

If you have a custom CARTO deployment (on-premise user or you're running CARTO from [Google Cloud Marketplace](https://console.cloud.google.com/marketplace/product/cartodb-public/carto-enterprise-byol)), you need to set the URLs to point to your instance. 

```js
setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public',
  mapsUrl: 'https://<domain>/user/{user}/api/v2/map',
  sqlUrl: 'https://<domain>/user/{user}/api/v2/sql',
});
```

### Working with Tilesets and Maps API v2

You can visualize public tilesets created in BigQuery with the default credentials, but if you want to use private tilesets, you first need to create a BigQuery connection in the CARTO dashboard with access to the tileset table. Then you need to create an API key with access to the Maps API and use it in the configuration object.

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
