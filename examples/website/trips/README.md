This is a minimal standalone version of the TripsLayer example
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

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/trips), showing taxi trips in Manhattan. [Source](http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml)

To use your own data, check out
the [documentation of TripsLayer](../../../docs/api-reference/geo-layers/trips-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
