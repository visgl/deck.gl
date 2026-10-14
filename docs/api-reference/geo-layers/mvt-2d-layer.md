# MVT2DLayer

`MVT2DLayer` is the MVT layer API for new applications. It extends [Tile2DLayer](./tile-2d-layer.md) with MVT decoding, tile transforms, clipping, geographic picking and feature-ID highlighting. It accepts MVT URL templates or an externally owned `Tileset2D` containing tile-local GeoJSON features. The existing [MVTLayer](./mvt-layer.md) remains available for applications requiring its binary data, TileJSON, or rendered-feature APIs while feature parity is completed.

Decoded tiles always use normalized local coordinates. Map consumers apply a tile transform; globe consumers and low-zoom map extrusions use WGS84 geometry so heights scale at each vertex's latitude. Switching views does not invalidate decoded content or fetch a tile again while it remains cached. Each consumer retains its own rendering layers and GPU attributes.

```typescript
import {MVT2DLayer, Tileset2D} from '@deck.gl/geo-layers';

const loader = new MVT2DLayer({
  data: 'https://example.com/{z}/{x}/{y}.pbf'
});
const tileset = new Tileset2D(loader._getTilesetOptions());
const fills = new MVT2DLayer({id: 'fills', data: tileset, filled: true});
const outlines = new MVT2DLayer({id: 'outlines', data: tileset, filled: false});
```

The owner must call `tileset.finalize()` when all consumers are removed. Finalizing a consumer only detaches its view and subscriptions. Share a tileset only between consumers with the same source, decoder and fetch/load options. Replace it when those inputs change. The cache and request budget apply across all consumers, including consumers added after a request finishes.

This initial adapter uses GeoJSON decoding. Binary MVT data, TileJSON URL resolution and `getRenderedFeatures` are not supported. Resolve TileJSON to tile templates before creating the layer. For concurrent map and globe rendering, use separate `MVT2DLayer` consumers backed by the same tileset. Geometry conversion supports all GeoJSON geometry types, including geometry collections. The adapter preserves buffered geometry on globes; it does not add far-side label occlusion.
