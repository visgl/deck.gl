# WebGPU

Standalone Deck v10 prefers WebGPU. The tables below describe support by layer, extension, and feature.

This page is conservative and source-based:

- `✅ vX.Y` means the current tree contains an explicit WebGPU/WGSL implementation, or the API is a thin wrapper over one. The version identifies the first deck.gl minor release with full WebGPU support.
- `🚧` means some code paths work, but the full API surface is not yet ported.
- `❌` means there is no in-tree WebGPU implementation yet.

For composite and wrapper layers, statuses are based on their default or general rendering path, not on every possible custom sublayer configuration.

## Device selection and migration

When Deck creates its own device, it asks luma.gl for the best available adapter. The standard build includes WebGPU and WebGL2. luma.gl prefers WebGPU and uses WebGL2 when the WebGPU API is unavailable or the browser returns no WebGPU adapter. An explicit WebGPU request reports the error if no adapter is available. Device creation errors after acquiring an adapter are reported for either selection mode. An application-supplied device or WebGL context takes precedence.

To request a specific backend, pass `deviceProps.type`:

```ts
new Deck({deviceProps: {type: 'webgl'}}); // Request WebGL2
new Deck({deviceProps: {type: 'webgpu'}}); // Require WebGPU
```

The [WebGL-only build](./building-apps.md) defaults to WebGL2. Read `device.type` in `onDeviceInitialized` to see which backend a running application uses.

- **Render callbacks.** Use `onDeviceInitialized` for either backend. WebGPU skips `onWebGLInitialized` and supplies no `gl` to `onBeforeRender` or `onAfterRender`.
- **Picking.** WebGPU requires asynchronous picking and rejects `pickAsync: 'sync'`. Use `await deck.pickObjectAsync(...)` for one object and `await deck.pickObjectsAsync(...)` for a rectangle. Applications that depend on synchronous or multi-depth picking can explicitly request WebGL2.
- **Layers and effects.** Check the tables below for the layers, transitions and effects your application uses. Some CARTO layers, attribute transitions, shadows and postprocessing have backend-specific limitations.
- **Custom shaders and binary data.** Custom layers need WGSL implementations and compatible extension hooks. Test application-supplied buffer layouts on WebGPU, especially external float64 buffers and packed attributes.
- **Map integrations.** Mapbox, MapLibre and Google Maps overlays default to WebGL2 when creating their own device to support synchronous picking. Interleaved integrations use the rendering context supplied by the host map.

## Layers

The table below covers the public layer exports from the layer packages. It is derived from the current source tree rather than the website badges, which may lag behind in-tree ports.

