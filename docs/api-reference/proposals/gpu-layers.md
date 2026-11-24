# GPU layers

Reusable deck.gl layers for geographic rendering that consume caller-owned GPU buffers.

## Spatial points

## GPUVector layer core

The GPU layer family defines the rendering ABI below Arrow, classic JavaScript, and classic binary
inputs. It consumes caller-owned GPU data, does not import Apache Arrow, and never destroys input
vectors.

The fixed-width primitives are `GPUArcLayer`, `GPUColumnLayer`, `GPUGridCellLayer`, `GPUIconLayer`,
`GPULineLayer`, `GPUPointCloudLayer`, and `GPUScatterplotLayer`. They consume row-aligned
`GPUVector` objects. Each layer owns one `GPUVectorModel`, which preserves every physical chunk as
a separate draw call without creating a model or deck child layer per chunk. `GPUBitmapLayer`
accepts an already loaded `Texture`; a bitmap has no tabular column to convert.
`GPUIconLayer.getSize` is the icon height in pixels, matching the standard IconLayer
default. Atlas frame dimensions and anchor offsets scale relative to that height.

```ts
import {GPUScatterplotLayer} from '@deck.gl/proposals/layers';

const layer = new GPUScatterplotLayer({
  id: 'points',
  getPosition: positions, // GPUVector<'float32x2'>
  getRadius: radii, // number or GPUVector<'float32'>
  getFillColor: colors // Color or GPUVector<'unorm8x4'>
});
```

All non-constant vectors must have identical row counts and physical chunk boundaries. This makes
streaming and ownership deterministic: adapters append batches explicitly, while the renderer
neither combines nor repacks them. Picking uses global row indices and attaches physical batch
provenance as `PickingInfo.gpuVector`.

GeoJSON and GeoArrow are source formats rather than rendering primitives. Their adapters split
features into these GPU cores. The same rule applies to future classic JavaScript and classic
binary compatibility: each input family converts or borrows GPUVectors and delegates to the same
renderer.

`LuSpatialPointLayer` binds caller-owned position and point-ID buffers directly and replays a
caller-owned `DrawCommandBuffer`. The layer owns only its render model and style-uniform buffer;
query results, indirect commands, and source positions remain owned by the application.

The command buffer must use the non-indexed `draw` layout. Its selected record keeps
`vertexCount: 6` and `firstVertex: 0`; GPU queries normally update only `instanceCount`.

The root layer entry point deliberately does not import Arrow, GeoArrow, or the luSpatial query
algorithms. Applications can produce the fixed-width buffers with any ingestion and query pipeline;
the optional query entry point described below supplies one reusable geographic workflow.

```ts
import {LuSpatialPointLayer} from '@deck.gl/proposals/layers';

const layer = new LuSpatialPointLayer({
  id: 'selected-points',
  pickable: true,
  positions,
  pointIds: selectedPointIds,
  drawCommands,
  commandIndex: 0,
  color: [60, 220, 245, 210],
  radiusPixels: 1.5,
  radiusScale: viewport => Math.max(1, 2 ** ((viewport.zoom - 12) * 0.15)),
  highlightRadiusScale: 1.5
});
```

`positions` contains packed `vec2<f32>` rows interpreted through the layer's Deck coordinate
settings. `pointIds` contains `u32` row indices into that buffer. Picking returns those row indices
through Deck's normal `PickingInfo.index` field, so an application can map them to its own source
metadata without a readback.

Deck's RGB24 picking reserves zero for “no object,” so indices through `16_777_214` are pickable.
Larger indices continue to render but are intentionally omitted from the picking pass; use compact
resident row indices and keep any global corpus-ID mapping in the application.

## Geographic point queries

The optional `@deck.gl/proposals/effects/query` subpath adds a WebGPU Deck effect that projects
WGS84 longitude/latitude rows into local kilometres, builds a flat uniform-grid index once, and
runs viewport-bounds plus local-radius queries before each draw. It keeps result IDs and clamped
counts on the GPU; the two `outputs` objects can be passed directly to `LuSpatialPointLayer`.

