This is a minimal standalone version of the TripsLayer example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
```

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/trips), showing taxi trips in Manhattan. [Source](http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml)

To use your own data, check out
the [documentation of TripsLayer](../../../docs/api-reference/geo-layers/trips-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
