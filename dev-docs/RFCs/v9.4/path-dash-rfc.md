# RFC: Segment-invariant dashes for PathStyleExtension

* Authors: Chris Gervang
* Date: August, 2026
* Status: **Draft**

## Summary

This RFC proposes two additions to `PathStyleExtension`, both aimed at the same complaint —
that a dash is not reliably a dash:

* `dashMode`, which decouples the dash pattern from the tessellation of the path it is drawn
  on, deprecating `highPrecisionDash` in its favour.
* `dashUnits`, which decouples the dash size from the stroke width, so a dash can be held
  constant on screen.

They are independent and can be adopted separately. The first is about *where* dashes fall
along a path; the second is about *how large* they are.

## Background

A dash is a property of a stroke. It is not a property of how the geometry underneath that
stroke happens to be divided into segments — but in deck.gl today, it is.

`PathLayer` gives the fragment shader an along-segment coordinate that restarts at every
vertex, and the dash shader tests `mod(alongSegment + offset, unitLength)` against the dash
size. With `offset` fixed at zero, the pattern restarts at every vertex too. Once a segment
is shorter than one dash period, the modulo never leaves the solid part of the pattern, no
fragment is discarded, and the path renders as a solid line.

Six strips drawing the *identical* straight line, differing only in how many vertices it is
built from, with `getDashArray: [4, 5]` on a 10px stroke:

| segments | 1 | 2 | 4 | 12 | 40 | 120 |
| --- | --- | --- | --- | --- | --- | --- |
| measured dash period | 43.4px | 43.4px | 43.4px | 55.4px | **solid** | **solid** |

![dashMode and vertex density](../../../docs/images/path-style/path-style-dash-density.png)

This is not an edge case. Densely sampled geometry is the norm for GPS traces, generalized
coastlines, routing output, and any circle or arc approximated by short chords. The failure
is also confusing to diagnose from the outside, because zooming in eventually makes segments
long relative to the stroke and the dashes reappear — so it presents as "dashes only show up
when I zoom in", which sounds like a resolution problem rather than a tessellation one.

`dashJustified` does not rescue it. Justification is also computed per segment, so on the
same six strips it collapses in exactly the same way.

### What already exists

`highPrecisionDash` is an existing opt-in that does address this. It adds a vertex attribute
whose value is the distance from the start of the path, accumulated on the CPU in
`getDashOffsets`, and feeds that in as the dash phase. On the six strips above it produces
six identical, correct results.

So the underlying mechanism is present and works. What it lacks is the framing, the
discoverability, and the robustness:

- **The name describes an implementation, not an outcome.** "High precision" suggests a
  quality knob for people already unhappy with their dashes, not the fix for a line that is
  rendering solid. Nothing about it says "this is what makes a dash independent of vertex
  count".
- **The docs undersell it.** They describe it as improving "dash rendering quality in
  certain circumstances", list it third of three modes, and lead with a performance warning.
- **It was mutually exclusive with `dashJustified`**, which overrode it outright.
- **It was broken in two configurations** — under `billboard: true` and on paths with a Z
  component. Both are fixed separately from this proposal; they are noted here because they
  are the reason "just tell people to use `highPrecisionDash`" was not a sufficient answer.

## Proposal

### `dashMode`

A constructor option on `PathStyleExtension`:

```js
new PathStyleExtension({dash: true, dashMode: 'path'})
```

| value | behavior |
| --- | --- |
| `'segment'` (default) | The pattern restarts at every vertex. Today's behavior. |
| `'path'` | The pattern runs continuously from the start of each path, invariant to how the path is tessellated. |

`'segment'` remains the default. It is cheaper, it renders dashes at exactly the specified
lengths, and it is correct for data made of long disjoint paths — which is what the existing
default serves well. Changing the default would impose a CPU pass and a vertex attribute on
every existing user to fix a problem only some of them have.

`dashMode` is a **constructor option rather than a layer prop** because `'path'` allocates a
vertex attribute, and attributes are declared in `initializeState` before any prop is read.
`dashJustified`, `dashGapPickable` and `dashUnits` are uniform-driven and so remain layer
props, changeable per frame.

