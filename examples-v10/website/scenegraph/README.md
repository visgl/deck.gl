This is a minimal standalone version of the ScenegraphLayer example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl checkout, run these commands in this example's directory.

```bash
yarn
yarn start-local
```

<!-- TODO(#11268): Switch to npm start when v10 is published. -->

### Data source

The 3D model is created by `manilov.ap`, modified for this application.
See [profile page on sketchfab](https://sketchfab.com/3d-models/boeing747-1a75633f5737462ebc1c7879869f6229),
licensed under [Creative Commons](https://creativecommons.org/licenses/by/4.0/).

The example tries to load live flight data from [Opensky Network](https://opensky-network.org)
and refreshes it every 60 seconds after a successful request. A browser network or CORS failure stops live polling. While live data is unavailable, it cycles through three bundled-data frames every five
seconds: the original snapshot and simulated positions extrapolated by 60 and 120 seconds
from speed and heading. The panel distinguishes live positions from simulated replay.

To use your own data, check out
the [documentation of ScenegraphLayer](../../../docs/api-reference/mesh-layers/scenegraph-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
