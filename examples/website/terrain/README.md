This is a minimal standalone version of the TerrainLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. The example uses public terrain and map tiles and
does not require an access token.

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