### `dashJustified` composes rather than overrides

Justification stretches the period so a whole number of periods spans a run, starting half a
dash in so both ends finish on a joint. The run it applies to now follows `dashMode`:

| | run being justified |
| --- | --- |
| `dashMode: 'segment'` | each segment |
| `dashMode: 'path'` | the entire path |

Per-segment justification guarantees sharp corners on polyline shapes, which is why it
exists, but it stretches each segment by a different amount and the gaps look uneven.
Whole-path justification keeps the gaps even and still lands cleanly on both ends. Neither
is strictly better, so both remain reachable.

### `highPrecisionDash` is deprecated

It becomes an alias for `dashMode: 'path'` and keeps working unchanged. There is no reason
to break it; it is the same capability under a name that describes the mechanism instead of
the result.

### `dashUnits`

A layer prop selecting what `getDashArray` is measured in:

| value | one dash unit is |
| --- | --- |
| `'widths'` (default) | half the stroke width |
| `'pixels'` | one screen pixel |
| `'meters'` | one metre on the ground |
| `'common'` | one deck.gl common-space unit |

`getDashArray` has only ever been relative to half the stroke width. That is a reasonable
default — dashes stay proportional to the line, which is also what `line-dasharray` does in
MapLibre and what `stroke-dasharray` does in SVG when the stroke is scaled. But `PathLayer`
defaults to `widthUnits: 'meters'`, so the stroke thickens as the user zooms in, and the
dashes lengthen with it. Measured on a stroke with `widthUnits: 'meters'`:

| `dashUnits` | z12 | z13 | z14 |
| --- | --- | --- | --- |
| `'widths'` | 17.6px | 34.7px | 67.9px |
| `'pixels'` | 43.6px | 43.6px | 43.6px |

Both behaviors are wanted. A dash that scales with the line is right for a stroke that
represents a real width; a dash fixed on screen is right when the dash is a legend — "this
boundary is disputed", "this segment is planned" — and should read the same at every zoom.
Until now only the first was reachable.

This is a **layer prop rather than a constructor option** because it is uniform-driven and
allocates nothing, so it can vary per frame.

`'widths'` remains the default, so nothing changes for existing users.

This proposal applies `dashUnits` to `PathLayer` and composite layers that render paths.
`ScatterplotLayer` outlines and `TextLayer` backgrounds use separate signed-distance-field
shaders and continue to interpret `getDashArray` relative to their stroke width. Supporting
absolute units there would require layer-specific perimeter conversions and is left as future
work.

## Prior art

**MapLibre / Mapbox** accumulate distance along the whole line on the CPU into an
`a_linesofar` vertex attribute, which is the same approach `dashMode: 'path'` takes. They
have no per-segment mode at all — `line-dasharray` is always continuous. That is the right
default for a renderer whose input is exclusively vector tiles, where geometry is heavily
sampled and the per-segment behavior would be useless. deck.gl accepts arbitrary
application data and has shipped the per-segment behavior for years, so it keeps both.

**SVG** `stroke-dasharray` is continuous along the whole subpath, and `pathLength` lets an
author restate the length the pattern is measured against. There is no notion of a dash that
resets per segment; a dashed SVG polyline behaves like `dashMode: 'path'`.

The consistent lesson from both is that continuous-along-the-path is what authors expect a
dash to mean. deck.gl's per-segment behavior is the unusual one, which supports exposing the
alternative under a name that says what it does.

## Alternatives considered

**Make `'path'` the default.** Best-looking default and matches every comparable renderer,
but every dashed layer would pay a CPU pass over its geometry and one more vertex attribute,
against a documented ceiling of 16. Rejected as a change to impose silently; worth revisiting
for a major version.

**Fix `'segment'` to not collapse.** There is nothing to fix. Restarting the pattern per
segment is a coherent behavior that some data wants; the pathology is only that it is the
sole option.

