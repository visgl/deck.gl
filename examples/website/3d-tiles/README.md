This is a minimal standalone version of the Tile3DLayer example
on [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

To download the Cesium 3D tileset, you need a Cesium ion access token, and set it to `ION_TOKEN` in `app.jsx`.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
```

### Data format

Sample data is served by [Cesium ion](https://cesium.com/cesium-ion/).

To use your own data, check out the [documentation of Tile3DLayer](../../../docs/api-reference/geo-layers/tile-3d-layer.md)

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
