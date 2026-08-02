# RFC: Analytic antialiasing for PathLayer and LineLayer

- **Authors**: Chris Gervang
- **Date**: Aug 2, 2026
- **Status**: Proposed — implemented in this PR

Summary: `PathLayer` and `LineLayer` have no antialiasing of their own; their edges are smoothed
entirely by the default framebuffer's MSAA. This RFC proposes an opt-in `antialiasing` prop that
computes edge coverage analytically in the fragment shader, for the two situations where MSAA is not
available: interleaved rendering into a base map, and WebGPU.

## Background

Both layers write a flat color per fragment. `path-layer-fragment.glsl.ts` ends in
`fragColor = vColor` with hard `discard`s at the joints; `line-layer-fragment.glsl.ts` is the same.
There is no coverage computation anywhere, so edge quality is inherited from the render target.

For a standalone deck.gl canvas that is fine — luma passes context attributes straight through and
deck never sets `antialias`, so the browser default of `true` applies and MSAA smooths the strokes.

There are two situations where that fallback does not exist.

**Interleaved base maps.** MapLibre GL JS and Mapbox GL JS own the WebGL context in interleaved
mode and both create it with `antialias: false` as a performance optimization. deck.gl layers drawn
into that context receive no multisampling. The base map's own lines stay crisp because MapLibre
computes analytic coverage in `line.fragment.glsl`, scaled by `1.0 / u_device_pixel_ratio` — so
deck.gl strokes look conspicuously aliased directly against smooth base map geometry.

**WebGPU.** There is no `antialias` canvas attribute. MSAA requires an explicitly multisampled
render target and a matching pipeline `sampleCount`, and luma's WebGPU canvas context does not
configure one — `RenderPipelineParameters.sampleCount` defaults to `0` and `RenderBundle` only
supports `1`. The `path-layer.wgsl.ts` port inherits the missing coverage with no escape hatch at
all.

### Measured impact

A 2px diagonal path rendered into a 240×180 context, counting pixels by alpha:

| context | `antialiasing` | partial-coverage pixels | distinct alpha levels |
| --- | --- | --- | --- |
| no MSAA (base-map-like) | `false` | **0** | **0** |
| no MSAA (base-map-like) | `true` | 719 | 104 |
| MSAA | `false` | 1361 | 3 |

Without MSAA and without the prop there is no antialiasing from any source — every covered pixel is
fully opaque and the edge is a hard staircase. The third row is included to show the honest
comparison: where MSAA *is* available it does most of the work, and analytic coverage is a quality
and cost improvement (continuous vs. quantized to the sample count) rather than a fix.

## Proposal

Add an `antialiasing` prop to `PathLayer` and `LineLayer`, defaulting to `false`.

```js
new PathLayer({
  // ...
  antialiasing: true
});
```

`PolygonLayer`, `GeoJsonLayer` and `TripsLayer` inherit it through `PathLayer`. The prop name,
default-off ergonomics and documentation register follow the existing `ScatterplotLayer.antialiasing`
precedent.

Defaulting to `false` keeps every existing render output byte-identical and leaves the choice with
applications that know whether their context has MSAA.

## Design

### Coverage from screen-space derivatives

Both layers already carry a normalized silhouette coordinate as a varying: `vPathPosition.x` runs
`[-1, 1]` across the stroke width (with `length(vCornerOffset)` bounding rounded joints and caps),
and `LineLayer`'s `uv.y` runs `[-1, 1]`. The distance to the edge in those units is
`1.0 - abs(coord)`.

Converting that to pixels is done by dividing by the coordinate's screen-space derivative:

```glsl
float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
fragColor.a *= clamp(edgePixels + 0.5, 0.0, 1.0);
```

`fwidth` is the coordinate's rate of change per device pixel, so the result is a device-pixel
distance to the boundary, and the `+ 0.5` centers a one-pixel transition on the edge.

The derivative approach was chosen over passing the stroke half-width down as a varying, which was
the first implementation and was wrong in two ways:

- **Extensions that rescale the stroke.** `PathStyleExtension`'s `offset` inflates the width via
  `DECKGL_FILTER_SIZE` and separately rescales `vPathPosition.x`, so a half-width varying read after
  the filter overstates the band it addresses. The feather collapsed to `1/offsetWidth` of a pixel —
  measured at 0.328× the un-offset feather for `getOffset: 1`, where `offsetWidth` is 3.
- **Perspective foreshortening.** A ground-plane path under pitch is narrower on screen than
  `widthPixels`, so the feather came out too tight in any tilted view.

Derivatives absorb both automatically, along with device pixel ratio. That last point also removes a
plumbing problem: the `project` shader module is registered for the vertex stage only, so
`project.devicePixelRatio` is not reachable from the fragment shader. The varying approach had to
fold DPR in at the vertex stage; the derivative approach needs nothing from the vertex stage at all,
and both vertex shaders are untouched by this change.

