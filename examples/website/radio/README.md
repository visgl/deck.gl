This is a minimal standalone version of the Multi-View example
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

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/radio), showing radio stations and their service contour across the United State. [Source](https://www.fcc.gov)

To use your own data, check out the documentation of [MVTLayer](../../../docs/api-reference/geo-layers/mvt-layer.md) and [H3HexagonLayer](../../../docs/api-reference/geo-layers/h3-hexagon-layer.md).

For more information about using multiple views, see the [developer guide](../../../docs/developer-guide/views.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
