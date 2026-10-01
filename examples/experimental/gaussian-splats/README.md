# Experimental SplatLayer: Coit Tower

The default application is now a deck.gl layer prototype. `SplatLayer` owns the RAD source,
decoder worker, page admission, hierarchy, and renderer, and uses deck's WebGPU device, OrbitView, redraw loop,
and render pass. A normal `LineLayer` draws the reference axes on that same canvas.

```ts
import SplatLayer from './splat-layer/splat-layer';

new SplatLayer({
  id: 'scene',
  data: sceneUrl,
  modelMatrix,
  maxActiveSplats: 2_000_000,
  maxResidentSplats: 8_000_000,
  onStatusChange: status => console.log(status)
});
```

The layer registers its GPU preparation hook internally. Applications do not copy a luma render
loop or register a companion effect. Preparation runs before deck opens its pass; drawing does
not clear, end, or submit the host pass. Finalization aborts requests and releases owned pages
without destroying deck's device. Range fetching, decompression, spherical-harmonic decoding,
float-color conversion, and RAD hierarchy selection run in a dedicated worker. Decoded buffers
transfer to the layer; GPU admission occurs one page per host frame between traversal leases.
Finalization terminates the worker, drains pending upload promises, and rejects pending RPCs.

This is an example-local, unreleased layer, not an export from `@deck.gl/mesh-layers` yet.
Supported: a single Cartesian view, RAD URLs/Blobs, model transforms, visibility, opacity, and
status callbacks. Unsupported: picking, layer extensions, geographic/globe coordinates, multiple
views per layer, and a combined depth sort between independently created SplatLayers. Render
opaque deck geometry before splats when depth occlusion is required; splats do not write depth.

The local luma checkout must include the shared-pass renderer and CPU-generic hierarchy APIs.
The example build type-checks against that checkout's built declarations, not the older npm pin.
The original standalone implementation remains in
`coit-native-renderer.ts` as a reference, but is no longer used by the app.

## Native rendering architecture

This experimental example renders the public 50.9-million-splat Coit RAD scene with the same
quality-critical architecture as the luma.gl showcase. `RADSource` range-loads independently
decoded pages, `SplatRADHierarchyManager` continuously selects a camera-dependent row frontier,
and `GPUPagedSplatRenderer` retains float colors and spherical harmonics while applying one exact
global GPU depth order across all active pages.

During camera interaction, the renderer immediately reprojects the retained coherent frontier.
One worker selection is in flight at a time; subsequent camera changes coalesce to the latest
view. A completed coherent selection can still be displayed while a newer view is pending, so
continuous motion never starves publication. Camera changes use luma's `refineView(view)` to
retarget the displayed cut and publish each coherent sibling replacement as it completes.
Projected error, radial distance, and foveation determine which branches receive the active-row
budget; old fine branches no longer permanently consume it merely because they loaded first.

Camera position and the clip matrix use the same source-local model transform; viewport dimensions
are physical pixels, including the canvas pixel ratio. The selector uses one viewport-relative
foveation falloff, with full priority through each edge midpoint (normalized radius 0.5, strength 12).
The angular cone does not reduce front-facing detail again; behind-camera detail retains a 0.05 scale.
This adapts to portrait and landscape views, so nearby foreground does not lose detail twice
merely for appearing near the bottom of the viewport. Camera projection/zoom/pixel-ratio tests and
a fixed-budget near-foreground versus distant-center regression cover this policy. The demo still
selects at most one million splats; full source resolution everywhere is not guaranteed by that budget.

Page arrivals resume only parents blocked on that page. When the active budget is full, a higher
priority replacement can reclaim a lower-priority complete sibling group atomically. An exchange
that cannot free enough capacity leaves the existing frontier intact. This avoids rebuilding the
whole cut for each downloaded page. Decode requests and GPU admission are bounded by the configured
load concurrency. Up to four uploads can drain across separate frames before the next selection,
amortizing hierarchy publication without running multiple GPU uploads in one frame.

GPU residency is bounded by `maxResidentSplats + maxActiveSplats` (10 million source rows by
default), including transition headroom. Root, displayed, and worker-leased pages cannot be evicted.
CPU metadata participates only after GPU admission is acknowledged, and leaves with GPU eviction.
The worker retains only positions, scales, opacity, and child links, not duplicate color/SH payloads.
Unused prefetched-page eviction no longer restarts the retained hierarchy. Source pages remain
intact, so the resident-row footprint is larger than the selected-row count.