```ts
import {LuSpatialPointLayer} from '@deck.gl/proposals/layers';
import {LuSpatialGeographicPointQueryEffect} from '@deck.gl/proposals/effects/query';

const queryEffect = new LuSpatialGeographicPointQueryEffect(device, {
  longitudeLatitudes,
  sourceBounds: [-74.1, 40.65, -73.84, 40.85],
  projectionOrigin: [-73.97, 40.75],
  projectedBounds: [-12, -10, 12, 10],
  gridSize: [256, 256],
  initialSelection: {center: [-73.9855, 40.758], radiusKilometres: 0.35},
  selectionRadiusRangeKilometres: [0.05, 5],
  onStats: stats => updateInspector(stats.inspectorSnapshot)
});

const contextLayer = new LuSpatialPointLayer({
  id: 'context-points',
  ...queryEffect.outputs.viewport
});
const selectionLayer = new LuSpatialPointLayer({
  id: 'selected-points',
  ...queryEffect.outputs.selection
});

deck.setProps({effects: [queryEffect], layers: [contextLayer, selectionLayer]});
queryEffect.setSelection([-73.99, 40.75], 0.5);
```

The caller supplies source bounds in WGS84 degrees and projected bounds in the same
cuSpatial-compatible sinusoidal space selected by `projectionOrigin`. The effect compiles an
adaptive luProj plan once and uses it for both resident rows and mutable selections. This keeps
ingestion and source metadata outside the package. Use
`setSelection`, `setSelectionRadius`, and `getSelection` for the mutable radius query. Set
`viewportId` when a Deck instance has multiple views; otherwise the first viewport is queried.

Selection centers pass through the same GPU projection kernel as resident points. CPU-derived
viewport corners are conservatively expanded by 20 metres, matching the documented projection
error envelope; set `viewportProjectionPaddingKilometres` to override that expansion.

`drawCommands` and `inspector` remain public for custom renderers and inspector UIs. Diagnostics
are sampled asynchronously and never gate the GPU-driven render path. Readbacks are enabled when
`onStats` is supplied, or explicitly with `enableDiagnostics`. The effect owns every buffer and
graph it creates; Deck calls `cleanup`, while applications may call `destroy` when an effect is
constructed but never adopted.

## Tiled sources

Tiled GPUVector and Arrow adapters are intentionally outside this layer core. They should integrate
with deck.gl's proposed shared tile layer so cache ownership, refinement, cancellation, and request
deduplication remain common infrastructure rather than being reimplemented in this package.

## Auxiliary scene buffers

`SceneBufferEffect` captures participating layers into luma.gl `GBuffer` textures before Deck's
normal display pass. This WebGPU adapter makes HDR scene color, sampleable opaque depth, encoded
view normals/roughness, optional motion vectors, and an optional opaque selection mask available to subsequent effects. It does not
replace Deck's display output or modify the picking pass.

```ts
import {SceneBufferEffect} from '@deck.gl/proposals/effects';

const sceneBuffers = new SceneBufferEffect({
  history: true,
  selection: true,
  getLayerOptions: layer => {
    if (layer.id === 'buildings') {
      return {mode: 'opaque', surfaceBuffer: true, selected: true};
    }
    if (layer.id === 'glass') return {mode: 'transparent'};
    return null;
  }
});
deck.setProps({effects: [sceneBuffers]});

// Read after SceneBufferEffect.preRender, for example from another effect's postRender.
const frame = sceneBuffers.getFrame('main');
if (frame) {
  const colorTexture = frame.buffer.colorTexture;
  const depthTexture = frame.buffer.depthTexture;
  const normalTexture = frame.buffer.normalRoughnessTexture;
  const selectionTexture = frame.buffer.getExtraColorTexture('selection');
  // Pass these borrowed textures to a luma.gl shader-pass pipeline.
}
```

Opaque participants write color and depth. Transparent participants blend color afterward without
changing opaque depth, normals, or selection. Declare their alpha/blending parameters as for normal
Deck rendering. Layer visibility, filtering, projection, transitions, and shader-module effects are
handled by Deck's layer pass. Place capture after effects whose pre-render work its layers need.
`selection: true` allocates an `r8unorm` mask and adds its capture pass; it defaults to false.
Only request it when a downstream effect consumes the mask. Selection includes only visible opaque fragments from selected layers implementing `surfaceBuffer`.
Nonparticipating layers and an external basemap are not represented in these textures.

### Normal and selection output

A participating mesh opts into the exported `surfaceBuffer` shader module. Its fragment shader must
branch before material output:

```wgsl
if (surfaceBuffer.enabled != 0) {
  return surfaceBuffer_encode(commonSpaceNormal, roughness);
}
```

The module converts the supplied common-space normal to view space, packs it into RGB in [0, 1],
and stores roughness in alpha. Apply any model/projection normal transformation before calling it.
The capture pass also uses this function for white selection-mask output. Normal material output
uses `enabled = 0`; the adapter restores that mode and model render parameters after auxiliary
passes. Layers without the module may still provide scene color and opaque depth; their normal
pixels retain the default roughness of 1.

