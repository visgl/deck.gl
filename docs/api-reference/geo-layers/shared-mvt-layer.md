# SharedMVTLayer (experimental)

`SharedMVTLayer` extends [SharedTile2DLayer](./shared-tile-2d-layer.md) with MVT decoding, tile transforms, clipping, geographic picking and feature-ID highlighting. It accepts MVT URL templates or an externally owned `SharedTileset2D` containing tile-local GeoJSON features.

Decoded tiles always use normalized local coordinates. Map consumers apply a tile transform; globe consumers reuse a cached WGS84 conversion. Switching views does not invalidate decoded content or fetch a tile again while it remains cached. Each consumer retains its own rendering layers and GPU attributes.

```typescript
import {_SharedMVTLayer as SharedMVTLayer, _SharedTileset2D as SharedTileset2D} from '@deck.gl/geo-layers';

const loader = new SharedMVTLayer({
  data: 'https://example.com/{z}/{x}/{y}.pbf'
});
const tileset = new SharedTileset2D(loader._getTilesetOptions());
const fills = new SharedMVTLayer({id: 'fills', data: tileset, filled: true});
const outlines = new SharedMVTLayer({id: 'outlines', data: tileset, filled: false});
```

The owner must call `tileset.finalize()` when all consumers are removed. Finalizing a consumer only detaches its view and subscriptions. Share a tileset only between consumers with the same source, decoder and fetch/load options. Replace it when those inputs change. The cache and request budget apply across all consumers, including consumers added after a request finishes.

This initial adapter uses GeoJSON decoding. Binary MVT data, TileJSON URL resolution and `getRenderedFeatures` are not supported. Resolve TileJSON to tile templates before creating the layer. For concurrent map and globe rendering, use separate `SharedMVTLayer` consumers backed by the same tileset. Geometry conversion supports all GeoJSON geometry types, including geometry collections. The adapter preserves buffered geometry on globes; it does not add far-side label occlusion.
