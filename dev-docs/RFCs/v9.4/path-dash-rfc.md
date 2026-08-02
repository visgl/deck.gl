# RFC: Segment-invariant dashes for PathStyleExtension

* Authors: Chris Gervang
* Date: August, 2026
* Status: **Draft**

## Summary

This RFC proposes `dashMode` on `PathStyleExtension`, which decouples the dash pattern from
the tessellation of the path it is drawn on, and deprecates `highPrecisionDash` in its
favour.

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

## Compatibility

Additive. `dashMode` defaults to `'segment'`, which is the existing behavior;
`highPrecisionDash` continues to work. No golden image changes from this proposal alone.

One internal change: `instanceDashOffsets` widens from a `float` to a `vec2` carrying
`[distance from the start of the path, total length of the path]`, the second component
being what whole-path justification needs. A `vec2` still occupies one attribute slot, so the
16-attribute ceiling is not made tighter.

## Testing

`test/render/test-cases/path-dash.spec.ts` renders the six-strip segment-density case under
each mode. All six strips draw the identical line, so the assertion is simply that the image
shows six identical strips — a defect in either mode shows up as one strip differing from
its neighbours.

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
