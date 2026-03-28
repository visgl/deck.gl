# WebGPU

:::caution
WebGPU support in deck.gl v9 is still a work in progress and is not production ready.
:::

deck.gl is gradually adding support for running on WebGPU. Support is landing layer by layer and feature by feature.

This page is conservative and source-based:

- `✅` means the current tree contains an explicit WebGPU/WGSL implementation, or the API is a thin wrapper over one.
- `🚧` means some code paths work, but the full API surface is not yet ported.
- `❌` means there is no in-tree WebGPU implementation yet.

For composite and wrapper layers, statuses are based on their default or general rendering path, not on every possible custom sublayer configuration.

## Enabling WebGPU

deck.gl needs to be set up to use a luma.gl device that uses the luma.gl `webgpuAdapter`.

```ts
import {webgpuAdapter} from '@luma.gl/webgpu';

new Deck({
  deviceProps: {
    type: 'webgpu',
    adapters: [webgpuAdapter]
  }
});
```

## Layers

The table below covers the public layer exports from the layer packages. It is derived from the current source tree rather than the website badges, which may lag behind in-tree ports.

| Module | Layer | WebGL | WebGPU |
| --- | --- | --- | --- |
| `@deck.gl/layers` | `ArcLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `BitmapLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `IconLayer` | ✅ | ✅ |
| `@deck.gl/layers` | `LineLayer` | ✅ | ✅ |
| `@deck.gl/layers` | `PointCloudLayer` | ✅ | ✅ |
| `@deck.gl/layers` | `ScatterplotLayer` | ✅ | ✅ |
| `@deck.gl/layers` | `ColumnLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `GridCellLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `PathLayer` | ✅ | ✅ |
| `@deck.gl/layers` | `PolygonLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `GeoJsonLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `TextLayer` | ✅ | ❌ |
| `@deck.gl/layers` | `SolidPolygonLayer` | ✅ | ❌ |
| `@deck.gl/aggregation-layers` | `ScreenGridLayer` | ✅ | ❌ |
| `@deck.gl/aggregation-layers` | `HexagonLayer` | ✅ | ❌ |
| `@deck.gl/aggregation-layers` | `ContourLayer` | ✅ | ❌ |
| `@deck.gl/aggregation-layers` | `GridLayer` | ✅ | ❌ |
| `@deck.gl/aggregation-layers` | `HeatmapLayer` | ✅ | ❌ |
| `@deck.gl/mesh-layers` | `SimpleMeshLayer` | ✅ | ❌ |
| `@deck.gl/mesh-layers` | `ScenegraphLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `A5Layer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `GreatCircleLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `S2Layer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `QuadkeyLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `TileLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `TripsLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `H3ClusterLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `H3HexagonLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `Tile3DLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `TerrainLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `MVTLayer` | ✅ | ❌ |
| `@deck.gl/geo-layers` | `GeohashLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `ClusterTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `H3TileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `HeatmapTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `PointLabelLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `QuadbinTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `RasterTileLayer` | ✅ | ❌ |
| `@deck.gl/carto` | `VectorTileLayer` | ✅ | ❌ |

## Extensions

The table below covers the public extensions in `@deck.gl/extensions`. They all remain WebGL-only today because they rely on GLSL shader injections, GLSL-only shader modules, or extra render/picking passes that have not been ported to WebGPU.

| Module | Extension | WebGL | WebGPU |
| --- | --- | --- | --- |
| `@deck.gl/extensions` | `BrushingExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `DataFilterExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `Fp64Extension` | ✅ | ❌ |
| `@deck.gl/extensions` | `PathStyleExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `FillStyleExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `ClipExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `CollisionFilterExtension` | ✅ | ❌ |
| `@deck.gl/extensions` | `MaskExtension` | ✅ | ❌ |

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
| Picking | ❌ | `Deck` currently skips picking on WebGPU, including hover and click picking paths. |
| Shader hooks / layer extensions | ❌ | deck.gl's WGSL shader hook list is currently empty, so injection-based extensions are not yet portable. |
| GPU transforms | 🚧 | Underlying GPU transform APIs are evolving, but deck.gl still has transform-gated tests and no documented WebGPU support for transform-based workflows. |
| Attribute transitions | 🚧 | Some layers disable transitions on WebGPU, and transition utilities still contain WebGL-specific buffer read paths. |
| Base map overlays | ❌ | Transparent overlay integration still requires premultiplied-alpha work across deck and the base map stack. |
| Base map interleaving | ❌ | No current base map integration path supports WebGPU interleaving. |

## Background

While the visible WebGPU surface is still limited, much of the groundwork has already happened in luma.gl, the GPU framework powering deck.gl. deck.gl is following that work by porting its shader modules, layers, and render features incrementally.

## Participating

If you want to contribute to deck.gl WebGPU development, or just follow along, we have a dedicated channel in the OpenJS / Open Visualization slack community.

You can also check release tracker tasks and ongoing implementation work on GitHub.
