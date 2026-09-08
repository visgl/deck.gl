# Layers, styling and data

## The layer contract

- Layers are **immutable descriptions**. To change anything, create a new layer instance with the
  same `id` and new props, and hand the new array to `deck.setProps({layers})`,
  `overlay.setProps({layers})` or the React `layers` prop. deck.gl diffs old and new props and
  updates the GPU only where needed.
- Never mutate `layer.props`, call `layer.setState`, or keep a layer instance around to "update"
  it. Animation loops recreate the layer every frame with a new `currentTime` or similar prop.
- Accessors (`getPosition`, `getFillColor`, `getRadius`, ...) receive one datum. When an accessor
  closes over external state, list that state in `updateTriggers` so deck.gl recomputes
  attributes: `updateTriggers: {getFillColor: [selectedYear]}`.
- Constant accessors accept plain values: `getFillColor: [255, 140, 0]`.

## Sizes and units

- `radiusUnits`, `lineWidthUnits`, `sizeUnits`: `'meters'` (default for most), `'pixels'`,
  `'common'`. Meter radii disappear at world zoom; pair meter sizes with `radiusMinPixels` /
  `lineWidthMinPixels`, or use pixel units for symbol-like marks.
- `pickable: true` is required for hover and click. Provide `getTooltip` on `Deck`/`DeckGL`
  or the overlay, returning `null` or a string/`{html, style}` object.

## Large data

- Do not build millions of JavaScript objects. Pass binary attributes:
  `data: {length: n, attributes: {getPosition: {value: Float32Array, size: 2},
  getFillColor: {value: Uint8Array, size: 3, normalized: false}}}`. Or use Arrow / GeoArrow
  layers, or tiled data (`MVTLayer`, `TileLayer`, `GeoJsonLayer` over tiles) so only the
  viewport is loaded.
- Fetch and parse with loaders.gl when a format is involved; deck.gl `data` accepts a URL, a
  promise, an iterable or an array.

## Aggregation layers (`@deck.gl/aggregation-layers`)

- `HexagonLayer` and `GridLayer`: `radius` / `cellSize` in meters, `extruded`, `elevationScale`,
  `getColorValue` / `getElevationValue` (or `getColorWeight` + `colorAggregation`), `colorRange`
  (array of RGBA arrays), `colorScaleType` (`'quantize'`, `'quantile'`, `'ordinal'`),
  `upperPercentile` / `lowerPercentile` to clip long tails.
- Count-like data is heavily right-skewed: with defaults nearly every cell lands in the lowest
  color bin. Use `colorScaleType: 'quantile'` or lower `upperPercentile`, and say so in a legend.
- `HeatmapLayer`: `getWeight`, `radiusPixels`, `intensity`, `colorRange`, `colorDomain`; it
  ignores `getFillColor`.
- For 3D, add lighting: `new LightingEffect({ambientLight, directionalLight})` passed via
  `effects`, plus `material` on the layer, and a `pitch` above 0 or extrusion reads flat.

## Animation (`TripsLayer` in `@deck.gl/geo-layers`)

- `getPath`, `getTimestamps` (same length as the path), `currentTime`, `trailLength`,
  `fadeTrail`, `widthMinPixels`, `capRounded`, `jointRounded`.
- Drive `currentTime` from `requestAnimationFrame`, recreating the layer each frame. Loop with
  `(elapsed * speed) % (maxTimestamp)`. In headless or throttled tabs the frame rate may be very
  low; verify with two screenshots that the time actually advances.

## Cartography defaults to question

- A sequential scheme for a categorical field, or a categorical palette for a magnitude, is a
  bug even when it renders.
- Legends belong to every data-driven encoding (color and size); build them from the same
  domain and colors the layer uses.
- On dark basemaps, light low-end colors read as "more", not "less"; on light basemaps, pale
  low ends vanish. Choose the palette after the basemap.