### Width-only feathering

Only the across-width silhouette is feathered. Consecutive `PathLayer` segment instances each draw
half of the shared joint and abut along the miter direction, so feathering along the path length
would leave a seam at every vertex. This is the same restriction MapLibre observes — its coverage is
purely a function of `v_normal`.

## Alternatives considered

**Enable MSAA on the base map.** In MapLibre v5 this is `canvasContextAttributes: {antialias: true}`
on the `Map` constructor. This works and is the right first move for an affected application, but it
multisamples the entire canvas — at a 3840×2160 CSS canvas with `devicePixelRatio: 2` that is a
7680×4320 multisampled buffer — and still quantizes coverage for sub-pixel strokes. It is also not
available on WebGPU.

**FXAA or TAA post-processing.** luma.gl ships both (`fxaa`, `createTAAShaderPassPipeline`). Neither
fits. Both are full-screen passes, and deck routes those through `DeckRenderer._preRender/_postRender`,
which redirects layer rendering into an offscreen buffer and blits to the target. Interleaved mode
does the opposite — it draws directly into the base map's bound framebuffer, once per layer group, so
base map layers can depth-interact with deck layers. A post-process pass collapses that into a flat
composited quad and runs over a mostly-transparent buffer, where FXAA's luminance edge detection
misbehaves. Beyond the plumbing, FXAA operates on the already-rasterized image and cannot recover
coverage that was never captured, and TAA needs several frames to converge, which is wrong for
one-shot high-resolution export.

**Offscreen MSAA in luma.gl.** Would benefit every layer rather than these two, but luma's WebGL
backend has no multisample renderbuffer support today (only the constants), so this is a much larger
change.

## Limitations

- **Flat caps.** The two ends of a path are not feathered, since that would require feathering along
  the path length. `capRounded: true` gets smoothed ends. `LineLayer` ends are likewise unfeathered.
- **Self-overlap.** Where a path overlaps itself the blended edges composite twice, the same
  trade-off `ScatterplotLayer.antialiasing` already documents.
- **`PathStyleExtension` offset.** The extension hard-`discard`s outside `|vPathPosition.x| > 1`
  before layer code runs, clipping the outer half of the centered ramp — coverage reaches ~0.5 at the
  boundary and then cuts. Measured at 0.730 of the un-offset feather, versus 0.328 before this
  design. Fixing it fully means turning that discard into a coverage term inside the extension.

## Testing

Two complementary tests. Every assertion below was verified by breaking the code it guards and
confirming the test fails.

**Golden image** — `test/render/test-cases/path-antialiasing.spec.ts`. A golden diff can cover this,
but only with three changes to the render-test setup. Without any one of them the test passes with
the feature completely disabled, which is how the first attempt behaved:

1. **A device created with `antialias: false`**, so MSAA is not doing the smoothing. The render test
   canvas otherwise takes the browser default of `true`, which is the one condition where the prop
   is redundant. `runRenderTestSuite` now accepts `webgl` context attributes.
2. **`includeAA: true` in the image diff.** This is the decisive one. pixelmatch detects
   antialiased pixels and excludes them from the mismatch count by default, and this prop changes
   nothing *but* antialiased pixels — so the diff is structurally blind to it regardless of MSAA or
   geometry. `TestCase.imageDiffOptions` now threads it through, and also honours `tolerance`, which
   was previously declared but ignored.
3. **A scene dense with thin shallow diagonals, and a tightened `threshold`.** The prop only changes
   edge pixels, so edges must be a large enough fraction of the frame to register.

With all three, disabling the feather drops the match to 99.06% against a 99.8% threshold.

**Coverage assertions** — `test/render/path-antialiasing.spec.ts`. Creates its own `antialias: false`
device, reads back the framebuffer and asserts on coverage numerically, which catches things an
image diff cannot express:

- Deleting the feather drops the antialiased pass from 719 partial pixels to 0.
- Restoring the previous varying-based implementation reproduces the 0.328 offset collapse.

## Follow-ups

- **`ScatterplotLayer` feather is not DPR-aware.** Its `SMOOTH_EDGE_RADIUS` is a fixed 0.5 CSS
  pixels, so at `devicePixelRatio: 2` circles get a two-device-pixel feather. Aligning it with the
  derivative approach used here would make it crisper, at the cost of changing its render baselines.
- **Other stroked layers.** `ArcLayer` and `SolidPolygonLayer` edges have the same gap and are not
  covered by this change.
- **`PathStyleExtension` offset ramp clipping**, above.
- **Consider defaulting to `true` in a major release**, once the trade-offs have been exercised in
  the wild.
