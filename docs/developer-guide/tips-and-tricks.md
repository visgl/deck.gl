# Tips and Tricks

## Notes on Rendering Control

The base `Layer` class (which is inherited by all layers) supports a new property `parameters` that allows applications to specify the state of WebGL parameters such as blending mode, depth testing etc. This provides a tremendous amount of extra flexibility to applications. The new `parameters` prop leverages the luma.gl v4 [setParameters](http://uber.github.io/luma.gl/#/documentation/api-reference/get-parameter) API, which allows all WebGL parameters to be specified as keys in a single parameter object.


## Notes on Blending Modes

To get a handle on blending modes, it helps to consider that deck.gl
renders in a separate transparent div on top of the map div,
so the final composition of the image a user see on the computer monitor is
controlled by the browser according to CSS settings instead of the WebGL
settings. Unfortuntely, the default blending in the browser typically usually
does not give ideal results and the way the deck.gl development team to improve
the blending effect is by specifying the CSS property `mix-blend-mode`
in modern browsers to be `multiply`:

```css
.overlays canvas {
  mix-blend-mode: multiply;
}
```

`multiply` blend mode usually gives the expected results, as it only darkens.
This blend mode keeps the overlay colors, but let map legends underneath
remain black and legible.

**Note:** that there is a caveat with setting `mix-blend-mode`:
it can affect other peer HTML elements, especially other map children (perhaps
controls or legends that are being rendered on top of the map).
If this is an issue, set isolation CSS prop on the map (DeckGLOverlay parent)
element.

```css
.deckgl-parent-example-class-not-real {
  isolation: 'isolate';
}
```

## Debugging and Instrumentation

deck.gl is built on luma.gl which has extensive debugging and instrumentation
support.

* Automatic checks are performed on your uniforms and attributes.
  Passing an `undefined` value to a uniform is a common JavaScript mistake that
  will immediately generate a descriptive exception in deck.gl. This can be tracked
  from the console output.

* The DeckGL react component has a debug flag which instructs luma.gl
  to instruments the gl context (with a performance cost) which allows
  tracing all WebGL call errors, see below on luma debug priority levels.
  It also generates exceptions immediately when a WebGL operation fails,
  allowing you to pinpoint exactly where in the code the issue
  happened. Due to the asynchronous nature of the GPU, some WebGL execution
  errors are surfaced and caught later than the calls that generate them.

* In the browser console, setting `luma.log.priority` to various values will
  enable increasing levels of debugging.
  + **Level 3** will display all uniforms and attributes before each draw
      call, allowing you to be confident in what values your shaders are
      actually working on.
  + **Level 4** will trace every single gl call.
