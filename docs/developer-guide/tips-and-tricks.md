# Tips and Tricks


## Rendering Tips

### Per Layer Control of GPU parameters

The base `Layer` class (which is inherited by all layers) supports a `parameters` property that allows applications to specify the state of GPU parameters such as blending mode, depth testing etc. This can provide significant extra control over rendering.

```js
const layer = new ScatterplotLayer({
  ...,
  parameters: {depthTest: false}
});
```

### z-fighting and Depth Testing

A common problem faced by 3D application developers is known as "z fighting". It relates to multiple objects being drawn at the same depth in the 3D scene, and due to rounding artifacts in the so called z buffer the GPU cannot accurately determine whether a pixel has already been drawn in a specific place.

If you are not using 3D extrusions, the easiest way to get rid of z fighting is typically just to turn off depth testing. It can be done globally or per-layer.

```js
new ...Layer({
  ...,
  parameters: {
    depthTest: false
  }
});
```

Also, if the z-fighting occurs between layers (rather than between elements within a single layers), deck.gl offers a slightly more sophisticated `polygonOffset` property.


### Browser Blending Modes

> Occasionally, the default blending in the browser does not give ideal results. In that case you may want to test the tips in this section.

To understand why browser blending modes can matter, consider that deck.gl renders in a separate transparent div on top of the map div, so the final composition of the image a user see on the monitor is controlled by the browser according to CSS settings instead of the WebGL settings.

One way to control this blending effect is by specifying the CSS property `mix-blend-mode` in modern browsers to be `multiply`:

```css
.overlays canvas {
  mix-blend-mode: multiply;
}
```

`multiply` blend mode usually gives the expected results, as it only darkens. This blend mode keeps the overlay colors, but lets map legends underneath remain black and legible.

**Note:** that there is a caveat with setting `mix-blend-mode`, as it can affect other peer HTML elements, especially other map children (perhaps controls or legends that are being rendered on top of the map).
If this is an issue, set the `isolation` CSS prop on the `DeckGL` parent element.

```css
.deckgl-parent-class {
  isolation: 'isolate';
}
```

## Optimization for Mobile

### Experimental Memory Usage Controls

The `Deck` class supports the following experimental props to aggressively reduce memory usage on memory-restricted devices:

- [_pickable](../api-reference/core/deck.md#_pickable)
- [_typedArrayManagerProps](../api-reference/core/deck.md#_typedarraymanagerprops)

The app can sacrifice certain features and/or runtime performance in exchange for a smaller memory footprint:

```js
new Deck({
  // ...
  _pickable: false,
  _typedArrayManagerProps: isMobile ? {overAlloc: 1, poolSize: 0} : null
})
```

### GPU-only layer attributes

Layers can opt into storing generated attributes only on the GPU by setting [`memory: 'gpu-only'`](../api-reference/core/layer.md#memory). In this mode, CPU-side typed arrays are released after upload, reducing application memory pressure and avoiding typed array pooling overhead.

Because CPU copies are not retained, features that depend on CPU-side attribute values are disabled or downgraded:

- Bounds calculations (`layer.getBounds()` and any culling logic that relies on it) return `null`.
- Attribute transitions are skipped.
- Partial attribute updates regenerate whole attributes or fall back to GPU-side copies, so update ranges are ignored.
- CPU-side validations or transformations that require staging arrays will emit runtime warnings.

Use this mode when your rendering pipeline is GPU-driven and you do not need CPU inspection of attribute data. Switch back to the default memory behavior if you rely on the features above.
