# Tips and Tricks

## Notes on Blending Modes

To get a handle on blending modes, it helps to consider that deck.gl
renders in a separate transparent div on top of the map div,
so it is actually the browser that blends the deck.gl output into the map,
not WebGL, and the default blending in the browser typically does not give
ideal effects.

There is a CSS property `mix-blend-mode` in modern browsers
that allows control over blending:

    .overlays canvas {
      mix-blend-mode: multiply;
    }

`multiply` blend mode is usually the right choice, as it only darkens.
This will keep your overlay colors, but let map legends underneath
remain black and legible.

**Note:** that there is a caveat with setting `mix-blend-mode`:
it can affect other peer HTML elements, especially other map children (perhaps
controls or legends that are being rendered on top of the map).
If this is an issue, set isolation CSS prop on the map (DeckGLOverlay parent)
element.

    isolation: 'isolate';

## Notes on data property

The `data` property will accept any containers that can be iterated over using
ES6 for-of iteration, this includes e.g. native Arrays, ES6 Sets and Maps,
all Immutable.js containers etc. The notable exception are native JavaScript
object maps. It is recommended to use ES6 Maps instead.

It is recommended, but not required, to use immutable data (containers AND
objects) as it ensures that changes to `data` property trigger a re-render.
(See the notes on `rerenderCount` and `updateCount` properties.)

## Notes on picking

**Note**: Because DeckGL layers are designed to take any type of iterable
collection as data (which may not support "random access" array style
references of its elements), the picking calculates and index but the
actual object.

## Debugging and Instrumentation

deck.gl is built on luma.gl which has extensive debugging and instrumentation
support.

* Automatic checks are performed on your uniforms and attributes.
  Passing an `undefined` value to a uniform is a common JavaScript mistake
  that normally results in no warnings and no output from the shaders,
  often causing simple errors to be time consuming to debug, however in
  deck.gl will immediately generate a descriptive exception.

* The DeckGL react component has a debug flag which instructs luma.gl
  to instruments the gl context (this has a performance cost) which allows
  tracing all calls, see below on luma debug priority levels.
  It also generates exceptions immediately when a WebGL operation fails,
  allowing you to pinpoint exactly where in the code the issue
  happened. Due to the asynchronous nature of WebGL, you would normally
  receive these errors as warning at a later time during code execution.

* In the browser console, setting `luma.log.priority` to various values will
  enable increasing levels of debugging.
    - **Level 3** will display all uniforms and attributes before each draw
      call, allowing you to be confident in what values your shaders are
      actually working on.
    - **Level 4** will trace every single gl call.