### Layer participation

| Participating layer | Captured color | Opaque depth | Normal/roughness | Selection mask |
| --- | --- | --- | --- | --- |
| Opaque custom layer with `surfaceBuffer` | Yes, including HDR values | Yes | Shader-provided | When selected and requested |
| Opaque stock layer without `surfaceBuffer` | Yes | Yes | Default roughness 1; no surface normal supplied | No |
| Transparent layer | Blended over opaque color | Preserved | Preserved | Preserved |
| Nonparticipating layer or external basemap | Absent | Absent | Absent | Absent |

The GPU integration test exercises the unmodified `ScatterplotLayer` from Deck 9.4.0: opaque
color/depth capture, transparent blending, exclusion, native picking, and removal of the effect.
It does not establish compatibility with every stock layer or create normals for them. The pinned
stock WebGPU shaders do not expose a consistent fragment normal/color-extension injection target; supplying
`surfaceBuffer` output currently requires a participating shader implementation.

`SceneBufferEffect` itself leaves ordinary Deck rendering and picking in place. Removing it releases
its textures and keeps stock-layer picking working. A final effect that replaces the image with
captured color must explicitly compose any omitted layers or basemap; capture alone cannot include
a separately rendered map. Create this adapter only on WebGPU, or retain ordinary rendering without
it on an unsupported backend.

### Views and history

Each view ID has separate full-canvas targets. `viewportBounds` locates its region in top-origin
physical texture pixels. Normal rendering, side-by-side views, and vertically split views use the
same pinned Deck viewport-origin correction. The adapter supplies its own cleared targets, so it
omits per-view clear operations that would nest WebGPU render passes in this Deck version.

`history: true` retains the previous completed capture in a second slot. `previousBuffer` is absent
on the first frame, after allocation resize, or after viewport bounds change. Call
`sceneBuffers.resetHistory(viewId)` for camera cuts, teleports, discontinuous time changes, or scene
replacement; omit the ID to reset all views. Camera matrices are copied per frame in Deck's native
common-space/OpenGL clip convention. Retaining full-buffer history does not perform temporal filtering by itself.
`historyValid`, `previousViewProjectionMatrix`, `time`, and `previousTime` remain available without
allocating a second capture; invalidated frames omit the preceding matrix.

All returned textures are borrowed. Do not destroy them or retain them beyond the slot's next reuse.
Removing a view destroys its targets. Resize replaces its targets. Removing the effect or finalizing
Deck releases all captures; repeated cleanup is safe. Default formats use approximately 16 bytes per
canvas pixel per view, or 17 with selection, doubled when history is enabled, plus driver overhead.
Capture issues three passes per view, or four with selection, and preserves the normal Deck display pass, so callers should measure the cost for
their scenes. The adapter currently requires WebGPU and explicit layer participation.

The repository's pinned Deck patch also adds depth to the first postprocessing scene target.
Without it, depth-writing layers are incompatible with that color-only WebGPU target as soon
as a `postRender` effect is installed. The second fullscreen swap target remains color-only.
### Motion and shared shader-pass graphs

`motionVectors: true` adds an `rg16float` attachment containing current-minus-previous UV velocity,
with a top-left texture origin. A depth reconstruction draw computes stationary-surface camera
motion. Layers declaring `motionBuffer: true` draw object velocity over their visible cores, using
previous object positions and the caller-owned `getTime()` clock. Transparent halos are deliberately
excluded: a single velocity texture cannot represent every overlapping transparent contribution.
The optional attachment adds four bytes per pixel and two draws; it stays unallocated by default.

Custom animated shaders use the exported `motionBuffer` module. Project both object positions with
the current camera and pass them to `motionBuffer_getVelocity(currentClip, previousPositionClip)`.
The capture supplies the previous-camera transform and `previousTime`; branch on
`motionBuffer.enabled` in the fragment shader to output velocity before normal color/picking.

`SceneShaderPassEffect` extends `ShaderPassEffect` to borrow the capture's HDR color, depth, normals,
and optional velocity. It reuses `ShaderPassRenderer` for graphs, history, resize and presentation.
Place it after the capture in Deck's effects array. `getSceneOptions({frame, viewport, camera})`
provides effect-specific uniforms and bindings. The camera helper converts projection/depth to
WebGPU convention and view distances to metres; `coordinateOrigin` locates local metre positions.
Physical near/far values assume a perspective viewport. Fullscreen presentation currently supports
one view. Cuts, resize and viewport replacement invalidate temporal history together.

