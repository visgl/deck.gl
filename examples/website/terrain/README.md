This is a minimal standalone version of the TerrainLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

To load the terrain tiles, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:	

```bash	
export MapboxAccessToken=<mapbox_access_token>	
```	

Or set `MAPBOX_TOKEN` directly in `app.js`.

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with webpack
npm start
```

### Data format

Mapbox's [terrain API](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb) encodes elevation data in raster tiles.

To use other data sources, check out
the [documentation of TerrainLayer](../../../docs/api-reference/geo-layers/terrain-layer.md).
