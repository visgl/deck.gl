This is a minimal standalone version of the TerrainLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

Elevation tiles from Mapterhorn require no access token. To load the satellite imagery, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash	
export MapboxAccessToken=<mapbox_access_token>	
```	

Or set `MAPBOX_TOKEN` directly in `app.tsx`.

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Data format

[Mapterhorn](https://mapterhorn.com/data-access/) supplies 512-pixel WebP elevation tiles in Terrarium encoding. The decoder converts RGB values to meters as `R * 256 + G + B / 256 - 32768`. Credit [Mapterhorn and its data sources](https://mapterhorn.com/attribution/) when using these tiles.

To use other data sources, check out
the [documentation of TerrainLayer](../../../docs/api-reference/geo-layers/terrain-layer.md).
