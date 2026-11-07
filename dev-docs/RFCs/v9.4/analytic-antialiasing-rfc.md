# RFC: Analytic antialiasing for stroked and point layers

- **Authors**: Chris Gervang
- **Date**: Aug 2, 2026
- **Status**: Implemented

Summary: `PathLayer`, `LineLayer`, `ArcLayer`, and `PointCloudLayer` have no antialiasing of their
own; their edges are smoothed entirely by the framebuffer's MSAA. This RFC proposes an opt-in
`antialiasing` prop that computes edge coverage analytically in the fragment shader, for the
situations where MSAA is unavailable.

## Proposal

Add an `antialiasing` prop to `PathLayer`, `LineLayer`, `ArcLayer`, and `PointCloudLayer`, defaulting
to `false`.

```js
new PathLayer({
  // ...
  antialiasing: true
});
```

`TripsLayer` inherits it by subclassing `PathLayer`. `PolygonLayer` and `GeoJsonLayer` forward their
stroke props explicitly rather than by inheritance, so they expose it as `lineAntialiasing`,
following the existing `pointAntialiasing` precedent in `sub-layer-map.ts`. `ArcLayer` and
`PointCloudLayer` expose the primitive prop directly. The prop name and documentation follow the
existing `ScatterplotLayer.antialiasing` precedent.

The prop selects a compile-time shader variant. The default variant preserves the pre-feature
shader, while changing the prop recreates the layer model and pipeline. Defaulting to `false` keeps
existing rendering and performance unchanged and leaves the choice with applications that know
whether their render target provides MSAA.

This is a targeted remedy for analytic silhouettes, not a replacement for framebuffer MSAA. Where
host or offscreen MSAA is available, applications may continue to use it instead.

## Motivation

