This is a minimal standalone version of the 3D Tile example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

To see the base map, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.js`.

Other options can be found at [using with Mapbox GL](../../../docs/get-started/using-with-mapbox-gl.md).

To download the Cesium 3D tileset, you need a Cesium ion access token, and set it to `ION_TOKEN` in `app.js`.

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with webpack
npm start
```

### Data format

Sample data is stored in Cesium ion server. To use your own data, checkout the [documentation of Tile3DLayer](../../../docs/layers/tile-3d-layer.md)
