This is a standalone version of the TextLayer example on [deck.gl](http://deck.gl) website.

### Usage

This example requires deck.gl v10. npm overrides and Yarn resolutions keep loaders.gl core and table loaders on matching prerelease versions.

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

The website and standalone app load the same Zstandard-compressed Parquet table with 140,867 cities. Coordinates retain their original precision and signed latitudes. `ParquetLoader` returns an Arrow table; TextLayer reads its rows directly.

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/text-layer), showing all cities with a population > 1000 or seats of administration.

The dataset is created by [GeoNames](https://data.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000%40public/information/?disjunctive.cou_name_en) under the CC BY 4.0 license. Accessed on February 9, 2023.

To use your own data, check out
the [documentation of TextLayer](../../../docs/api-reference/layers/text-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
