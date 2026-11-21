This is a minimal standalone version of the GeoJsonLayer (Polygons) example
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

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/geojson), showing the property values of Vancouver. [Source](http://data.vancouver.ca/)

To use your own data, check out
the [documentation of GeoJsonLayer](../../../docs/api-reference/layers/geojson-layer.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)

### Full website dataset

This example loads the full website dataset with `GeoParquetLoader` from `@loaders.gl/tables/parquet`. The `parquet.shape: 'geojson-table'` option supplies GeoJSON features to `GeoJsonLayer`, preserving its styling and picking API. Geometry uses WKB with GeoParquet metadata and internal Zstd compression.

The 4,627 polygons retain `valuePerParcel`, `valuePerSqm`, and `growth` properties.

Standalone installations use deck.gl v10 and loaders.gl 5.0.0-rc.2; the package overrides keep the loader runtime aligned.
