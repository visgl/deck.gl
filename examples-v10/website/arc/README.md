This is a minimal standalone version of the ArcLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Run this example from a deck.gl checkout with `yarn start-local`. Its SQL accessors require the current repository source; the published `10.0.0-alpha.1` package predates that API. 

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/arc), showing county-to-county migration in the US. [Source](http://www.census.gov)

To use your own data, check out
the [documentation of ArcLayer](../../../docs/api-reference/layers/arc-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
### Full website dataset

This example loads the full website dataset with `GeoParquetLoader` from `@loaders.gl/tables/parquet`. The `parquet.shape: 'geojson-table'` option supplies GeoJSON features to `GeoJsonLayer`, preserving its styling and picking API. Geometry uses WKB with GeoParquet metadata and internal Zstd compression.

The 3,220 counties retain source order: migration map keys reference county row indices. Properties include `name`, `centroid`, and signed net `flows`.

Standalone installations use deck.gl v10 and loaders.gl 5.0.0-rc.2; the package overrides keep the loader runtime aligned.
