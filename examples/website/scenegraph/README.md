This is a minimal standalone version of the ScenegraphLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

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

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
