# Riverfront Water

See [setup and commands](../README.md) before running this example.

A standalone Deck city scene rendered by the shared river-district mesh layer. The fictional
district uses deterministic local geometry, so it requires no basemap service or credentials.

```sh
yarn install
cd examples/deck/city-scene
yarn start
```

Choose WebGPU or WebGL2, change camera presets, toggle buildings and water shading, compare the
classic and layered river water styles, adjust ripple strength, pause the waves, and click surfaces
to inspect features. Positions use Deck's meter-offset
coordinate system around a fixed geographic origin. Deck owns the frame loop and presentation
device. The example owns the water positions; `WaterSurfaceLayer` borrows them and owns its model.

`yarn build` checks types and builds the standalone example. `yarn test:visual` runs the real scene
in both backends, checks animated and deterministic water, pause, picking, camera changes, resize,
layer updates, and finalization, and saves
screenshots in the system temporary directory. Tests use software rendering for portability and
do not establish hardware performance targets. Set `CITY_SCENE_HARDWARE=true` to run them with the
available hardware adapter instead.

The classic style uses luma.gl's procedural `waterMaterial`. The River style layers small crossing
ripples, Fresnel response, and directional-light glints in the separate
`riverWaterMaterial`; its wave travel follows the dominant axis of the river footprint. The existing
material remains available unchanged. Neither style displaces geometry. Ripple frequencies fade
below a pixel to limit distant flicker.

On WebGPU, **Scene reflections** adds screen-space building and bridge reflections. The example's
`SceneBufferEffect` captures participating opaque layers and transparent edge color into the shared luma.gl `GBuffer`.
`RiverReflectionEffect` borrows its color, depth, and view-normal/roughness textures and runs
luma.gl's shared SSR tracer, camera-reprojected history, spatial filtering, and compositing.
Selection capture stays disabled: the river consumes no selection mask, saving one full-size
`r8unorm` texture and one capture pass per view. The reflection adapter owns only the postprocessing pipeline and its temporal history; scene
capture, layer filtering, target resizing, and texture cleanup belong to `SceneBufferEffect`.

The `surfaceBuffer` shader module lets participating layers supply normals and roughness. Capture
runs before Deck's display pass, and reflections are installed as this single-view fixture's final
effect. Deck layers must explicitly opt into capture; reflective surfaces also provide normal/roughness output. WebGL keeps
the procedural material and disables the reflection control.

SSR can only reflect surfaces visible in the current frame; screen-edge and occlusion gaps retain
the underlying material. River water uses a directional sky gradient in its material: the reflection
vector samples a horizon tint derived from `fresnelColor` and a configurable `skyZenithColor`, around
`skyUpDirection` (Z-up by default). This stays attached to the scene and runs on both backends without
an environment texture or another render pass. It approximates sky radiance; it does not invent
hidden buildings, capture clouds, or simulate atmospheric scattering. Classic water is unchanged.

**Reflection view** exposes the final image, scene reflection radiance, reflection coverage, and the
material fallback with the SSR contribution suppressed. Coverage runs from blue (little or no SSR)
to gold (higher confidence); this is reflection confidence, not a visibility map of hidden geometry.
Material fallback includes the surface tint and direct lighting as well as sky shading. Debug views
reuse the existing composite and preserve capture/history allocations. These controls require
WebGPU; WebGL retains the same River sky material without scene reflections.
Camera-only temporal accumulation follows the static district through camera movement. Each
history tap must match the reprojected depth, surface normal, and roughness; a neighborhood clamp
limits stale reflection colors. The animated water's changing normals can reject history. Camera
presets, large camera jumps, resize, time resets, and material changes clear history. Moving objects
would require motion vectors or explicit history resets. While water is paused, the example renders
a bounded sequence after camera changes, history resets, or quality changes, then returns to idle.
The bound comes from the shared quality preset's history weight: 22 frames for Balanced/Detailed,
or 45 for Fast. Pausing keeps the water clock fixed throughout;
disabling water or reflections cancels this extra rendering. This limits the initial sample's
nominal history contribution below one percent, rather than guaranteeing noise-free convergence. Depth history preserves 24-bit depth in
RGBA8 textures, avoiding optional float-filtering support. Reflection history uses the selected
quality resolution while depth and normal history use full resolution. Buildings sit close to the
river to make their reflections easier to see. The scene uses face lighting without cast shadows. The shared fixture adapter does not promise arbitrary mesh formats or terrain draping.

Website builds use an explicit asset prefix (including `WEBSITE_BASE_URL` when set), so clean-URL
redirects cannot move relative asset requests out of the embedded example directory. Standalone
builds retain relative asset URLs.

The district geometry is rendered by `../river-district-layer.ts`, shared with the other riverfront
examples. It uses luma.gl's Lambert material for lighting, optional `heightFog`, and `surfaceBuffer`
for view-space normals/roughness and selection output. The layer owns its generated mesh buffer and
model; Deck owns their layer lifecycle. Fog defaults to zero density.

Reflection quality uses the same `createSSRCompositeShaderPass` factory as other luma.gl scenes,
with `reprojection: 'camera'`. Balanced retains the original appearance (half resolution, 96 trace
samples, two-pixel denoising radius, 0.8 history weight). Fast uses quarter resolution, 32 samples,
a three-pixel radius and 0.9 history weight. Detailed uses full resolution with the Balanced tracing
and history settings. Switching quality releases reflection targets and resets history, while
retaining shared scene capture. Depth and normal histories stay full resolution at every quality.
These settings describe relative work; they are not hardware frame-rate guarantees. WebGL disables
both reflection controls and retains the procedural water material.

Building edges can independently use None, Solid, or Pencil styling, with a CSS-pixel width control.
The example composes the same `SketchEdgeLayer`, `sketchStroke`, `makeEdgeGeometry`, and shared
`river-district-edges.ts` fixture conversion used by Riverfront outlines. Style changes reuse the
edge buffer; hiding buildings removes both their fills and edges. The application owns the borrowed
segment buffer and releases it after Deck finalization. Static edges never request animation.

With WebGPU reflections enabled, the shared scene capture includes strokes in its transparent color
pass after opaque geometry. The building surfaces continue supplying depth and normals; pencil ink
can therefore appear in reflected scene color without pretending that strokes have their own
surface normals. This remains a single-view local-map example. Use `CITY_SCENE_URL=http://localhost:4173/` to run its visual
checks against served production assets. Preserve the renderer query parameter when serving production assets.

`yarn benchmark` measures completed-frame latency and tracked GPU allocations on hardware
WebGPU. See the [measurement method and hardware-specific budgets](benchmarks/README.md).

Visual smoke checks use a device scale of 0.5 to reduce framebuffer pixels by 75% while retaining
CSS viewport sizes, picking coordinates, and pixel assertions. Screenshots are normalized to CSS
pixels. Set `CITY_SCENE_DEVICE_SCALE=1` for the original framebuffer resolution, or combine it with
`CITY_SCENE_HARDWARE=true` for hardware rendering. Picking and borrowed-buffer checks disable SSR;
reflection convergence, quality switches, resize, and edge composition still exercise SSR.

The shared Riverfront lighting visual runner uses the same reduced device scale. Set
`RIVERFRONT_DEVICE_SCALE=1` for full-resolution lighting checks. Its `--thumbnail` mode defaults to
the original scale of 1 so generated thumbnails retain their resolution.