Where deck.gl has multisampling today, and which remedy applies. "Host MSAA" is asking the base map
or canvas for `antialias: true`; "luma.gl#2741" is the proposed
[color-only MSAA for offscreen framebuffers](https://github.com/visgl/luma.gl/issues/2741); "this
prop" is `antialiasing: true`.

| Situation | MSAA today | Host MSAA | luma.gl#2741 | This prop | Recommended |
| --- | --- | --- | --- | --- | --- |
| Standalone canvas | yes | on by default | — | optional | nothing needed |
| Standalone + `PostProcessEffect` ([#10404](https://github.com/visgl/deck.gl/issues/10404)) | **no** | no — bypassed | **yes** | yes | luma.gl#2741; this prop meanwhile |
| Interleaved MapLibre / Mapbox | **no** | **yes** | no | yes | either; benchmark for the workload |
| Interleaved Google Maps vector ([#7647](https://github.com/visgl/deck.gl/issues/7647)) | **no** | no option exposed | no | yes | **this prop — only avenue** |
| `@deck.gl/arcgis` | **no** | no | no — depth attachment | yes | **this prop — only avenue** |
| App-supplied `_framebuffer` | **no** | no | if color-only | yes | whichever fits the target |
| WebGPU, any target | **no** | no such attribute | no — deferred | yes | **this prop — only avenue** |
| `PathStyleExtension` offset ([#8063](https://github.com/visgl/deck.gl/issues/8063), [#9395](https://github.com/visgl/deck.gl/issues/9395)) | **no** without analytic coverage | no | no | yes | this prop; the extension now shares its coverage envelope |

Three rows have no alternative at all, and one — post-processing — is better served by luma.gl#2741
than by this proposal. The two efforts overlap only there; neither subsumes the other.

### Why framebuffer MSAA is not enough

The affected layers write a flat color per fragment. Path and line strokes and ArcLayer strips end
at hard geometry edges, while PointCloudLayer discards fragments outside each point's circle. None
computes coverage, so edge quality is inherited from the render target.

A standalone WebGL canvas is usually multisampled by default. That fallback disappears through
three mechanisms:

- **Externally owned contexts.** In interleaved integrations, the base map or SDK chooses the
  context attributes. MapLibre and Mapbox default MSAA off, while Google Maps exposes no option to
  request it. The base map may still draw smooth lines using its own shader coverage, making deck.gl
  strokes stand out.
- **Offscreen render targets.** ArcGIS, `_framebuffer`, and post-processing paths render through
  single-sample framebuffers. Canvas MSAA does not apply to these targets. Proposed luma.gl
  offscreen MSAA would address color-only targets, but not every case in the matrix.
- **WebGPU.** It has no canvas `antialias` attribute. MSAA requires a multisampled target and matching
  pipeline sample count, neither of which deck.gl's current WebGPU path configures.

### Measured impact

A 2px diagonal path rendered into a 240×180 context, counting pixels by alpha:

| context | `antialiasing` | partial-coverage pixels | distinct alpha levels |
| --- | --- | --- | --- |
| no MSAA (base-map-like) | `false` | **0** | **0** |
| no MSAA (base-map-like) | `true` | 1572 | >40 |
| MSAA canvas | `false` | 1361 | 3 |
| MSAA canvas + `PostProcessEffect` | `false` | **0** | **0** |

Without multisampling, every covered pixel is fully opaque and the edge is a hard staircase. Where
MSAA is available it already does most of the work; analytic coverage is then an optional quality
improvement rather than a fix. Adding a post-process effect demonstrates the distinction: the
canvas remains multisampled, but layer rasterization has moved to a single-sample target. These
pixel counts measure coverage quality, not GPU time.

### Performance

The enabled variant extends the rasterized silhouette by half a device pixel, evaluates
screen-space derivatives for covered fragments and blends partial-coverage pixels. Its relative
cost is therefore workload- and backend-dependent, and is likely most noticeable for dense fields
of thin strokes or points where the added edge pixels are a large fraction of the primitive. This
RFC makes no general performance comparison with framebuffer MSAA; applications that can choose
either technique should benchmark representative data, viewport sizes and picking workloads.

The implementation stack was measured on an Apple M1 Max using a 3840×2160 render target and GPU
timestamp queries. The benchmark alternates AA-off and AA-on draws after warm-up; shader compilation,
attribute generation and query readback are outside the measured render passes.

| workload | WebGL2 added GPU time | change | WebGPU added GPU time | change |
| --- | ---: | ---: | ---: | ---: |
| PathLayer: 100K sparse 1px strokes | +0.052 ms | +2.0% | no measurable change | — |
| PathLayer: 256 overlapping 64px strokes | +0.050 ms | +10.8% | +0.043 ms | +12.5% |
| PathLayer: picking, 100K sparse 1px strokes | +0.223 ms | +8.0% | no measurable change | — |
| LineLayer: 100K sparse 1px segments | +0.001 ms | +0.2% | +0.004 ms | +1.0% |
| ArcLayer: 10K sparse 1px arcs, 50 segments | +0.139 ms | +21.2% | +0.025 ms | +3.7% |
| PointCloudLayer: 100K sparse 2px points | +0.177 ms | +6.6% | +0.047 ms | +3.1% |

Normal-rendering additions were below 0.18 ms in these workloads. ArcLayer's 21.2% WebGL result
reflects a small 0.656 ms baseline; its absolute addition was 0.139 ms. An application that remains
inside its frame budget keeps the same frame rate, while a GPU-bound application adds the measured
delta to its frame time. Picking cost is paid only when a picking pass runs, and composite layers
reuse the underlying PathLayer shader rather than adding a separate AA pass.

These results characterize one GPU and driver, not an application-wide guarantee. The repeatable
browser benchmark is available in the implementation stack as `yarn bench-antialiasing` and reports
raw off/on durations, p95 timings and detected device information.

## Design

### Coverage from screen-space derivatives

Every proposed layer already carries a normalized silhouette coordinate as a varying:
`vPathPosition.x` runs `[-1, 1]` across a path (with `length(vCornerOffset)` bounding rounded joints
and caps), `LineLayer` and `ArcLayer` use `uv.y` across their strips, and `PointCloudLayer` carries a
two-dimensional `unitPosition` around each point. The normalized distance to a straight edge is
`1.0 - abs(coord)`; for a point it is `1.0 - length(unitPosition)`.

Converting that to pixels is done by dividing by the coordinate's screen-space derivative:

```glsl
float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
fragColor.a *= clamp(edgePixels + 0.5, 0.0, 1.0);
```

`fwidth` is the coordinate's rate of change per device pixel, so the result is a device-pixel
distance to the boundary, and the `+ 0.5` centers a one-pixel transition on the edge.

A centered transition also needs fragments on both sides of the declared edge. The stroke layers'
triangle strips previously ended exactly at that edge, clipping the outer half of the ramp. When
antialiasing is enabled, their vertex shaders now extend the rasterized envelope by half a device
pixel and scale the silhouette coordinate with it. The declared width and the `coord == 1` boundary
do not move; the additional geometry only gives the fragment shader somewhere to evaluate the
outside half. Because width props and projection helpers use CSS pixels, the padding is divided by
`project.devicePixelRatio` before projection. PointCloudLayer's enclosing triangle is likewise
expanded: its edges are tangent to the unit circle, so without padding the outer ramp is clipped at
three points.

Derivatives are used instead of passing stroke width to the fragment shader. They measure the
silhouette after projection and extension hooks, so the transition remains one device pixel under
perspective foreshortening, device-pixel-ratio changes, and `PathStyleExtension` width adjustments.
The vertex stage uses `project.devicePixelRatio` only to convert the half-device-pixel envelope
padding to CSS pixels.

### Width-only feathering

Only the across-width silhouette is feathered for paths, lines, and arcs. Consecutive segment
instances abut lengthwise, so feathering along the path length would leave a seam at every vertex.
This is the same restriction MapLibre observes — its coverage is purely a function of `v_normal`.
Point clouds feather the complete circular silhouette because their enclosing triangle extends
beyond it.

## Alternatives considered

**Enable MSAA on the base map.** In MapLibre v5 this is `canvasContextAttributes: {antialias: true}`
on the `Map` constructor. This works and is the right first move for an affected application, but it
multisamples the entire canvas, still quantizes coverage to the sample count, and is unavailable in
several integrations and on WebGPU.

**FXAA or TAA post-processing.** luma.gl ships both (`fxaa`, `createTAAShaderPassPipeline`). Neither
fits. Both are full-screen passes, and deck routes those through `DeckRenderer._preRender/_postRender`,
which redirects layer rendering into an offscreen buffer and blits to the target. That breaks the
shared-depth rendering that interleaved mode exists for. FXAA also operates on already-rasterized
pixels and cannot recover missing coverage, while TAA needs several frames to converge and is not
suitable for one-shot high-resolution export.

**Offscreen MSAA in luma.gl.** Benefits every layer rather than only these layers, and is actively
proposed in [luma.gl#2741](https://github.com/visgl/luma.gl/issues/2741). It should land, and it is
the better fix for the post-processing case. It does not reach interleaved base maps, ArcGIS's
depth-attached framebuffer, or WebGPU — see Prior art for the breakdown.

**Alpha-to-coverage.** The most interesting alternative, and the only one that could beat this
proposal on quality. Per-sample masks compose without the alpha-blending artifacts described under
Limitations and can smooth `discard`-defined edges. It is not currently viable: luma does not map
`sampleAlphaToCoverageEnabled` on WebGL; WebGPU requires a multisampled target that deck does not
have; and deriving the mask from fragment alpha double-counts translucent opacity under deck's
blending. An explicit WGSL sample mask becomes worth revisiting once luma.gl#2741 supplies a
multisampled WebGPU target.

## Limitations

Both of the first two are conflation artifacts — consequences of expressing coverage as alpha and
compositing it — rather than anything specific to this design. Per-sample coverage avoids them; see
alpha-to-coverage under Alternatives for why that is not available yet.

- **Flat caps.** The two ends of a path are not feathered, since that would require feathering along
  the path length, and abutting segments would then seam. `capRounded: true` gets smoothed ends.
  `LineLayer` and `ArcLayer` ends are likewise unfeathered.
- **Self-overlap.** Where a stroke overlaps itself, or points overlap each other, the blended edges
  composite twice, the same trade-off `ScatterplotLayer.antialiasing` already documents.

## Prior art

This is long-standing and well-reported ground. The tracker history also shapes what this proposal
should and should not claim.

**luma.gl is the canonical reference for the techniques themselves.**
[Antialiasing and Multisampling](https://luma.gl/docs/api-guide/gpu/gpu-antialiasing) maps artifacts
to remedies across both backends, and is where that taxonomy is being consolidated. It reaches the
same conclusion this proposal rests on: "for analytic shapes such as circles, lines, and
signed-distance-field text, shader-computed coverage with a smooth transition can be more precise
than postprocessing." The sections below cover only what is specific to deck.gl.

**The established answer has been "turn on MSAA in the host."** In
[#5742](https://github.com/visgl/deck.gl/issues/5742) (2021, closed) the guidance was to construct
the `Map` with `antialias: true`, which resolved it for that reporter. That advice is still correct
where it applies, and this proposal does not replace it — see Alternatives. Two things have narrowed
it since: MapLibre v5 moved the option into `canvasContextAttributes`, so the top-level form quietly
does nothing on current versions, and it was never available for Google Maps, ArcGIS, offscreen
targets or WebGPU.

**Google Maps interleaved has been unresolved for over two years.**
[#7647](https://github.com/visgl/deck.gl/issues/7647) (open since Feb 2023) reports exactly this
symptom on vector maps, with multiple independent confirmations through 2025 and no fix. Users'
only workaround is `interleaved: false`, which costs them interleaving and reportedly introduces
z-fighting. This answers empirically what deck's source cannot: the `WebGLOverlayView` context does
not provide multisampling, and unlike MapLibre there is no documented option to ask for it. That
makes an in-shader solution the only avenue there.

**`PathStyleExtension` offset historically broke antialiasing.**
[#8063](https://github.com/visgl/deck.gl/issues/8063) (2023) and
[#9395](https://github.com/visgl/deck.gl/issues/9395) (2025) document the original hard edge. Before
v9.4, the extension defined the stroke's visible boundary with a `discard`, which killed every
sample and clipped the outer half of PathLayer's centered analytic ramp. The extension now defers
fragment rejection until derivatives have been evaluated and lets `PathLayer.antialiasing` own the
lateral boundary. Offset and unoffset paths therefore share the complete coverage envelope when
analytic antialiasing is enabled; non-analytic rendering intentionally retains the hard clip.

**Offscreen MSAA is being addressed separately, and is complementary rather than overlapping.**
[deck.gl#10404](https://github.com/visgl/deck.gl/issues/10404) tracks post-process effects losing
MSAA — independently reproduced for this RFC — and
[luma.gl#2741](https://github.com/visgl/luma.gl/issues/2741) proposes color-only MSAA for offscreen
framebuffers with automatic resolve, superseding
[luma.gl#2702](https://github.com/visgl/luma.gl/issues/2702). Its initial scope is WebGL2, color
attachments only, with depth/stencil explicitly rejected alongside `samples > 1` — which is what
keeps it clear of ArcGIS, and its deferred WebGPU mapping is what keeps it clear of that backend.
Both efforts should land; see the matrix above for the split.

### If luma.gl#2741 lands

No part of this proposal is descoped by it. Interleaved base maps draw into the host's default
framebuffer rather than an offscreen target, and routing them through one would break the depth
interaction that interleaving exists for — the same reason post-process effects cannot be used in
interleaved mode. WebGPU is a deferred follow-up in that RFC. A non-analytic
`PathStyleExtension` offset still uses a hard clip, while enabling analytic coverage gives the
extension a shader-defined envelope that does not depend on the framebuffer's sample count.
ArcGIS could move once multisampled depth is supported, since its framebuffer is depth-attached.

What does change is post-processing. deck's render buffers pass only `colorAttachments`
(`DeckRenderer._prepareRenderBuffers`), and luma auto-creates a depth attachment only when both
attachment lists are empty, so they are genuinely color-only and fall squarely in that RFC's initial
scope. The better fix there is to set `samples` on them, closing
[#10404](https://github.com/visgl/deck.gl/issues/10404) for every layer rather than only the layers
covered here.

## Validation

The implementation is covered at the visual, numerical, shader-source and performance levels:

- Focused WebGL golden tests render dense, thin diagonals on an isolated `antialias: false` device.
  The image diff includes antialiased pixels, so framebuffer MSAA and pixelmatch's default AA
  exclusion cannot hide a missing implementation.
- No-MSAA framebuffer assertions verify continuous partial coverage for all four primitive layers
  and confirm that the stroke geometry includes the outside half of the coverage ramp.
- WebGPU framebuffer tests verify coverage and premultiplied-alpha ordering. Offscreen readback is
  used because the headless software renderer does not present the WebGPU canvas reliably.
- Shader-source tests confirm that the default variants contain no antialiasing code, while the
  benchmark above measures the enabled variants.

WebGPU screenshot goldens can be enabled once CI has hardware WebGPU presentation.

## Follow-ups

- **`ScatterplotLayer` feather is not DPR-aware.** Its `SMOOTH_EDGE_RADIUS` is a fixed 0.5 CSS
  pixels, so at `devicePixelRatio: 2` circles get a two-device-pixel feather. Aligning it with the
  derivative approach used here would make it crisper, at the cost of changing its render baselines.
- **`SolidPolygonLayer`.** Its top surface has the same visible gap, but it is an indexed,
  arbitrarily triangulated fill with no boundary-distance varying. Applying the stroke technique
  would feather internal triangle edges. Supporting it needs a separate tessellation or boundary
  rendering design and remains deferred.
- **Revisit alpha-to-coverage** once [luma.gl#2741](https://github.com/visgl/luma.gl/issues/2741)
  gives WebGPU a multisampled target, which unblocks the `@builtin(sample_mask)` route. That would
  address the flat-cap and self-overlap limitations and the `discard`-defined edges together. Closing
  the WebGL side additionally needs luma to map `sampleAlphaToCoverageEnabled`, which it currently
  ignores. See Alternatives.
- **Set `samples` on the post-process render buffers** once
  [luma.gl#2741](https://github.com/visgl/luma.gl/issues/2741) lands, closing
  [#10404](https://github.com/visgl/deck.gl/issues/10404) for every layer. See Prior art for why
  that is the only row this proposal cedes.
- **Consider defaulting to `true` in a major release**, once the trade-offs have been exercised in
  the wild.
