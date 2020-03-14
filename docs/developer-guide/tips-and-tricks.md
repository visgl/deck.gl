# Tips and Tricks


## Rendering Tips

## Per Layer Control of WebGL parameters

The base `Layer` class (which is inherited by all layers) supports a `parameters` property that allows applications to specify the state of WebGL parameters such as blending mode, depth testing etc. This can provide signigicant extra control over rendering.

The new `parameters` prop leverages the luma.gl v4 [setParameters](https://luma.gl/docs/api-reference/gltools/parameter-setting) API, which allows all WebGL parameters to be specified as keys in a single parameter object.


## z-fighting and Depth Testing

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


## Browser Blending Modes

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
