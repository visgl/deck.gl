This is a minimal standalone version of the TripsLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Run these commands in the example directory.

```bash
# install dependencies
npm install
# or
yarn
# serve the app against the local deck.gl source
yarn start-local
```

<!-- TODO(#11268): Switch to npm start when v10 is published. -->

### Data format

The example loads the full Manhattan taxi trip dataset from a single Parquet file.
The first row group stores shared route segments. The second stores trips with ordered
segment IDs and start and end times. The app reconstructs the paths and timestamps
and carries trails across the animation loop. [Original data source](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)

To use your own data, check out
the [documentation of TripsLayer](../../../docs/api-reference/geo-layers/trips-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
