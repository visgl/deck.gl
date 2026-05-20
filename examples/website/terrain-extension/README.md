This is a standalone version of the TerrainExtension with a TerrainLayer with a GeoJSON layer on [deck.gl](http://deck.gl) website.

The example is showing a GeoJSONLayer with Tour de France cycling routes over a TerrainLayer.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

To load the terrain tiles, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:	

```bash	
export MapboxAccessToken=<mapbox_access_token>	
```	

Or set `MAPBOX_TOKEN` directly in `app.jsx`.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
```

### Data format

Mapbox's [terrain API](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb) encodes elevation data in raster tiles.

To use other data sources, check out
the [documentation of TerrainLayer](../../../docs/api-reference/geo-layers/terrain-layer.md).

Data source for routes was prepared and processed using Tour de France GPX data freely available to download from https://www.cyclingstage.com/tour-de-france-2023-gpx/. 
