This is a minimal standalone version of the IconLayer example
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

The website and standalone app load the same Zstandard-compressed Parquet table with all 45,716 meteorites. `coordinates` is a fixed-size longitude/latitude pair; zero denotes an unknown year. The unclustered layer uses Arrow columns. Clustering materializes GeoJSON features for Supercluster.

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/icon), showing information of meteorite landings. [Source](https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh) 

To use your own data, check out
the [documentation of IconLayer](../../../docs/api-reference/layers/icon-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
