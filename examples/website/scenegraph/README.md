This is a minimal standalone version of the ScenegraphLayer example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
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
