This is a minimal standalone version of the LineLayer example
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

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/line), showing flight paths near the Heathrow Airport, captured via [the OpenSky Network](https://opensky-network.org/). [Airports data source](http://www.naturalearthdata.com/)

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

The internal `PolylineArrowLoader` also accepts a single ordinary encoded polyline
and supports `loadOptions: {polyline: {precision: 6}}` for polyline6. Both loaders
produce adjacent segments with fixed-size Float64 `start` and `end` columns,
ready for SQL accessors `start` and `"end"`. They parse the complete input in memory;
they do not provide streaming or worker execution.
