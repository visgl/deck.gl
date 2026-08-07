# RFC: Analytic antialiasing for PathLayer and LineLayer

- **Authors**: Chris Gervang
- **Date**: Aug 2, 2026
- **Status**: Proposed — implemented in this PR

Summary: `PathLayer` and `LineLayer` have no antialiasing of their own; their edges are smoothed
entirely by the framebuffer's MSAA. This RFC proposes an opt-in `antialiasing` prop that computes
edge coverage analytically in the fragment shader, for the situations where MSAA is unavailable.

## At a glance

Where deck.gl has multisampling today, and which remedy applies. "Host MSAA" is asking the base map
or canvas for `antialias: true`; "luma.gl#2741" is the proposed
[color-only MSAA for offscreen framebuffers](https://github.com/visgl/luma.gl/issues/2741); "this
prop" is `antialiasing: true`.

| Situation | MSAA today | Host MSAA | luma.gl#2741 | This prop | Recommended |
| --- | --- | --- | --- | --- | --- |
| Standalone canvas | yes | on by default | — | optional | nothing needed |
| Standalone + `PostProcessEffect` ([#10404](https://github.com/visgl/deck.gl/issues/10404)) | **no** | no — bypassed | **yes** | yes | luma.gl#2741; this prop meanwhile |
| Interleaved MapLibre / Mapbox | **no** | **yes** | no | yes | either; this prop is cheaper at 4K |
| Interleaved Google Maps vector ([#7647](https://github.com/visgl/deck.gl/issues/7647)) | **no** | no option exposed | no | yes | **this prop — only avenue** |
| `@deck.gl/arcgis` | **no** | no | no — depth attachment | yes | **this prop — only avenue** |
| App-supplied `_framebuffer` | **no** | no | if color-only | yes | whichever fits the target |
| WebGPU, any target | **no** | no such attribute | no — deferred | yes | **this prop — only avenue** |
| `PathStyleExtension` offset ([#8063](https://github.com/visgl/deck.gl/issues/8063), [#9395](https://github.com/visgl/deck.gl/issues/9395)) | **no** — edge is a `discard` | no | no | partial | this prop; full fix needs an extension change |

Three rows have no alternative at all, and one — post-processing — is better served by luma.gl#2741
than by this proposal. The two efforts overlap only there; neither subsumes the other.

## Background

Both layers write a flat color per fragment. `path-layer-fragment.glsl.ts` ends in
`fragColor = vColor` with hard `discard`s at the joints; `line-layer-fragment.glsl.ts` is the same.
There is no coverage computation anywhere, so edge quality is inherited from the render target.

For a plain standalone deck.gl canvas that is fine — luma passes context attributes straight through
and deck never sets `antialias`, so the browser default of `true` applies and MSAA smooths the
strokes.

That fallback disappears in more places than it might seem, and they divide into three mechanisms.

### 1. Externally-owned contexts

deck does not choose the context attributes; the host application or SDK does.

- **`@deck.gl/mapbox`, interleaved.** MapLibre GL JS and Mapbox GL JS both default
  `canvasContextAttributes.antialias` to `false` as a performance optimization (verifiable in
  maplibre-gl `src/ui/map.ts` — `defaultOptions.canvasContextAttributes`). The base map's own lines
  stay crisp because MapLibre computes analytic coverage in `line.fragment.glsl`, scaled by
  `1.0 / u_device_pixel_ratio`, so deck.gl strokes look conspicuously aliased directly against
  smooth base map geometry.
- **`@deck.gl/google-maps`, interleaved.** deck attaches to the context handed to
  `google.maps.WebGLOverlayView.onContextRestored`. Google's context attributes are not documented
  and not determinable from deck's source, but the behaviour is established by report:
  [#7647](https://github.com/visgl/deck.gl/issues/7647) shows vector maps unantialiased with
  `interleaved: true` and antialiased with `interleaved: false`, confirmed by several users over
  two years. Unlike MapLibre there is no option to request MSAA.

### 2. Offscreen render targets

Here MSAA is absent *unconditionally*, whatever the host context was created with, because luma's
WebGL backend has no multisample renderbuffer support — `device.createFramebuffer` always produces a
single-sample target.

- **`@deck.gl/arcgis`.** Always renders into an auxiliary framebuffer (`_framebuffer`) and
  composites it with a fullscreen quad, so deck content is never multisampled regardless of the
  ArcGIS SDK's own context attributes.
- **Any application passing `_framebuffer`** to render into its own target.
- **Any application using a `PostProcessEffect`.** `DeckRenderer._preRender` redirects layer
  rendering into `renderBuffers`, which are plain framebuffers, then blits to the target. This one
  is easy to miss because it affects plain standalone deck.gl with a default canvas: measured on a
  context created with `antialias: true`, adding a single effect takes a 2px diagonal from 1361
  partial-coverage pixels to **0**.

### 3. WebGPU

There is no `antialias` canvas attribute. MSAA requires an explicitly multisampled render target and
a matching pipeline `sampleCount`, and luma's WebGPU canvas context does not configure one —
`RenderPipelineParameters.sampleCount` defaults to `0` and `RenderBundle` only supports `1`. The
`path-layer.wgsl.ts` port inherits the missing coverage with no escape hatch at all.

### Measured impact

A 2px diagonal path rendered into a 240×180 context, counting pixels by alpha:

| context | `antialiasing` | partial-coverage pixels | distinct alpha levels |
| --- | --- | --- | --- |
| no MSAA (base-map-like) | `false` | **0** | **0** |
| no MSAA (base-map-like) | `true` | 719 | 104 |
| MSAA canvas | `false` | 1361 | 3 |
| MSAA canvas + `PostProcessEffect` | `false` | **0** | **0** |

Where the framebuffer provides no multisampling there is no antialiasing from any source — every
covered pixel is fully opaque and the edge is a hard staircase.

The third row is included to show the honest comparison: where MSAA *is* genuinely available it does
most of the work, and analytic coverage is then a quality and cost improvement (continuous vs.
quantized to the sample count) rather than a fix. The fourth row shows how easily that row stops
applying — the canvas still has `antialias: true`, but a post-process effect has moved rasterization
off it.

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

**`PathStyleExtension` offset already breaks antialiasing.**
[#8063](https://github.com/visgl/deck.gl/issues/8063) (2023) and
[#9395](https://github.com/visgl/deck.gl/issues/9395) (2025) are both open. The mechanism is worth
stating because it is not obvious: the extension defines the stroke's visible edge with a `discard`
rather than with geometry, and `discard` kills every sample of a fragment, so MSAA cannot smooth
that edge at all — no context attribute will fix those two issues. Analytic coverage does improve
them, since it computes coverage in the shader instead of relying on the rasterizer. The improvement
is partial: the extension's discard still clips the outer half of the ramp, as recorded under
Limitations. A complete fix means turning that discard into a coverage term inside the extension.

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
interleaved mode. WebGPU is a deferred follow-up in that RFC. And the `PathStyleExtension` offset
edge is defined by a `discard`, which kills every sample of a fragment, so no sample count smooths
it. ArcGIS could move once multisampled depth is supported, since its framebuffer is depth-attached.

What does change is post-processing. deck's render buffers pass only `colorAttachments`
(`DeckRenderer._prepareRenderBuffers`), and luma auto-creates a depth attachment only when both
attachment lists are empty, so they are genuinely color-only and fall squarely in that RFC's initial
scope. The better fix there is to set `samples` on them, closing
[#10404](https://github.com/visgl/deck.gl/issues/10404) for every layer rather than for these two.

## Proposal

Add an `antialiasing` prop to `PathLayer` and `LineLayer`, defaulting to `false`.

```js
new PathLayer({
  // ...
  antialiasing: true
});
```

`TripsLayer` inherits it by subclassing `PathLayer`. `PolygonLayer` and `GeoJsonLayer` forward their
stroke props explicitly rather than by inheritance, so they expose it as `lineAntialiasing`,
following the existing `pointAntialiasing` precedent in `sub-layer-map.ts`. The prop name,
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

**Offscreen MSAA in luma.gl.** Benefits every layer rather than these two, and is actively proposed
in [luma.gl#2741](https://github.com/visgl/luma.gl/issues/2741). It should land, and it is the
better fix for the post-processing case. It does not reach interleaved base maps, ArcGIS's
depth-attached framebuffer, or WebGPU — see Prior art for the breakdown.

**Alpha-to-coverage.** The most interesting alternative, and the only one that could beat this
proposal on quality. Turning coverage into a sample mask rather than an alpha value would fix the two
Limitations below — per-sample masks compose without alpha blending's conflation artifact, so ends
and self-overlaps would stop needing special treatment — and it is the standard remedy for
`discard`-defined edges, which MSAA cannot touch at all. It is parked rather than adopted, for three
separate reasons:

1. **It is a no-op on WebGL.** luma declares `sampleAlphaToCoverageEnabled`
   (`core/src/adapter/types/parameters.ts`) but never maps it —
   `webgl/src/adapter/converters/device-parameters.ts` handles neighbouring parameters and warns on
   unsupported ones, and this one silently falls through.
2. **It is inert on WebGPU.** It does map there
   (`webgpu/src/adapter/helpers/webgpu-parameters.ts` → `multisample.alphaToCoverageEnabled`), but
   that requires `sampleCount > 1` and deck has no multisampled WebGPU target: the canvas has none,
   and offscreen MSAA is luma.gl#2741 again.
3. **It collides with deck's blending.** The mask is derived from fragment alpha, and deck blends
   with `SRC_ALPHA`, so both consume the same value and a translucent layer is counted twice.
   Separating geometric coverage from object opacity needs an explicit sample mask —
   `@builtin(sample_mask)` in WGSL, blocked by (2); in GLSL ES 3.00 it does not exist at all, and the
   `OES_sample_variables` extension that supplies it is unused by luma.

Worth revisiting once luma.gl#2741 lands, since that clears (2) and makes the WGSL path viable.

## Limitations

Both of the first two are conflation artifacts — consequences of expressing coverage as alpha and
compositing it — rather than anything specific to this design. Per-sample coverage avoids them; see
alpha-to-coverage under Alternatives for why that is not available yet.

- **Flat caps.** The two ends of a path are not feathered, since that would require feathering along
  the path length, and abutting segments would then seam. `capRounded: true` gets smoothed ends.
  `LineLayer` ends are likewise unfeathered.
- **Self-overlap.** Where a path overlaps itself the blended edges composite twice, the same
  trade-off `ScatterplotLayer.antialiasing` already documents.
- **`PathStyleExtension` offset.** The extension hard-`discard`s outside `|vPathPosition.x| > 1`
  before layer code runs, clipping the outer half of the centered ramp — coverage reaches ~0.5 at the
  boundary and then cuts. Measured at 0.730 of the un-offset feather, versus 0.328 before this
  design. This improves [#8063](https://github.com/visgl/deck.gl/issues/8063) and
  [#9395](https://github.com/visgl/deck.gl/issues/9395) without closing them; a complete fix means
  turning that discard into a coverage term inside the extension.

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

**Premultiplied alpha** — `test/render/webgpu-antialiasing.spec.ts`. WebGPU blends premultiplied, so
coverage has to reach alpha *before* `deckgl_premultiplied_alpha`; applying it after would leave RGB
too bright for its alpha, a light halo on every edge. The test renders on WebGPU into an offscreen
framebuffer and asserts red tracks alpha at partial-coverage pixels. Moving the multiply after
premultiplication takes the worst overshoot from 2 to 126.

**WebGPU golden coverage** is asserted by hand rather than in CI. `test/render/test-cases/line-layer.spec.ts` wires
`antialiasing: deviceType === 'webgpu'` so one golden can serve both backends, but the `'webgpu'`
row stays commented out: the WebGPU canvas does not present under the headless software renderer CI
runs on, so the screenshot the suite diffs comes back blank whatever deck draws. Reading back an
offscreen framebuffer instead — which sidesteps canvas presentation — `LineLayer`, `PathLayer` and
`ScatterplotLayer` all paint on WebGPU, within a few pixels of their WebGL counts. Enable the row
once CI has hardware WebGPU.

## Follow-ups

- **`ScatterplotLayer` feather is not DPR-aware.** Its `SMOOTH_EDGE_RADIUS` is a fixed 0.5 CSS
  pixels, so at `devicePixelRatio: 2` circles get a two-device-pixel feather. Aligning it with the
  derivative approach used here would make it crisper, at the cost of changing its render baselines.
- **Other stroked layers.** `ArcLayer` and `SolidPolygonLayer` edges have the same gap and are not
  covered by this change.
- **`PathStyleExtension` offset ramp clipping**, above — the remaining half of
  [#8063](https://github.com/visgl/deck.gl/issues/8063) /
  [#9395](https://github.com/visgl/deck.gl/issues/9395). Same underlying problem as the next item: a
  `discard` that alpha cannot soften.
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
