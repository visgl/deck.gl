# Tile2DHeader

`Tile2DHeader<DataT>` is a cache entry owned by [Tileset2D](./tileset-2d.md). The same header and decoded `content` are reused by every [Tile2DLayer](./tile-2d-layer.md) or [MVT2DLayer](./mvt-2d-layer.md) consumer selecting that tile. Applications normally receive it in `renderSubLayers`, tile callbacks, or picking info rather than instantiate it themselves.

```ts
import type {Tile2DHeader} from '@deck.gl/geo-layers';

function describeTile(tile: Tile2DHeader<ImageBitmap>) {
  return {id: tile.id, index: tile.index, loaded: tile.isLoaded, bounds: tile.boundingBox};
}
```

The `_Tile2DHeader` compatibility export references the same class. Its legacy render fields remain available, but new layers store sublayers and per-view flags in their own state.

## Properties

| Property | Meaning |
| --- | --- |
| `id` | Stable tile key produced by the tileset's `getTileId()` |
| `index` | Source index, normally `{x, y, z}` |
| `zoom` | Source zoom returned by `getTileZoom()` |
| `boundingBox` | Geographic or planar bounds as `[[minX, minY], [maxX, maxY]]` |
| `content` | Loaded `DataT` or `null`; may retain old content during reload |
| `data` | Content when settled, or a promise resolving to content while loading |
| `isLoaded` | Latest request settled and no reload is pending; failed requests can be settled with null content |
| `isLoading` | Request queued or in flight and not cancelled |
| `needsReload` | Content invalidated or request cancelled |
| `byteLength` | Byte length reported by content; supply finite byte lengths when using byte limits |
| `parent`, `children` | Nearest retained ancestor and descendant links rebuilt by the tileset |
| `userData` | Optional source/application metadata |

`bbox` is a deprecated structured-bounds alias; use `boundingBox` in new code. `isSelected`, `isVisible`, `state`, and `layers` are compatibility **default-view** fields. They do not describe new layers' independent views. Custom refinement callbacks receive view-local facades carrying their own mutable flags. Use tileset stats for shared visibility counts, not these legacy flags.

## Ownership

Treat IDs, bounds, links, and content as read-only inside rendering and picking callbacks. Mutating shared content affects every consumer. Store styling, interaction state, and rendered sublayers in the layer, not in the header.

The cache controls `loadData()`, `setNeedsReload()`, and `abort()`. Applications should normally use `tileset.reloadAll()` and `tileset.finalize()` rather than invoke header lifecycle methods. Eviction removes the header from the cache; owners are responsible for disposing application resources such as image bitmaps in unload/teardown handling.
