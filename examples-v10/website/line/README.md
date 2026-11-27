This is a minimal standalone version of the LineLayer example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl checkout, run these commands in this example's directory.

```bash
yarn
yarn start-local
```

<!-- TODO(#11268): Switch to npm start when v10 is published. -->

### Data format

The [flight path dataset](https://github.com/visgl/deck.gl-data/blob/master/website/flight-path-data.txt)
contains flights near Heathrow Airport from the [OpenSky Network](https://opensky-network.org/).
[Airport data source](https://www.naturalearthdata.com/).

To use your own data, check out
the [documentation of LineLayer](../../../docs/api-reference/layers/line-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)

### Arrow loading

The example loads the full `website/flight-path-data.txt` dataset directly into an
Arrow table with `FlightPathArrowLoader`. The file wraps Google encoded polylines
(the format supported by Mapbox's polyline library) in tab-separated flight name,
country, position and altitude fields. Positions use five decimal places and the
paired altitude stream uses one. Separate paths never produce connecting segments.

The loader produces adjacent segments with fixed-size Float64 `start` and `end` columns.
It parses the complete input in memory.
