This is a minimal standalone version of the GeoJsonLayer (Paths) example
on [deck.gl](http://deck.gl) website.

### Usage

Run this example from a deck.gl checkout. It uses the repository’s experimental GeoArrowLayer.

```bash
# install dependencies
npm install
# or
yarn
# run with the local deck.gl source
yarn start-local
```

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/highway), showing fatal accidents on U.S. highways. [Source](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars)

To use your own data, check out
the [documentation of GeoJsonLayer](../../../docs/api-reference/layers/geojson-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)

### Full website dataset

This example loads the full website dataset with `GeoParquetLoader` from `@loaders.gl/tables/parquet`. The loader returns an Arrow table for the experimental `GeoArrowLayer`, which returns the source Arrow row when picked. Geometry uses WKB with GeoParquet metadata and internal Zstd compression.

The 20,592 road features retain all LineString and MultiLineString paths. `CSVLoader` loads all 29,342 accident records into an Arrow table from `accidents-full.csv`; year controls aggregate these records by road.
