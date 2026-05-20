This is a minimal standalone version of the Multi-View example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
```

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/radio), showing radio stations and their service contour across the United State. [Source](https://www.fcc.gov)

To use your own data, check out the documentation of [MVTLayer](../../../docs/api-reference/geo-layers/mvt-layer.md) and [H3HexagonLayer](../../../docs/api-reference/geo-layers/h3-hexagon-layer.md).

For more information about using multiple views, see the [developer guide](../../../docs/developer-guide/views.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
