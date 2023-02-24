This is a standalone version of the TextLayer example on [deck.gl](http://deck.gl) website.

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

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/text-layer), showing all cities with a population > 1000 or seats of administration.

The dataset is created by [GeoNames](https://data.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000%40public/information/?disjunctive.cou_name_en) under the CC BY 4.0 license. Accessed on February 9, 2023.

To use your own data, check out
the [documentation of TextLayer](../../../docs/api-reference/layers/text-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
