# RFC: Stable dash patterns for PathStyleExtension

* Authors: Chris Gervang
* Date: August, 2026
* Status: **Draft**

> **Backend scope:** `PathStyleExtension` remains WebGL-only in this release. It injects GLSL and
> has no WGSL implementation. WebGPU dash and offset support—and enabling the corresponding
> skipped tests—are separate follow-up work.

## Summary

- **New:** `dashMode` selects whether pattern phase restarts at each rendered segment or continues
  across the complete path. Path mode keeps phase continuous through normalized tessellation,
  including generated subdivisions and antimeridian cuts.
- **New:** `dashUnits` selects whether pattern lengths scale with stroke width, remain fixed in
  nominal projected pixels, represent meters, or use common-space units. This makes zoom behavior
  explicit.
- **Fixed automatically:** Existing dashed paths retain coherent arclength and analytic coverage
  across elevation, billboard extrusion, offsets, long paths, and subpixel patterns. These repairs
  do not require application changes.
- **Existing and composable:** `dashJustified` still fits periods to endpoints, and `getOffset`
  still places parallel strokes around one centerline. Both compose with the new controls.
- **Deprecated:** `highPrecisionDash` remains compatible as an alias for `dashMode: 'path'` when
  `dashMode` is omitted.
- **Unchanged defaults:** Omitting the new options preserves segment phase and width-relative dash
  lengths.

Together, these changes let a path express screen-space symbols, physical repetition, fitted edge
patterns, and parallel strokes while retaining the existing mode and unit defaults.

## Motivation and background

Dashes commonly encode planned, uncertain, hidden, intermittent, or unavailable states. They also
represent repeated physical structure, such as lane markings or railway ties. In either case, the
pattern must retain its meaning as geometry is normalized, the camera zooms, or the path moves
through three dimensions. A dash is therefore a property of the stroke, not of the incidental
tessellation used to draw it.

`PathLayer` gives the fragment shader an along-segment coordinate that restarts at every rendered
segment, and the dash shader tests `mod(alongSegment + offset, unitLength)` against the dash size.
With `offset` fixed at zero, the pattern restarts at every segment too. Once a segment is no longer
than the solid dash interval, the modulo never reaches the gap, no fragment is discarded, and the
path renders as a solid line.

The same straight line can therefore look different as its vertex density increases, eventually
appearing solid when every generated segment is shorter than the dash. This is common with GPS
traces, generalized coastlines, routing output, Globe subdivision, and circles or arcs approximated
by short chords. It is confusing to diagnose because zooming in eventually makes segments long
relative to a width-relative pattern and the gaps reappear.

`dashJustified` does not make segment phase continuous. It fits each segment independently, so the
same dense geometry can still appear solid.

### What already exists

`highPrecisionDash` is an existing opt-in that accumulates distance from the start of the path on
the CPU, stores it in a vertex attribute, and uses it as dash phase. It makes equivalent paths with
different vertex densities render the same continuous pattern.

The mechanism works, but the old API and implementation have several shortcomings:

- **The name describes an implementation rather than an outcome.** “High precision” does not say
  that phase continues across rendered segments.
- **The behavior is hard to discover.** Existing documentation leads with cost rather than the
  type of path that needs it.
- **It was mutually exclusive with `dashJustified`.** Justification overrode continuous phase.
- **It derived phase from source paths rather than rendered geometry.** Globe subdivision,
  antimeridian cutting, closed paths, and some binary paths could therefore receive missing or
  incorrect metrics.
- **It was unreliable in important configurations.** Billboard extrusion, elevation, offsets,
  long accumulated paths, and subpixel patterns exposed independent rendering defects addressed
  in the surrounding v9.4 work.
- **Pattern length was only stroke-relative.** A screen-space symbol or physical interval could
  not be expressed independently of stroke width.

## Design model

Path styling is easier to reason about as four independent questions:

| Design dimension | API |
| --- | --- |
| Phase domain: where does repetition continue? | `dashMode` |
| Length measure: what does one pattern unit mean? | `dashUnits` |
| Endpoint fitting: should a run finish cleanly? | `dashJustified` |
| Parallel placement: where is the stroke relative to its centerline? | existing `getOffset` |

### Phase domain

`dashMode: 'segment'` restarts the pattern at each rendered segment boundary, including boundaries
introduced by path normalization or generated tessellation. This is useful for independent polygon
edges or structural panels and avoids CPU distance accumulation.

`dashMode: 'path'` treats those boundaries as tessellation points inside one conceptual stroke. A
route, trace, or trajectory then retains one phase through Globe subdivision, antimeridian cuts,
closed-path normalization, densification, simplification, or resampling.

### Length measure

`dashUnits` separates pattern length from phase. Stroke-relative units express a visual line style,
pixels express nominal screen-space symbology, meters express physical repetition, and common units
express application common-coordinate-space measurements.

Pixel units are zoom-stable projected pixels. They are exact for flat or orthographic paths and are
an approximation under pitch, perspective, or elevation because one along-path scale is used over
each rendered segment. Meter conversion is likewise projection-local. These choices intentionally
behave differently under zoom; the API makes that choice explicit rather than forcing every pattern
to remain the same size on screen.

### Endpoint fitting

`dashJustified` adjusts the period so a whole number of periods spans the active run, with a
half-dash centered at each endpoint. The active run follows `dashMode`: one rendered segment or the
complete path. Because fitting can lengthen or shorten gaps, it is not appropriate when exact
measured spacing must be preserved.

If a segment or complete path is shorter than the requested pattern, the solid interval is clamped
to the fitted period. This treats the short run as fully solid and prevents a negative gap, invalid
duty cycle, or coverage greater than one.

### Parallel placement

`getOffset` is not changed by this RFC, but it belongs to the same stroke model. A path may be
repeated on either side of its centerline, and dash phase, period, and the complete centered
antialiasing envelope must remain consistent on the offset geometry.

## API proposal

### `dashMode`

An optional constructor option on `PathStyleExtension`:

```js
new PathStyleExtension({dashMode: 'path'});
```

| value | behavior |
| --- | --- |
| `'segment'` (default) | The pattern restarts at every rendered segment boundary. |
| `'path'` | The pattern runs continuously from the start of each path. |

All exported constructor option fields remain optional. Options resolve in this order:

1. An explicit `dashMode` wins over `highPrecisionDash`.
2. Otherwise, `highPrecisionDash: true` resolves to `dashMode: 'path'`.
3. Otherwise, `dashMode` resolves to `'segment'`.

`dash: true`, `highPrecisionDash: true`, or either explicit `dashMode` enables dashing. Omitting all
three leaves dashing disabled, so `{offset: true}` remains an offset-only extension.

`'segment'` remains the default because it preserves existing output, needs no CPU phase pass, and
allocates no path-distance attribute. Changing the default would impose both cost and output
changes on existing users.

`dashMode` is a constructor option because `'path'` changes the managed attribute layout. Replacing
the extension object on a same-ID layer is supported: extension-owned attributes and model layouts
are synchronized for live `segment → path → segment` changes.

### `dashJustified` composition

The run fitted by justification follows `dashMode`:

| mode | run being fitted |
| --- | --- |
| `dashMode: 'segment'` | each rendered segment |
| `dashMode: 'path'` | the complete path |

Per-segment fitting gives intentional corners well-defined boundaries but may choose a different
gap for every segment. Whole-path fitting uses one period across interior boundaries while still
finishing cleanly at the path endpoints.

### `highPrecisionDash` deprecation

`highPrecisionDash` remains supported. When `dashMode` is omitted, `highPrecisionDash: true` is an
alias for `dashMode: 'path'`. When both options are supplied, the explicit `dashMode` takes
precedence. The new name describes the phase domain instead of the implementation mechanism.

### `dashUnits`

