This is a standalone demo of the [scenegraph layer](./scenegraph-layer) built upon [deck.gl](http://deck.gl). This example illustrates the scenegraph layer features.

### Usage

Copy the content of this folder to your project. 

To see the base map, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.js`.

Other options can be found at [using with Mapbox GL](../../../docs/get-started/using-with-mapbox-gl.md).

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with webpack
npm start
```

### Model

Model by `manilov.ap`, modified for the application.

Original: https://sketchfab.com/3d-models/boeing747-1a75633f5737462ebc1c7879869f6229

[CC Attribution](https://creativecommons.org/licenses/by/4.0/)

### Data source

The data is from [Opensky Network](https://opensky-network.org).
