# @deck.gl-community/gpu-layers

Reusable deck.gl layers for geographic rendering that consume caller-owned GPU buffers.

## Water surfaces

`WaterSurfaceLayer` shades flat, triangulated water polygons on WebGPU and WebGL2 using the shared
`@luma.gl/shadertools` water material. Supply packed `float32x3` positions in local east/north/up
meters, `vertexCount`, and Deck's `coordinateOrigin`. The layer borrows the position buffer and owns
only its render model; the application must release the buffer after removing/finalizing the layer.

```ts
const water = new WaterSurfaceLayer({
  id: 'river',
  style: 'river',
  positions,
  vertexCount,
  coordinateOrigin: [-74.006, 40.7128, 0],
  data: [{name: 'River'}],
  pickable: true,
  time: () => elapsedSeconds,
  material: {normalStrength: 0.55, coordinateScale: [0.22, 0.22]}
});
```

Import `WaterSurfaceLayer` from `@deck.gl-community/gpu-layers`. All triangles form one pickable
surface (`index: 0`). Supply separate layers for independently selectable surfaces. `time` accepts
seconds or a callback; the caller schedules frames, for example with Deck's `_animate` option, and
disables animation when paused. Material defaults use opaque water and planar UV coordinates in
local meters, so ripple wavelength is independent of the polygon's triangulation.
`style: 'river'` selects the separate layered-ripple material; `'classic'` retains the original
material and remains the default. The River material includes a directional sky fallback using
a horizon tint derived from `material.fresnelColor` and `material.skyZenithColor` above it, in linear RGB.
`material.skyUpDirection` defaults to `[0, 0, 1]`, appropriate for this local map layer. These
parameters use the same coordinate frame as the material normal. The sky approximation adds no
textures or capture passes and remains available when screen-space reflections are disabled.

The prototype assumes a flat local surface with a +Z normal and fixed ambient/directional lighting.
It provides animated normal shading, not geometry displacement, terrain draping, scene reflections,
or general LayerExtension support. See `examples/deck/city-scene` for a complete application.

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
import {GPUScatterplotLayer} from '@deck.gl-community/gpu-layers';

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

Variable geometry stays GPU-native as well:

- `GPUPathLayer` consumes `GPUVector<'vertex-list<float32xN>'>` and expands segments on the GPU.
- `GPUSolidPolygonLayer` consumes tessellated position, row-index, color, and triangle-index
  GPUVectors prepared by an adapter.
- `GPUPolygonLayer` composes the solid fill and path outline cores without copying either input.
- `GPUTextLayer` consumes caller-owned `GPUTextData`, whose chosen strategy owns glyph GPUVectors
  and atlas metadata.

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
import {LuSpatialPointLayer} from '@deck.gl-community/gpu-layers';

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

The optional `@deck.gl-community/gpu-layers/query` subpath adds a WebGPU Deck effect that projects
WGS84 longitude/latitude rows into local kilometres, builds a flat uniform-grid index once, and
runs viewport-bounds plus local-radius queries before each draw. It keeps result IDs and clamped
counts on the GPU; the two `outputs` objects can be passed directly to `LuSpatialPointLayer`.

```ts
import {LuSpatialPointLayer} from '@deck.gl-community/gpu-layers';
import {LuSpatialGeographicPointQueryEffect} from '@deck.gl-community/gpu-layers/query';

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

## FlowParticleLayer

`FlowParticleLayer` draws `FlowParticleSimulation` state textures as depth-tested streaks.
Pass `particles` from `simulation.step(...)`, `particleCount`, and the field `bounds`.
When stepping in `onBeforeRender`, pass `particles: () => currentParticles` so the layer
reads the current buffers and their time interval together at draw time. Deck prepares
layer props before that callback; replacing a snapshot there would lag one frame.
Use `COORDINATE_SYSTEM.METER_OFFSETS` with a coordinate origin for a local metre grid,
or `COORDINATE_SYSTEM.LNGLAT` for geographic bounds. `widthPixels` is screen-space;
`trailSeconds` extrapolates the latest motion vector rather than retaining a curved trail.
Picking returns `{id}` with the stable row-major particle index. The simulation and both
state textures remain caller-owned. Run the simulation before Deck renders, and finalize
Deck before destroying the simulation. See the riverfront flow example for integration.
## Architectural strokes

`SketchEdgeLayer` renders solid or pencil-like independent segments on WebGPU and WebGL2.
The caller owns an interleaved float32 buffer with eight values per segment:
`start.xyz, end.xyz, featureIndex, seed`. Use a stable seed for each geometric edge and a row
index into `data` for picking. Local meter offsets are the default coordinate system.

```ts
import {SketchEdgeLayer} from '@deck.gl-community/gpu-layers';

