This is a standalone version of the TerrainExtension with a TerrainLayer with a GeoJSON layer on [deck.gl](http://deck.gl) website.

The example is showing a GeoJSONLayer with Tour de France cycling routes over a TerrainLayer.

### Usage

Copy the content of this folder to your project. The example uses public terrain and map tiles.

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Data format

[Mapterhorn](https://mapterhorn.com/data-access/) provides 512px WebP elevation tiles using the
Terrarium encoding. Its [TileJSON endpoint](https://tiles.mapterhorn.com/tilejson.json) describes
the URL template used by this example. See [Mapterhorn's attribution](https://mapterhorn.com/attribution/)
for the underlying terrain data sources.

The surface texture uses [VersaTiles satellite imagery](https://versatiles.org/sources/), which has
global coverage through zoom level 12.

To use other data sources, check out
the [documentation of TerrainLayer](../../../docs/api-reference/geo-layers/terrain-layer.md).

Data source for routes was prepared and processed using Tour de France GPX data freely available to download from https://www.cyclingstage.com/tour-de-france-2023-gpx/. 
