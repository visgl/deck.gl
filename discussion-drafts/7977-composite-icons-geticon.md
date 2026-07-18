# Composite icons in IconLayer getIcon function

- Discussion: https://github.com/visgl/deck.gl/discussions/7977
- **Recommended action:** MARK EXISTING (@c6p's reply) + short addendum

## Question

Porting a Pixi app: markers are composed of several stacked images (a top asset,
a bottom asset, and a selection overlay) with color transforms. Can `getIcon()`
composite multiple images into one icon, or is there another strategy?

## The existing answer to mark

@c6p's reply already gives the right approach and should be marked as the answer:

> dynamically build SVGs and return them base64-encoded, which are then rendered
> by deck.gl.

That's exactly it — `getIcon` resolves to a *single* image, so you composite the
layers yourself beforehand and hand deck.gl one finished image per marker.

## Optional addendum (post as a follow-up if helpful)

Two things worth adding for the next person who finds this thread:

1. `IconLayer` explicitly supports returning a per-object image definition from
   `getIcon` — this is the "auto packing `iconAtlas`" path in the
   [IconLayer docs](https://deck.gl/docs/api-reference/layers/icon-layer). Any
   URL works, including an SVG (or canvas) data URI:

```js
function buildMarker(d) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <image href="${d.baseUrl}" width="64" height="64"/>
      <image href="${d.topUrl}" width="64" height="64"/>
      ${d.selected ? '<rect width="64" height="64" fill="none" stroke="yellow" stroke-width="4"/>' : ''}
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 64,
    height: 64,
    id: `${d.baseUrl}|${d.topUrl}|${d.selected}` // stable id → dedupe in the atlas
  };
}

new IconLayer({
  data,
  getIcon: buildMarker,
  getPosition: d => d.coordinates,
  getSize: 40,
  pickable: true
});
```

2. Give each composite a stable `id` (as above) so identical composites are
   packed once and reused. Auto-packing is convenient but, per the docs, less
   efficient than a pre-baked `iconAtlas` — so if your set of composites is
   bounded, pre-generate a sprite sheet and use `iconAtlas` + `iconMapping`
   instead. For simple color transforms specifically, `getColor` can tint a
   grayscale icon on the GPU without generating new images at all.

## Notes for reviewer

- **Confidence: high.** Grounded in `docs/api-reference/layers/icon-layer.md`
  ("It is also possible to ask `IconLayer` to generate `iconAtlas` dynamically";
  `getIcon` returning `{url, width, height}`; pre-packed atlas is "the most
  efficient way").
- Canvas `toDataURL()` is an equally valid generator if the compositing needs
  pixel effects SVG can't express.
