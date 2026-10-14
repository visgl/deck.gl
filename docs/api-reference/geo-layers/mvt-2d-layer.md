# MVT2DLayer

import {MVT2DLayerDemo} from '@site/src/doc-demos/mvt-2d-layer';

<MVT2DLayerDemo />

`MVT2DLayer` is the MVT layer API for new applications. It extends [Tile2DLayer](./tile-2d-layer.md) with MVT decoding, tile transforms, clipping, geographic picking and feature-ID highlighting. It accepts MVT URL templates or an externally owned `Tileset2D` containing tile-local GeoJSON features. The existing [MVTLayer](./mvt-layer.md) remains available for applications requiring its binary data, TileJSON, or rendered-feature APIs while feature parity is completed.

Decoded tiles always use normalized local coordinates. Map consumers apply a tile transform; globe consumers and low-zoom map extrusions use WGS84 geometry so heights scale at each vertex's latitude. Switching views does not invalidate decoded content or fetch a tile again while it remains cached. Each consumer retains its own rendering layers and GPU attributes.

```typescript
import {MVT2DLayer, Tileset2D} from '@deck.gl/geo-layers';
import type {MVT2DData} from '@deck.gl/geo-layers';

const loader = new MVT2DLayer({
  data: 'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
});
const tileset = new Tileset2D<MVT2DData>({
  getTileData: tile => loader.getTileData(tile),
  minZoom: 0,
  maxZoom: 14
});
const fills = new MVT2DLayer({
  id: 'fills', data: tileset, filled: true, stroked: false,
  getFillColor: [190, 210, 225], pickable: true
});
const outlines = new MVT2DLayer({
  id: 'outlines', data: tileset, filled: false, stroked: true,
  getLineColor: [40, 65, 85], lineWidthMinPixels: 1
});
```

The unmounted `loader` supplies its public `getTileData()` method; no private layer state or initialization is required. It always decodes local GeoJSON coordinates. Its `fetch`, `loaders`, and `loadOptions` determine the shared content. Styled consumers use only the external tileset; changing their fetch options does not change the owner's decoder.

The owner must call `tileset.finalize()` when all consumers are removed. Finalizing a consumer only detaches its view and subscriptions. Share a tileset only between consumers with the same source, decoder and fetch/load options. Replace it when those inputs change. The cache and request budget apply across all consumers, including consumers added after a request finishes.

## Properties

Inherits the [Tile2DLayer props](./tile-2d-layer.md#properties) and [GeoJsonLayer styling/accessors](../layers/geojson-layer.md#properties), including `extruded`, `getElevation`, fills, strokes, and point/text styling.

### `data` (string | string[] | Tileset2D | TileSource, optional) {#data}

For URL templates, the layer owns its tileset and uses the default MVT loader. For an external tileset or TileSource, content must already be an `MVT2DData` array of GeoJSON features in normalized **tile-local** coordinates. Geographic GeoJSON or binary feature tables are not interchangeable with this format. MVT decoding is not applied again to source-owned data.

### `uniqueIdProperty` (string, optional) {#uniqueidproperty}

- Default: `''`

Feature property used to identify matching features across tiles. When empty, uses the GeoJSON feature's `id`. MVT source-layer name (`properties.layerName`) distinguishes equal IDs from different source layers during hover highlighting.

### `highlightedFeatureId` (string | number | null, optional) {#highlightedfeatureid}

- Default: `null`

Explicit ID to highlight in this consumer. Takes precedence over hover highlighting when set. Use the same value across styled layers to synchronize a selection; leave hover state local to each layer when independent interaction is desired.

### `getTileData` (Function, optional) {#gettiledata}

Overrides URL-template loading. Return tile-local GeoJSON arrays, not geographic geometry or encoded protobuf. The public `layer.getTileData(tileLoadProps)` method can also load and decode data for an externally owned tileset, as shown above.

### `loadOptions` (Object, optional) {#loadoptions}

Passes options to loaders.gl for URL-template loading. The layer enforces `mvt.coordinates: 'local'`, `mvt.shape: 'geojson-table'`, and the requested `mvt.tileIndex`, then normalizes the decoded table to its feature array. Supply decoding options on the shared cache owner's loader rather than on each consumer.

## Multiple Views

For simultaneous map and globe rendering, use separate `MVT2DLayer` instances backed by the same tileset and scope them with `viewIds`. Tile-local and geographic rendering need different sublayers, but use the same decoded cache:

```ts
const mapLayer = new MVT2DLayer({id: 'map-tiles', data: tileset, viewIds: ['map']});
const globeLayer = new MVT2DLayer({id: 'globe-tiles', data: tileset, viewIds: ['globe']});
```

One layer can serve several views using the same projection/rendering mode. A layer switching from map to globe and back invalidates its rendered geometry but does not decode again while the content remains cached. Map extrusions below zoom 12 use geographic geometry for latitude-correct meter heights, including off-center features.

## Picking and Highlighting

`getPickingInfo()` returns geographic GeoJSON geometry regardless of whether the picked sublayer uses local or geographic coordinates. It determines conversion from the **picked sublayer**, not the current view, so picks during projection transitions are not converted twice. Decoded content is never mutated by picking or highlighting. Picking info also includes `tile`, `sourceTile`, and `sourceTileSubLayer` from `Tile2DLayer`.

`autoHighlight` and `highlightColor` work per consumer. Highlight indices are resolved against the actual sublayer data, including filtered data returned by a custom `renderSubLayers`. Shared feature IDs do not imply shared hover state.

## Compatibility

Binary MVT data, TileJSON URL resolution, and `getRenderedFeatures` are not yet supported by `MVT2DLayer`. Resolve TileJSON to tile templates before creating the layer. Continue using [MVTLayer](./mvt-layer.md) when an existing app requires those APIs. Migration for the common URL-template path is an import/constructor change; review these differences before replacing a specialized subclass.

Geometry conversion supports GeoJSON geometry collections. Buffered geometry is preserved on globes; the layer does not add far-side label occlusion. Owners remain responsible for source attribution. The raster [shared-tileset example](/examples/shared-tile-2d-layer) demonstrates the same cache ownership and multi-view architecture used here.
