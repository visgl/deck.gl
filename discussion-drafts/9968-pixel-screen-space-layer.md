# Pixel-based (Screen-space) Layer in deck.gl

- Discussion: https://github.com/visgl/deck.gl/discussions/9968
- **Recommended action:** DRAFT NEW (asker self-resolved with a CPU-scaled CompositeLayer; a cleaner built-in answer is worth recording)

## Question

The asker wants something that behaves like an `IconLayer` but is **pixel/screen-space**:
it should keep a consistent size (and ideally position) in the viewport
regardless of pan/zoom — like a three.js gizmo. They ask whether a custom layer
is needed, whether deck.gl layers are "world-space only," and whether a simpler
built-in option exists. They ended up building a `CompositeLayer` that overrides
`shouldUpdateState` and scales geometry inversely with zoom on the CPU (noting a
GPU/shader approach would be better).

## Draft answer

Great writeup — and the good news is you probably don't need the CPU scaling for
the common cases. It depends on which of two things you actually want:

**1. Constant on-screen *size*, but still anchored to a world position.**
This is built in — no custom layer needed. Most 2D layers accept
`'pixels'` size units, which is the default for `IconLayer`/`TextLayer` and
available on others via `radiusUnits`/`lineWidthUnits`/etc. An icon with
`sizeUnits: 'pixels'` stays the same pixel size at every zoom while tracking its
lng/lat:

```js
new IconLayer({
  data,
  getIcon: d => 'marker',
  getPosition: d => d.coordinates,
  getSize: 24,
  sizeUnits: 'pixels',        // default for IconLayer — constant on-screen size
  // sizeMinPixels / sizeMaxPixels also available to clamp
});
```

See [`sizeUnits`](https://deck.gl/docs/api-reference/layers/icon-layer#sizeunits)
and the [unit system](https://deck.gl/docs/developer-guide/coordinate-systems#supported-units)
(`pixels`, `common`, `meters`). This is the "behaves like IconLayer but pixel-based"
answer — the pixel behavior is a prop, not a different layer type.

**2. Elements *fixed to the viewport* (e.g. a gizmo pinned to a corner),
independent of any world coordinate.**
That's not really a layer concern — layers draw in world/common space. deck.gl's
mechanism for screen-anchored UI is the
[Widget API](https://deck.gl/docs/api-reference/widgets/overview), which is
framework-agnostic and renders in the DOM over the canvas (see the built-in
[compass](https://deck.gl/docs/api-reference/widgets/compass-widget) /
[zoom](https://deck.gl/docs/api-reference/widgets/zoom-widget) widgets, or write a
custom one). A widget is the clean way to get a truly screen-fixed gizmo.

**If you genuinely need screen-space *geometry* inside the deck canvas** (your
gizmo case), your `CompositeLayer` instinct is right, and you can avoid the CPU
rescale by moving it to the GPU: the `project` shader module exposes a
`project_pixel_size_to_clipspace()` GLSL helper that offsets a vertex by a pixel
amount in clip space, so a custom/subclassed layer can size and offset geometry
in pixels without any per-frame CPU work — which is the "GPU-based shader
approach" you mentioned wanting. This is exactly how the built-in layers keep
`'pixels'` units on the GPU; see the
[subclassed-layers guide](https://deck.gl/docs/developer-guide/custom-layers/subclassed-layers)
(search `project_pixel_size_to_clipspace`) and
[coordinate systems](https://deck.gl/docs/developer-guide/coordinate-systems).
deck.gl layers are *not* fundamentally world-space only; the coordinate system
and units are configurable.

So: for constant size, reach for `sizeUnits: 'pixels'`; for viewport-fixed UI,
reach for a Widget; keep the custom layer only for bespoke in-canvas screen-space
geometry.

## Notes for reviewer

- **Confidence: high for options 1 & 2; medium for the shader detail in option 3**
  (the `project_size` GLSL API is real but the asker would need the custom-layers
  guide to implement it — link `docs/developer-guide/custom-layers/` if desired).
- Verified: `sizeUnits` default `pixels` on `IconLayer`
  (`docs/api-reference/layers/icon-layer.md`); Widget API and widget catalog
  (`docs/api-reference/widgets/`); coordinate systems / supported units
  (`docs/developer-guide/coordinate-systems.md`).
- The draft credits the asker's self-solution rather than dismissing it.