**Derive the distance on the GPU instead of the CPU.** The vertex shader sees only the four
positions around the current segment, so a running total along the path is not available to
it. A prefix sum in a compute pass would work on WebGPU but not WebGL2, and would not remove
the attribute.

**Name it `dashContinuous: boolean`.** Two booleans (`dashContinuous`, `dashJustified`)
describe four states, two of which are only meaningful in combination. A named mode reads
better at the call site and leaves room for a future third mode.

**Keep the name `highPrecisionDash`.** The behavior is not about precision, and the name is
the main reason the existing capability goes unused by people hitting exactly the problem it
solves.

**Reuse deck.gl's existing `Unit` type for `dashUnits`.** `Unit` is
`'meters' | 'common' | 'pixels'` and has no member for "relative to the stroke", which is
both the default and the only behavior that exists today. Extending `Unit` itself would give
every other `*Units` prop in the library a value that means nothing to it.

**Express screen-constant dashes as `dashUnits: 'pixels'` versus a boolean like
`dashScreenSpace`.** A boolean covers two of the four cases and leaves no room for the
ground-relative ones, which fall out of the same conversion for free.

## Compatibility

Additive. `dashMode` defaults to `'segment'` and `dashUnits` defaults to `'widths'`, both of
which are the existing behavior; `highPrecisionDash` continues to work. No golden image
changes from either proposal alone.

One internal change: `instanceDashOffsets` widens from a `float` to a `vec2` carrying
`[distance from the start of the path, total length of the path]`, the second component
being what whole-path justification needs. A `vec2` still occupies one attribute slot, so the
16-attribute ceiling is not made tighter.

## Figures

The figures in the extension docs are generated from render-test goldens by
`scripts/dash-figures/compose.mjs`, so a published figure cannot drift from what the code
does. Before/after panels come from `scripts/dash-figures/capture-before.sh`, which reverts
only the three behavior-carrying sources and re-renders — the spec and its geometry stay
current, so both halves of a pair draw the identical scene.

A symptom-to-resolution table in the extension docs separates what upgrading fixes from what
needs a prop. Six of the eleven listed symptoms resolve on upgrade; five need `dashMode` or
`dashUnits`.

## Testing

`test/render/test-cases/path-dash.spec.ts` renders the six-strip segment-density case under
each mode. All six strips draw the identical line, so the assertion is simply that the image
shows six identical strips — a defect in either mode shows up as one strip differing from
its neighbours.

`dashUnits` is covered by rendering the same content at z12, z13 and z14 with
`widthUnits: 'meters'`. The assertion is a comparison *between* the three images: the
`'widths'` rows should double with each level, and the `'pixels'` rows should not move.

One trap is worth recording, since it cost a round here and is easy to repeat. pixelmatch
excludes antialiased pixels from its mismatch count unless `includeAA` is set. Any dash
change that only alters edge coverage is therefore invisible to a golden diff by default —
the prefiltered-coverage work in this series initially passed all but two of its own goldens
with the feature reverted. Cases whose subject is edge coverage must set
`imageDiffOptions.includeAA`, and must put enough affected pixels on screen to clear the
mismatch threshold: horizontal strips have dash ends that land on exact pixel columns and
produce no partial coverage at all, so a diagonal case is required.

## Limitations and future work

- **`ScatterplotLayer` and `TextBackgroundLayer` are unaffected.** Their strokes are single
  continuous outlines with no segment joints, so `dashMode` has nothing to select between.
  They do have a related defect — the pattern does not join cleanly where the outline closes,
  since the perimeter is rarely an integer number of periods — which whole-path justification
  is the natural fix for. Out of scope here.
- **WebGPU.** `PathLayer` has a WGSL source, but `PathStyleExtension` injects GLSL only, so
  dashes silently do nothing on a WebGPU device. Porting the extension is a separate effort.
- **Very long paths.** The phase is reduced modulo the dash period in the vertex shader, so
  fp32 precision no longer limits path length in practice. The remaining limit is the fp32
  accumulation of the distance itself on the CPU.
