This is a minimal standalone version of the LineLayer example
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

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/line), showing flight paths near the Heathrow Airport, captured via [the OpenSky Network](https://opensky-network.org/). [Airports data source](http://www.naturalearthdata.com/)

To use your own data, check out
the [documentation of LineLayer](../../../docs/api-reference/layers/line-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