const edges = new SketchEdgeLayer({
  id: 'building-edges',
  segments,
  segmentCount,
  coordinateOrigin: [-74.006, 40.7128, 0],
  data: buildings,
  pickable: true,
  color: [35, 31, 29, 255],
  style: {width: 2, jitter: 0.7, variation: 0.35, grain: 0.45, extension: 3, sketch: 1}
});
```

Width, jitter, and endpoint extension use CSS pixels. Set `sketch: 0` for solid strokes on the
same geometry. Draw opaque fill layers first to hide rear edges. The layer owns its model and
quad buffer, and borrows `segments`; the application destroys that buffer after finalizing Deck.
It does not extract mesh boundaries, join paths, or drape lines over terrain. The
[Sketch buildings example](../../examples/deck/sketch-edges) demonstrates the controls, picking,
and hidden-edge rendering. The underlying `sketchStroke` shader in `@luma.gl/shadertools`
can also be used by non-Deck renderers.
## Auxiliary scene buffers

`SceneBufferEffect` captures participating layers into luma.gl `GBuffer` textures before Deck's
normal display pass. This WebGPU adapter makes HDR scene color, sampleable opaque depth, encoded
view normals/roughness, optional motion vectors, and an optional opaque selection mask available to subsequent effects. It does not
replace Deck's display output or modify the picking pass.

```ts
import {SceneBufferEffect} from '@deck.gl-community/gpu-layers';

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
stock WebGPU shaders do not expose a consistent fragment normal/color-extension hook; supplying
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

## WeatherParticleLayer

`WeatherParticleLayer` draws seeded rain or snow in `COORDINATE_SYSTEM.METER_OFFSETS`.
Provide a local `coordinateOrigin`, an application-owned `time` in seconds (or a getter),
`particleCount`, and `precipitation` shader props. A function may supply precipitation props
from the current viewport when the volume should follow the camera. Keep the volume size
constant while moving its center to retain particle positions in overlapping space.

`weather`, `widthPixels`, `streakLength` in metres, and linear RGBA `color` control appearance.
`fog` accepts `heightFog` props or a callback returning them, allowing a shared animation clock
to drive drifting density without rebuilding layer geometry. Zero variation keeps uniform fog.
The optional borrowed `surfaceTexture` is an `r32float`
height field with local metre bounds `[west, south, east, north]`; row zero is south and
samples are texel-centered. It hides particles below the highest surface. Outside the field,
zero is used as the surface height. Opaque scene layers must draw before weather and write
depth. Transparent occluders are not represented by this height field.

The layer owns its model, corner buffer, and one-texel fallback texture. It never destroys a
supplied surface texture and performs no CPU particle updates. Particles are decorative and
are not pickable. See the riverfront weather example for clock, volume, and teardown usage.

## Glow points

`GlowPointLayer` renders depth-tested additive sprites on WebGPU and WebGL2. It borrows a buffer
of 32-byte float32 rows: position XYZ, linear RGB tint, opacity, and feature index. The layer owns
its model and its six-corner vertex buffer. Set `pointCount` explicitly, including zero for an
empty draw. Replace `points` to bind a different caller-owned buffer.

```ts
import {GlowPointLayer} from '@deck.gl-community/gpu-layers';

const lights = new GlowPointLayer({
  id: 'lights',
  points,
  pointCount,
  radiusPixels: 18,
  pickingRadiusPixels: 5,
  style: {coreRadius: 0.12, coreIntensity: 1, haloIntensity: 0.6, falloff: 5},
  pickable: true,
  data: features
});
```

Positions use the normal Deck coordinate-system and origin props. Both radii use CSS pixels and
stay constant with perspective depth. `pickingRadiusPixels` is clamped to the outer radius. The
buffer's feature index selects `data` entries through Deck's normal picking API; use integer
indices through `16_777_214`, or a negative index for an unpickable sprite.

The `style` object supplies `PointGlowProps`. Intensity can exceed one for HDR output. Radius and
style updates reuse geometry. Layer opacity and per-point opacity scale radiance; depth writes
are disabled, and the default blend state adds RGB while preserving destination alpha. Use an
opaque presentation surface or an explicit HDR composition pass. The example requests an opaque
canvas on both backends. Opaque occluders must also participate in Deck's picking pass to prevent
selection through buildings. The sprite uses its center's depth, so intersecting geometry can clip
part of its halo. This layer does not illuminate nearby geometry or cast shadows.

