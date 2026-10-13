This experimental SharedTile2DLayer example feeds tiled BitmapLayer sublayers in overlapping
main and minimap views. Toggle "Share tile cache" to compare one SharedTileset2D with independent
caches. The displayed request and cached-tile counts reset on each toggle.

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

### Data Source

OpenStreetMap raster tiles from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

For more information, check out the
[documentation of SharedTile2DLayer](../../../docs/api-reference/geo-layers/shared-tile-2d-layer.md).
