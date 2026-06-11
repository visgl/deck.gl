This is a standalone version of the GlobeView terrain tile example using TerrainLayer
on the [deck.gl](http://deck.gl) website.

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

### Data Sources

The sample elevation tiles are loaded from the
[AWS Open Data Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) dataset.
The satellite texture is loaded from
[ArcGIS World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9).

To use your own data, check out
the [documentation of TerrainLayer](../../../docs/api-reference/geo-layers/terrain-layer.md).
