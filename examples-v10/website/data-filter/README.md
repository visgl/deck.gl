This is a minimal standalone version of the DataFilterExtension example
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

The website and standalone app load the same Zstandard-compressed Parquet table with 218,396 USGS earthquakes from 1979–2019. `timestamp` is Unix time in milliseconds, `depth` is kilometers, and coordinates are longitude/latitude in degrees. The time slider derives its range from the loaded Arrow table.

Data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/data-filter). Source: [USGS](https://earthquake.usgs.gov/).

To use your own data, check out
the [documentation of DataFilterExtension](../../../docs/api-reference/extensions/data-filter-extension.md).

### Basemap

The basemap in this example is provided by [OpenFreeMap](https://openfreemap.org/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)

