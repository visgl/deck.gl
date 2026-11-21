# Attribution

A small set of color-encoded DEM tiles for deck.gl render tests, downloaded from `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` on January 30th, 2023.

* Mapzen Terrain Tiles [license](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
* Amazon Open Data program [profile](https://registry.opendata.aws/terrain-tiles/)
* United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data
  courtesy of the U.S. Geological Survey.

The render fixtures use every second row and column of the source tiles. This
keeps the original encoded elevations at those grid points and reduces the
terrain mesh input to 128 × 128 samples per tile.