| Module | Layer | WebGL | WebGPU |
| --- | --- | --- | --- |
| `@deck.gl/layers` | `ArcLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `BitmapLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `IconLayer` | ✅ | ✅ v9.3 |
| `@deck.gl/layers` | `LineLayer` | ✅ | ✅ v9.2 |
| `@deck.gl/layers` | `PointCloudLayer` | ✅ | ✅ v9.2 |
| `@deck.gl/layers` | `ScatterplotLayer` | ✅ | ✅ v9.2 |
| `@deck.gl/layers` | `ColumnLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `GridCellLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `PathLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `PolygonLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `GeoJsonLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `TextLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/layers` | `SolidPolygonLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/aggregation-layers` | `ScreenGridLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/aggregation-layers` | `HexagonLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/aggregation-layers` | `ContourLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/aggregation-layers` | `GridLayer` | ✅ | ✅ v9.4  |
| `@deck.gl/aggregation-layers` | `HeatmapLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/mesh-layers` | `SimpleMeshLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/mesh-layers` | `ScenegraphLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `A5Layer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `GreatCircleLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `S2Layer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `QuadkeyLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `TileLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `TripsLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `H3ClusterLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `H3HexagonLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `Tile3DLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `TerrainLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `MVTLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/geo-layers` | `GeohashLayer` | ✅ | ✅ v9.4 |
| `@deck.gl/carto` | `ClusterTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `H3TileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `HeatmapTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `PointLabelLayer` | ✅ | 🚧 |
| `@deck.gl/carto` | `QuadbinTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `RasterTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `VectorTileLayer` | ✅ | ❌ |

`GeoJsonLayer` supports polygon, line, and text point rendering on WebGPU. `TextLayer` supports glyph rendering and text backgrounds. The `PointLabelLayer` render suite covers label backgrounds and collision filtering on WebGPU.

- `S2Layer`, `QuadkeyLayer`, and `GeohashLayer` inherit their WebGPU rendering from `PolygonLayer`, including extruded, stroked, and wireframe cells.
- `H3HexagonLayer` supports both its high-precision `PolygonLayer` path and its instanced `ColumnLayer` path on WebGPU. 
- `H3ClusterLayer` renders through the polygon path.
- `A5Layer` inherits its WebGPU rendering from `PolygonLayer` and supports both bigint and hexadecimal A5 cell identifiers.
- `Tile3DLayer` supports point-cloud, glTF scenegraph, and I3S mesh tile content on WebGPU.

ScreenGridLayer and GridLayer can aggregate on the GPU with automatic domains and picking
metadata. GridLayer also supports percentile filtering and quantile/ordinal color scales.
CPU-facing metadata uses asynchronous snapshots; explicit-domain rendering without picking
or distribution scales keeps the result path on the GPU.

## Extensions

The table below covers the public extensions in `@deck.gl/extensions`. All listed extensions support WebGPU. Custom shaders need compatible hooks. ScreenGridLayer and GridLayer execute compatible extension hooks on input points before reduction; DataFilterExtension filtering and ClipExtension are covered by aggregation regression tests.

| Module | Extension | WebGL | WebGPU |
| --- | --- | --- | --- |
| `@deck.gl/extensions` | `BrushingExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `DataFilterExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `Fp64Extension` | ✅ | ✅ |
| `@deck.gl/extensions` | `PathStyleExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `FillStyleExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `ClipExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `CollisionFilterExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `MaskExtension` | ✅ | ✅ |
| `@deck.gl/extensions` | `TerrainExtension` | ✅ | ✅ |

`TerrainExtension` supports both `terrainDrawMode` values on WebGPU. Terrain sources used for offset fitting must report their elevation range. See the [terrain extension reference](../api-reference/extensions/terrain-extension.md#limitations).

## Effects

The table below covers the public effect classes exported by `@deck.gl/core`.

| Module | Effect | WebGL | WebGPU | Notes |
| --- | --- | --- | --- | --- |
| `@deck.gl/core` | `LightingEffect` | ✅ | 🚧 | Material lighting modules have WGSL support, but the shadow path still depends on the GLSL-only `shadow` shader module. |
| `@deck.gl/core` | `PostProcessEffect` | ✅ | ❌ | The current screen-pass chain is still generated from GLSL fragment shader templates and is not WebGPU-ready as a supported deck.gl feature. |

## Features

| Feature | Status | Comment |
| --- | --- | --- |
| Views | 🚧 | The core `project` and `project32` shader modules have WGSL ports, so standard view/projection paths should work. |
| Picking | ✅ | `Deck` does **async** picking on WebGPU, including hover and click picking paths. |
| Built-in layer extensions | ✅ | See the [extension compatibility table](#extensions). |
| Custom layer shaders | 🚧 | To use extensions, declare compatible [WGSL shader hooks](./custom-layers/layer-extensions.md#webgpu-shader-plugins). |
| GPU transforms | 🚧 | Underlying GPU transform APIs are evolving, but deck.gl still has transform-gated tests and no documented WebGPU support for transform-based workflows. |
| Constant attributes | ✅  | `AttributeManager` now materializes constant attributes into full buffers on WebGPU as a compatibility path for layers that rely on constant accessors. |
| Attribute transitions | 🚧 | Some layers disable transitions on WebGPU, and transition utilities still contain WebGL-specific buffer read paths. |
| Base map overlays |  🚧 | Transparent overlay integration still requires premultiplied-alpha work across deck and the base map stack. |
| Base map interleaving | ❌ | No current base map integration path supports WebGPU interleaving. |

## Background

While the visible WebGPU surface is still limited, much of the groundwork has already happened in luma.gl, the GPU framework powering deck.gl. deck.gl is following that work by porting its shader modules, layers, and render features incrementally.

## Participating

If you want to contribute to deck.gl WebGPU development, or just follow along, we have a dedicated channel in the OpenJS / Open Visualization slack community.

You can also check release tracker tasks and ongoing implementation work on GitHub.
