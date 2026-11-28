---
name: deckgl-performance
description: >-
  Diagnose and fix slow deck.gl apps: avoiding unnecessary data and accessor
  changes, updateTriggers, constant and trivial accessors, binary data and
  direct attributes, toggling visible instead of removing layers, incremental
  loading and picking cost. Use when a deck.gl visualization stutters,
  re-generates attributes too often, or must scale to millions of objects.
---

# deck.gl performance

Reference: `docs/developer-guide/performance.md`,
`docs/developer-guide/debugging.md`.

## Minimize data changes

- Keep the same `data` reference when nothing changed. Building a new array
  every render (e.g. `data.filter(...)` inline) regenerates every attribute.
  Memoize instead.
- Use `updateTriggers` to recompute only the accessor that depends on new
  state, rather than changing `data`.
- For streaming or paged data, load incrementally (see "Handle incremental
  data loading") instead of rebuilding one huge array.
- Toggle `visible: false` rather than removing a layer: removal throws away
  GPU buffers that must be rebuilt when it comes back.

## Optimize accessors

- Prefer constants (`getFillColor: [255, 0, 0]`) over functions when every
  object shares the value.
- Keep accessor functions trivial: property reads, no allocation. Use the
  `target` argument to fill a pre-allocated array.

## Binary data

For millions of rows:

- Pass typed arrays via `data.attributes` with `length`, e.g.
  `{length, attributes: {getPosition: {value: Float32Array, size: 2}}}`.
- Or supply attributes directly so deck.gl skips the per-object accessor
  loop entirely. Apache Arrow works well here (see
  `docs/developer-guide/using-with-arrow.md`).

## Rendering and picking

- Fewer, larger layers beat many small ones.
- Only set `pickable: true` on layers that need it; picking renders an extra
  pass on hover.
- Throttle expensive `onHover` work.

## Debugging

- In the browser console, `deck.log.enable(); deck.log.level = 2` shows
  which layers update and why (see `docs/developer-guide/debugging.md`).
- In the browser profiler, look for `updateAttributes`; frequent calls mean
  `data` or triggers change more often than intended.
