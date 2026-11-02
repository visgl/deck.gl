This is a minimal standalone version of the GridLayer zoom bands example
on [deck.gl](http://deck.gl) website.

It stacks several `GridLayer`s with progressively finer cell sizes, and a `ScatterplotLayer` with
the raw points, and crossfades between them as the map zooms in. This is the deck.gl equivalent of
the MapLibre pattern of zoom-dependent layers driven by
`["interpolate", ["linear"], ["zoom"], ...]` expressions, built only from existing layer props:

- Cell sizes are powers of two, so each cell splits into exactly four cells in the next band.
- A small `interpolateZoom` helper computes each layer's `opacity` from the current zoom. Each band
  is centered on the zoom where its cells are about `cellPixels` wide on screen.
- All layers stay in the layer list. Layers with zero opacity are hidden with `visible: false`,
  which keeps their aggregation results, so zooming never re-aggregates the data.
- Only the dominant band is `pickable`.
- All layers read positions from one shared `Float64Array`, supplied as a binary attribute. Each
  layer still uploads its own GPU copy. The array is 64-bit because that is the layout GridLayer's
  GPU aggregation expects for `getPosition`.
- Aggregation runs once per band, the first time the band becomes visible. Later zooming only
  changes `opacity`, which is cheap.

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

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/scatterplot), showing ~200,000 street trees in Paris. [Source](https://opendata.paris.fr/explore/dataset/les-arbres/)

To use your own data, fill `positions` with `[longitude, latitude, 0]` triplets and adjust
`CELL_SIZES` and `INITIAL_VIEW_STATE`. The pattern works best with data that spans a wide zoom
range, e.g. millions of points from the [NYC TLC trip records](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
or [Overture Places](https://docs.overturemaps.org/guides/places/). Note that `GridLayer` GPU
aggregation allocates a bin for every cell within the data bounds, so the finest band's cell size
should keep `(extent / cellSize)²` in the low millions. Switch to the raw points below that.

To learn more about the layers, check out the documentation of
[GridLayer](../../../docs/api-reference/aggregation-layers/grid-layer.md) and
[ScatterplotLayer](../../../docs/api-reference/layers/scatterplot-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