This follows [Spark's current-view LoD and bounded paging policy](https://sparkjs.dev/docs/new-features-2.0/),
not its packed GPU allocation or Rust/WASM implementation. A complete cut stops exploring
lower-priority descendants at the active-row budget. Requests and partial-child pins are rebuilt
from current demand instead of unioned across unfinished camera updates. Live cuts also protect
their required ancestor and sibling pages: a RAD parent is not a conservative subtree bound, so
discarding every offscreen splat page can break an otherwise visible replacement.

Old pages become **evictable**, not necessarily immediately deallocated. As in
[Spark's pager](https://github.com/sparkjsdev/spark/blob/main/src/SplatPager.ts), bounded residency
reuses unneeded pages when new demand needs room. The resident count alone does not show whether
old views are pinned; eviction and protected-page counts distinguish those cases.

### Refinement guarantees and limits

The selector publishes coherent intermediate frontiers: a parent is replaced only when all
required children are admitted. Camera changes reprioritize retained detail and release obsolete
demand without clearing the displayed frontier. The default application budgets one million
active splats and four million resident splats, plus one million rows of transition headroom.
The layer defaults are two million active and eight million resident splats.

These are bounded-detail settings, not a promise of full source resolution or a fixed convergence
time. Network/decode latency, device limits, and graph rebuilds affect refinement and interaction.
Use the same camera, viewport, pixel ratio, and budgets when comparing implementations.

### Reuse from loaders.gl

The prototype uses the public `RequestScheduler` from `@loaders.gl/loader-utils`, also used by
loaders.gl's `Tileset3D`. It reprioritizes queued work and releases each completed download slot
independently, eliminating the former slowest-page batch barrier. The layer still owns cancellation,
GPU admission, and worker lifetime.

The inspected `TilesetTraverser`/`Tileset3DTraverser` and `I3STilesetTraverser` operate on whole
`Tile3D` contents and spatial volumes. Their replacement/additive selection and asynchronous I3S
header traversal cannot directly replace RAD's per-row child links, mixed parent/leaf pages, and
single global splat depth order. Reuse the request transport machinery here; reuse luma's existing
RAD selector off-thread rather than adapting a second whole-tile selector.

The newer `PointCloudTileset` is also tile-based: its projected-size queue adds parents and
children to the point budget together. That additive point-cloud policy is not a replacement
for RAD's mutually exclusive parent/descendant selection.



The earlier proof flattened every selected page into one Arrow table before handing it to a
tile-local renderer. That bridge discarded non-DC spherical harmonics, clamped HDR color to eight
bits, and replaced global ordering with per-tile sorting. Increasing the page count could not
restore the missing renderer invariants, so this reference deliberately keeps pages intact.

## Run

Install dependencies in both the deck.gl root and this example directory. Until the retained-camera
retargeting and shared-pass prerequisites are released by luma.gl, `LUMA_GL_ROOT` must point to a local luma.gl
checkout containing those changes plus the CPU-only hierarchy types. Build luma with `yarn build`
before building this example. `LOADERS_GL_ROOT` remains an optional override for the published
loaders.gl dependency:

```bash
yarn
cd examples/experimental/gaussian-splats
yarn
LUMA_GL_ROOT=/path/to/luma.gl yarn start-local
# In another shell, using the same built checkout:
LUMA_GL_ROOT=/path/to/luma.gl yarn test-layer
LUMA_GL_ROOT=/path/to/luma.gl yarn build
```

The example requires a browser and adapter with WebGPU support. Once a luma.gl release includes the
retained-camera retargeting and shared-pass APIs, the package pin and run instructions can return to the
published dependency.

## Ownership boundary

- `@loaders.gl/splats` range-loads and decodes native Spark RAD pages.
- `@loaders.gl/loader-utils` provides the shared bounded request scheduler.
- `SplatRADHierarchyManager` owns off-thread row selection and fallback continuity.
- `GPUPagedSplatRenderer` owns sparse projection, global GPU ordering, and float/SH presentation.
- `SplatLayer` owns the deck lifecycle bridge, GPU residency/admission leases, and page diagnostics.
- deck.gl owns the camera controller, canvas, animation loop, and render pass.

The prototype feeds intact pages and sparse active-row masks into the paged renderer. Flattening
the hierarchy into a single table is not a quality-preserving adapter. Tile3D integration is a
separate follow-up, not implemented by this example.

## Verification

From this example directory, with the built luma prerequisite:

```bash
LUMA_GL_ROOT=/path/to/luma.gl yarn test
LUMA_GL_ROOT=/path/to/luma.gl yarn build
# Optional network-backed selection regression:
COIT_LIVE_SELECTION=1 LUMA_GL_ROOT=/path/to/luma.gl yarn test-layer -t 'real Coit'
```

`yarn test` runs the example-local worker/layer tests and the earlier standalone frontier tests.
The latter use deck's headless runner and require its Playwright browser installation.
The root deck test suite does not discover the source-aliased prototype tests; run this example's
check explicitly. Synthetic tests cover camera projection, physical-pixel scale, foreground
priority, progressive publication, cancellation, page admission, worker ownership, and residency.
The real-scene check is opt-in because it range-fetches external data.

The luma prerequisite has separate Node and real-WebGPU coverage for coherent hierarchy cuts,
capacity exchanges, deep retained trees, sparse-row updates, and host render-pass ownership.
Run its root `yarn build`, `yarn lint`, and `yarn test` as well; focused tests do not establish
whole-repository or continuous-motion performance acceptance.

`?diagnostic=worker` enables per-encoded-frame CPU timing logs (`COIT_CPU`). The normal URL does
not log them. A rendered frame is not evidence that all requested detail has finished loading.

## Scene licensing

Coit is hotlinked from the existing public source; this example does not redistribute its bytes.
Public accessibility is not a dataset license. Permission to distribute/promote the scene remains
a release gate separate from the code's MIT license.