See the Riverfront lights website example for both renderers and the shared `pointGlow` module
for applications that supply their own geometry and composition.

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

## Sun and Moon in the sky

`SunLayer` and `MoonLayer` draw camera-relative disks at sky distance. They follow camera
rotation, remain stationary when the map pans or zooms, and sit behind foreground geometry.
They work on WebGPU and WebGL2 in perspective map, orbit, and globe views. Directions use
local east, north, up on a map and are converted to global axes on a globe. Orthographic
views do not render celestial disks; flat-map views hide bodies below the local horizon.

```ts
new SunLayer({
  id: 'sun',
  coordinateOrigin: [-74, 40.7, 0],
  direction: towardSun,
  radiusPixels: 12,
  haloIntensity: 0.3
});
new MoonLayer({
  id: 'moon',
  coordinateOrigin: [-74, 40.7, 0],
  direction: towardMoon,
  radiusPixels: 16,
  phase: 0.25,
  limbAngle: 0
});
```

`direction` points **toward** the body, the opposite of an incoming light-ray direction.
`radiusPixels` specifies disk size in CSS pixels; the solar halo extends to three radii and
reuses luma.gl's `pointGlow` module. `color` uses 8-bit RGBA. The Moon has a procedural surface,
phase shading, and a faint dark-side contribution: `phase` is 0 for new, 0.25 for first quarter,
0.5 for full, and 0.75 for last quarter. `limbAngle` rotates the phase pattern counterclockwise
from the screen's rightward axis, in radians.

The layers use `@math.gl/sun` for automatic position and lunar phase when supplied with an
observer and timestamp. Explicit directions and phase values remain supported. They do not
illuminate geometry or cast shadows, write depth, or participate in picking. Draw them before
transparent scene layers. Riverfront soft shadows and weather share math.gl astronomy with
their scene lighting; the weather example also uses `getSunLight` for direct and diffuse light.

## Clouds in the sky

`CloudLayer` renders a procedural cloud volume behind flat-map scene geometry on WebGPU and
WebGL2. Place SunLayer/MoonLayer first, then CloudLayer, then opaque foreground layers. Clouds
attenuate celestial disks without writing depth or participating in picking. Globe and
orthographic views are not supported. Positions use local east/north/up metres relative to
`coordinateOrigin`; the camera can move through the slab.

```ts
new CloudLayer({
  id: 'clouds',
  coordinateOrigin: [-74, 40.7, 0],
  cover: 0.4,
  altitude: 1000,
  thickness: 1200,
  scale: 1400,
  time: elapsedSeconds,
  velocity: [18, 0],
  sunDirection: towardSun,
  sunColor: [1, 0.95, 0.85]
});
```

`cover` ranges from 0 (clear) to 1 (overcast). `altitude`, `thickness`, and `scale` are metres;
`density` is inverse metres. `velocity` is east/north metres per second. The application owns
the elapsed `time` and redraw schedule. Sun direction must be nonzero; sun tint is linear RGB.
The shared luma.gl `clouds` shader integrates 64 density samples with approximate sunlight
scattering, and reuses the `valueNoise` module used by height fog. It adds sky clouds rather
than cloud shadows on buildings or terrain; per-pixel cost increases with sky area.


### Fireflies

`FireflyLayer` extends `GlowPointLayer` on WebGPU and WebGL2 with the shared `firefly` shader module.
The same borrowed eight-float rows carry position, tint, opacity and a deterministic feature seed.
`time` is a caller-owned clock in seconds; `animation` controls wandering radius in metres, speed,
and pulse strength. Independent smooth phases avoid synchronized blinking. Ordinary glow points
keep animation disabled. Fireflies preserve point picking, additive blending and ownership rules,
and can write animated core motion when opted into a `SceneBufferEffect` capture.


### Globe cloud cover

`GlobeCloudLayer` renders the same procedural cloud field as a spherical volume around a
`GlobeView` planet on WebGPU and WebGL2. Draw opaque globe terrain first, then the cloud
layer. The shell tests scene depth, clips rays against the planet, and neither writes depth
nor participates in picking. It skips flat-map and orthographic views.

```ts
new GlobeCloudLayer({
  id: 'globe-cloud-cover',
  planetRadius: 6370972,
  cover: 0.45,
  altitude: 12000,
  thickness: 12000,
  scale: 900000,
  density: 0.0001,
  time: elapsedSeconds,
  velocity: [14, 4],
  sunDirection: [0, -1, 0.3]
});
```