An optional layer prop selects what `getDashArray` measures:

| value | one dash unit is |
| --- | --- |
| `'widths'` (default) | half the effective stroke width |
| `'pixels'` | one nominal zoom-stable projected pixel |
| `'meters'` | one meter in the layer's geospatial coordinate system |
| `'common'` | one deck.gl common-coordinate-space unit |

`getDashArray` has historically been relative to half the stroke width. This remains a useful
default because the pattern scales with the line. With the `PathLayer` default of
`widthUnits: 'meters'`, both the stroke and a width-relative pattern grow on screen as the user
zooms in. Pixel units instead keep the nominal pattern period stable as the view zooms.

`dashUnits` is a layer prop because it is uniform-driven, allocates no attribute, and may vary per
frame. Composite layers forward the dash controls to their path sublayers.

The prop applies to `PathLayer` and composites that render paths. `ScatterplotLayer` outlines and
`TextLayer` backgrounds use separate signed-distance-field shaders and remain width-relative.

## Compatibility and migration

The additions are backward compatible. `dashMode` resolves to `'segment'` when omitted,
`dashUnits` defaults to `'widths'`, all public constructor options remain optional, and
`highPrecisionDash` remains supported. Existing users do not need to opt into the automatic
billboard, 3D, offset, long-path, justification, or coverage fixes.

The public scalar `getDashOffsets(path)` helper retains its existing return shape. Path-mode
rendering uses a separate private attribute updater that writes `[offset, totalLength]` per rendered
instance. A `vec2` still occupies one vertex attribute slot, so the WebGL attribute ceiling is
unchanged. Applications that supply `data.attributes.instanceDashOffsets` for binary data must use
that internal two-component layout.

Applications that compare stored images may need to regenerate affected screenshots because the
automatic fixes can change pixels while preserving the intended style.

## Prior art

**MapLibre / Mapbox** accumulate distance along each line on the CPU and encode `linesofar` in
vertex data. Their line dash arrays are width-relative and continuous along line geometry. A
renderer focused on tiled line data does not need deck.gl's intentional per-segment mode; deck.gl
accepts arbitrary application paths and retains both phase domains.

**SVG** repeats `stroke-dasharray` continuously along each subpath. A new subpath resets the
pattern, but vertices within one polyline do not. This matches `dashMode: 'path'` for one deck.gl
path.

Both systems establish continuous path phase as the common author expectation. deck.gl keeps
segment phase for data whose rendered segment boundaries are meaningful.

## Alternatives considered

**Make `'path'` the default.** This matches comparable renderers and handles resampled paths well,
but every dashed layer would pay for a CPU pass and another vertex attribute. It would also change
existing output. Rejected for a compatible release.

**Change segment mode so short segments never appear solid.** Restarting a pattern at every
rendered boundary is coherent behavior when those boundaries are intended. The issue is choosing
the wrong phase domain, not an invalid segment implementation.

**Derive complete-path distance on the GPU.** The vertex shader sees the current segment, not a
prefix sum over the path. A compute pass could supply one on WebGPU but would not support WebGL2 or
remove the result attribute.

**Name the option `dashContinuous: boolean`.** A named phase domain composes more clearly with
justification and leaves room for future modes.

**Keep the name `highPrecisionDash`.** The behavior is about phase domain rather than numeric
precision, and the old name makes the intended use difficult to discover.

**Reuse deck.gl's existing `Unit` type.** `Unit` contains `'meters'`, `'common'`, and `'pixels'` but
cannot express the existing stroke-relative behavior. Extending it with `'widths'` would add a
meaningless value to unrelated unit props.

**Use a boolean such as `dashScreenSpace`.** A boolean covers widths and pixels but cannot express
meters or common units.

## Implementation and testing notes

### Continuous phase generation