```ts
const sceneBuffers = new SceneBufferEffect({
  motionVectors: true,
  getTime: () => time,
  getLayerOptions: layer => ({mode: 'opaque', surfaceBuffer: true})
});
const effects = new SceneShaderPassEffect({
  capture: sceneBuffers,
  shaderPasses: [createSSGICompositeShaderPass(), toneMapping],
  getSceneOptions: ({camera}) => ({uniforms: {
    ssgiTrace: {projectionMatrix: camera.projectionMatrix,
      inverseProjectionMatrix: camera.inverseProjectionMatrix, radius: 100}
  }})
});
deck.setProps({effects: [sceneBuffers, effects]});
```

See the fireflies, HDR night lighting, global illumination and light shafts examples for one shared
capture/clock/fixture composing existing luma.gl bloom, exposure, SSGI and volumetric lighting.
SSGI and shaft occlusion describe visible screen-space geometry; hidden geometry is not available.

## Shader-pass graphs in Deck

`ShaderPassEffect` adapts the existing luma.gl `ShaderPassRenderer` to Deck's postprocessing
chain. It owns the renderer and presentation model, resizes intermediate targets with the
source, resets history on size changes, respects explicit output targets and downstream
effects, and releases its resources on removal. It does not participate in picking.

```ts
const composite = new ShaderPassEffect({
  id: 'scene-composite',
  shaderPasses: [createBloomCompositeShaderPass({downsample: 'render'}), toneMapping],
  colorFormat: 'rgba16float',
  getRenderOptions: options => {
    const viewport = options.viewports[0];
    const frame = viewport && capture.getFrame(viewport.id);
    return frame ? {sourceTexture: frame.buffer.colorTexture} : null;
  }
});
```

Without `getRenderOptions`, the source is Deck's ordinary color input; floating-point
intermediate targets do not recover highlights already clipped in that input. Supply an
HDR capture to retain highlight energy. Input textures, framebuffers, and auxiliary bindings
are borrowed. The callback can also supply uniforms, bindings, and `resetHistory`; returning
null leaves the incoming frame unchanged. Effects with their own camera state can delegate
to `render(options, inputs)` instead of implementing presentation again.

`setShaderPasses` replaces the graph and releases its previous resources. `resetHistory`
invalidates temporal targets without replacing them. Removing the effect releases all its
owned resources; adding it again creates a fresh renderer. Backend support follows the passes
provided, not just this adapter. The renderer processes one supplied image per frame; an
application selecting a per-view capture must arrange its own multi-view composition and
history isolation. Tone mapping and output transfer remain explicit steps in the graph.

## Sky and effect layers

The sky and effect layers moved to deck.gl-community. Import astronomy and cloud layers,
including `SkyLayer`, from `@deck.gl-community/layers/sky-layers`. Import particle, sketch,
glow, and water layers from `@deck.gl-community/layers/effect-layers`.

- [Sky layers](https://visgl.github.io/deck.gl-community/docs/modules/layers/api-reference/sky-layers)
- [Effect layers](https://visgl.github.io/deck.gl-community/docs/modules/layers/api-reference/effect-layers)
- [Globe Clouds source](https://github.com/visgl/deck.gl-community/tree/master/examples/layers/globe-clouds)
- [Sketch Edges source](https://github.com/visgl/deck.gl-community/tree/master/examples/layers/sketch-edges)

## Development in deck.gl

Source snapshot: `visgl/luma.gl@23eb0f713e1f66dc8cf6c9b73aefbd740309de92`.

This private package was copied from luma.gl's `modules/proposals`. Its package name
is unchanged. It uses the local deck.gl core workspace and luma.gl 10 prereleases.
Run `yarn build-private` and `yarn lint` from the repository root. Run
`yarn test-private` for the module node and headless suites. The regular build and
tests exclude these private prototypes. The copied examples and integration tests live in this repository.
Gallery-specific assertions were adapted to the standalone example metadata.

luma.gl alpha.6 publishes the required integrations, including Arrow and text under
`@luma.gl/engine`. A regular workspace install supplies these dependencies.

## Examples and integration tests

The original standalone examples and their shared fixtures are available in
[`examples-v10/proposals`](https://github.com/visgl/deck.gl/tree/master/examples-v10/proposals). Run `yarn build-private-examples`
after installing workspace dependencies. `yarn test-private` includes the copied
example integration tests alongside the module tests.
