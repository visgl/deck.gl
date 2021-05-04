# @deck.gl/carto

Deck.gl is the preferred and official solution for creating modern web apps using the [CARTO Location Intelligence platform](https://carto.com/)

<img src="https://raw.githubusercontent.com/CartoDB/viz-doc/master/deck.gl/img/osm_buildings.jpg" />


It integrates with the [CARTO Maps API](https://carto.com/developers/maps-api/reference/) to:

* Provide a geospatial backend storage for your geospatial data.
* Visualize large datasets which do not fit within browser memory.
* Provide an SQL spatial interface to work with your data.


## Install package

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/carto
```

## Usage

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setConfig, MAP_TYPES} from '@deck.gl/carto';

setConfig({
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.SQL,
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 0.75],
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

This is an object to define the configuration to use in order to connect to the CARTO platform. The configuration properties that must be defined depend on the CARTO Maps API version used:

* `apiVersion` (optional): Maps API version. Default: API_VERSIONS.V2

If using Maps API v1 or v2, the following properties are used:

* `username` (required): unique username in the platform
* `apiKey` (optional): api key. Default: `default_public`
* `region` (optional): region where the user database is located, possible values are `us` or `eu`. Default: `us`, only need to be specified if you've specifically requested an account in `eu`
* `sqlUrl` (optional): SQL API URL Template. Default: `https://{user}.carto.com/api/v2/sql`

If using Maps API v3, these are the available properties:

* `email` (required): email associated to the CARTO user with access to the datasets
* `token` (required): token to authenticate/authorize requests to the Maps API
* `tenant` (optional): tenant where the CARTO instance is located. Default: `gcp-us-east1.app.carto.com`

The following properties are available with all the Maps API versions:

* `mapsUrl` (optional): Maps API URL Template. Default: 
  * `https://{username}.carto.com/api/v1/map` for v1
  * `https://maps-api-v2.{region}.carto.com/user/{username}` for v2
  * `https://maps-{tenant}` for v3

If you have a custom CARTO deployment (on-premise user or you're running CARTO from [Google Cloud Marketplace](https://console.cloud.google.com/marketplace/product/cartodb-public/carto-enterprise-byol)), you need to set the URLs to point to your instance. 

```js
setConfig({
  username: 'public',
  apiKey: 'default_public',
  mapsUrl: 'https://<domain>/user/{user}/api/v2/map',
  sqlUrl: 'https://<domain>/user/{user}/api/v2/sql',
});
```

### Constants

To make it easier to work with the CARTO module the following constants are provided:

| ENUMERATION     | VALUES      |
| --------------- | ----------- |
| API_VERSIONS    | V1          |
|                 | V2          | 
|                 | V3          |
| MAP_TYPES       | SQL         |       
|                 | TABLE       |
|                 | TILESET     |
| PROVIDERS       | BIGQUERY    |
|                 | SNOWFLAKE   |
|                 | REDSHIFT    |
|                 | POSTGRES    |
| FORMATS         | GEOJSON     |
|                 | NDJSON      |
|                 | TILEJSON    |
