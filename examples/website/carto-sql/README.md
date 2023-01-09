This is a minimal standalone version of the Carto Integration example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Connect your data

To connect your own data you need a CARTO account, if you don't have it yet, you can [create a new account](https://carto.com/signup) for free.

CARTO dashboard allows to upload your geospatial files (Shapefile, CSV, GeoJSON, KML, Geopackage...) by drag&drop. Check out [this guide to import data](https://carto.com/help/tutorials/import-data-guide). 

If you've your data in external services like BigQuery, Snowflake, Amazon RedShift, Google Drive, PostgreSQL...) you'll be interested in [connecting CARTO to your existing stack](https://carto.com/connect/).

Once you've your data plugged in you only need to set your credentials as follow:

```js
setDefaultCredentials({
  username: '<username>',
});
```

If you're dealing with private data and don't want to make it public outside of your map, you need to create an [API KEY](https://carto.com/help/getting-started/get-api-key/) and include it at your DefaultCredentials:

```js
setDefaultCredentials({
  username: '<username>',
  apiKey: '<api_key>
});
```

### API documentation

For more info check the [documentation of CartoLayer](../../../docs/api-reference/carto/carto-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
