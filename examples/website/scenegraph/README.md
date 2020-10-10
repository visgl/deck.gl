This is a minimal standalone version of the ScenegraphLayer example
on [deck.gl](http://deck.gl) website.

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

### Data source

The 3D model is created by `manilov.ap`, modified for this application.
See [profile page on sketchfab](https://sketchfab.com/3d-models/boeing747-1a75633f5737462ebc1c7879869f6229),
licensed under [Creative Commons](https://creativecommons.org/licenses/by/4.0/).

The real-time flight information is from [Opensky Network](https://opensky-network.org).

To use your own data, check out
the [documentation of ScenegraphLayer](../../../docs/api-reference/mesh-layers/scenegraph-layer.md).