Cloud altitude, thickness and formation scale are in metres. Velocity controls rotation
around the globe's Z and X axes in metres per second at the equator; sun direction is a
normalized globe-centered XYZ vector. The shared `clouds` noise, density and lighting
functions are reused by the `globeClouds` shader module. A three-dimensional density field
avoids longitude seams and pinching at the poles. This is procedural cover, without observed
weather data, terrain-aware cloud shadows or temporal reconstruction. The globe example
accelerates drift to make global motion visible during a short preview.

### Celestial sky composition

`SkyLayer` combines the existing atmosphere renderer, `SunLayer`, `MoonLayer`,
`StarfieldLayer`, and the cloud layer appropriate to the active view. One observer and
astronomy timestamp drive every component. The application advances the clock; cloud
`time` is separate elapsed seconds. The original `AtmosphereLayer` remains available.

```typescript
import {SkyLayer} from '@deck.gl-community/gpu-layers';
import {createSkyObserver} from '@math.gl/sun';

const sky = new SkyLayer({
  id: 'sky',
  timestamp: Date.now(),
  observer: createSkyObserver({longitude: -74, latitude: 40.7}),
  time: elapsedSeconds,
  sun: {radiance: 8},
  moon: true,
  stars: {brightness: 1},
  clouds: {cover: 0.45}
});
```

Draw the sky before opaque scene geometry. Every component is non-pickable and retains
foreground depth occlusion. `GlobeView` automatically uses spherical clouds and global
celestial axes; perspective map views use the local sky and cloud slab. The local
scattering atmosphere is skipped on globe views, which use the application's space
background. Cloud properties retain each layer's defaults (metres and seconds).

`SunLayer` and `MoonLayer` also accept `timestamp` and `observer` directly. An explicit
ENU `direction` preserves manual placement; moon `phase` and `limbAngle` override the
automatic values. If no observer is provided, the layers use `coordinateOrigin` when
nonzero, otherwise the active map/globe location. All astronomy angles are radians.
Solar `radiance` is linear and can exceed one; retain it with a floating-point scene
color target and tone mapping or extended-range presentation. An ordinary canvas
clamps highlights. Disk sizes are intentionally configurable in pixels, rather than
physically scaled apparent angular diameters. Automatic Moon placement also varies its
pixel radius with math.gl lunar distance, relative to the mean Earth–Moon distance of
384,400 km. Set `scaleWithDistance: false` for a fixed radius. Explicit manual directions
keep a fixed radius unless `scaleWithDistance: true` is supplied; screen position and
horizon proximity do not change the size.

`StarfieldLayer` defaults to math.gl's BSC5 catalog and sidereal/precession rotation.
Optional `data` uses `getStarLayerData(..., {coordinates: 'equatorial'})` from
`@math.gl/sun/stars`; an empty array renders no stars. The catalog is calculated once
and reused, and changing the timestamp only changes rotation uniforms. Catalog stars
use compact sprites with subtle spectral tint. `colorStrength` defaults to `0.2`;
set it to `0` for neutral stars or `1` for the original catalog RGB. Picking and
GPU resource ownership follow the same rules as the individual sky layers.

## Development in deck.gl

Source snapshot: `visgl/luma.gl@23eb0f713e1f66dc8cf6c9b73aefbd740309de92`.

This private package was copied from luma.gl's `modules/deck-gpu-layers`. Its package name
is unchanged. It uses the local deck.gl core workspace and luma.gl 10 prereleases.
Run `yarn build-private` and `yarn lint` from the repository root. Run
`yarn test-private` for the module node and headless suites. The regular build and
tests exclude these prototypes because their upstream peers are unpublished. Tests coupled to examples and website infrastructure
remain in luma.gl. Example paths in this README refer to the source luma.gl repository.

The upstream `@luma.gl/arrow`, `@luma.gl/experimental`, and `@luma.gl/text` packages
are private and unavailable on npm. They are peer dependencies here. To build or run
these packages, build a compatible luma.gl checkout and link the required private
packages into deck.gl (for example, run `yarn link` in each luma.gl package, then
`yarn link @luma.gl/experimental @luma.gl/text @luma.gl/arrow` in deck.gl).
These modules require those peers at runtime; a regular install alone is insufficient.

## Examples and integration tests

The original standalone examples and their shared fixtures are available in
[`examples/deck`](../../examples/deck/README.md). Run `yarn build-private-examples`
after linking the unpublished peers. `yarn test-private` includes the copied
example integration tests alongside the module tests.