The private path-mode updater reads normalized `PathTessellator` geometry instead of calling the
source `getPath` accessor again. It fills every rendered segment created by Globe subdivision,
carries phase across antimeridian subpaths without measuring the artificial `+180° → -180°`
bridge, anchors closed paths at their source origin, and supports nested, flat, and CPU-readable
binary paths.

Metrics are refreshed when geometry, coordinate system, model matrix, projection mode, Globe
resolution, or an identity-projection scale changes. Ordinary pan and zoom within the same
projection reuse them. GPU-only geometry that cannot be read on the CPU must provide explicit
`data.attributes.instanceDashOffsets`; otherwise the layer raises an actionable validation error
instead of silently producing zero phase.

### Coordinate conversion and coverage

CPU path distance is accumulated in common space, flat and billboard extrusion meet in projected
pixels, and the fragment shader tests a coordinate normalized by half-width. The shader computes
how many projected pixels one along-path coordinate unit spans, converts the selected dash unit,
and divides the two. This keeps unit conversion independent of the extrusion branch.

Long-path phase is reduced modulo the active period in the vertex shader before it is combined
with the smaller segment-local coordinate. This avoids Float32 cancellation at high zoom.

Fragment derivatives are evaluated before dash or offset rejection, preserving PathLayer's full
centered one-pixel analytic coverage ramp. When rounded dash capsules become smaller than a pixel,
their fallback coverage preserves the geometric capsule area at each transverse scanline rather
than reverting to the rectangular solid-to-period ratio. Final coverage is clamped to `[0, 1]`.

### Performance benchmarks

The benchmark suite provides separate CPU and GPU comparisons. The CPU benchmark exercises
continuous phase generation over large nested and flat paths. The GPU benchmark compares plain
paths, segment and path dashing, alternate units, justification, offset-only styling, and all
controls together across sparse and fragment-heavy workloads. It reports repeatable relative
costs without treating one machine's results as a performance guarantee.

### Test coverage

Backend-neutral unit and preprocessing tests cover guarded GLSL/WGSL arclength compilation,
normalized phase generation, projection invalidation, API compatibility, live mode transitions,
short-path justification, analytic coverage, geometric rounded-cap overlap, composite forwarding,
and unit semantics.

WebGL render tests cover vertex density, mode and justification combinations, all four units, flat
and billboard extrusion, 3D arclength and joints, offsets, long and subpixel patterns, rounded
ends, and picking. Pixel comparison includes antialiased samples and diagonal cases so a reverted
coverage filter cannot hide behind the test harness's default antialias exclusion.

## Limitations and future work

- **WebGPU.** `PathStyleExtension` is explicitly WebGL-only for this release. Its dash and offset
  shaders are GLSL-only, so the related WebGPU render tests remain skipped.
- **Perspective pixel units.** Pixel periods are nominal under pitch, perspective, or elevation;
  exact screen-space integration over projected curves is future work.
- **Projection-local meters.** Meter conversion uses the local projection scale and is approximate
  over very long paths or large latitude ranges.
- **SDF-backed outlines.** `ScatterplotLayer` and `TextBackgroundLayer` remain width-relative and
  do not expose these path-specific phase or fitting controls.
- **One interval pair.** `getDashArray` represents one `[dash, gap]` pair, not an arbitrary
  multi-phase dash-dot sequence.
- **Attribute budget.** Path-continuous phase consumes one vertex attribute in addition to the
  dash-array and offset attributes.
- **Very long paths.** Vertex-shader phase reduction removes the practical local-coordinate freeze,
  but CPU distance still accumulates in Float32 storage.

Potential follow-up work, without commitment in this RFC:

- WGSL support for `PathStyleExtension`, followed by enabling the WebGPU dash and offset tests;
- absolute `offsetUnits` for rail gauges, shoulders, and corridor edges;
- arbitrary repeating interval arrays for multi-phase patterns;
- exact perspective-aware screen-space period integration;
- absolute units for SDF-backed ScatterplotLayer and TextBackgroundLayer outlines;
- reusable repeated-symbol strokes beyond rectangular dash fragments.
