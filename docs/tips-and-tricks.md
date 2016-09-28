# Tips and Tricks

## Notes on Blending Modes

To get a handle on blending modes, it helps to consider that deck.gl
renders in a separate transparent div on top of the map div,
so it is actually the browser that blends the deck.gl output into the map,
not WebGL, and the default blending in the browser typically does not give
ideal effects.

There is a CSS property `mix-blend-mode` in modern browsers
that allows control over blending:
```
.overlays canvas {
  mix-blend-mode: multiply;
}
```
`multiply` blend mode is usually the right choice, as it only darkens.
This will keep your overlay colors, but let map legends underneath
remain black and legible.

**Note:** that there is a caveat with setting `mix-blend-mode`:
it can affect other peer HTML elements, especially other map children (perhaps
controls or legends that are being rendered on top of the map).
If this is an issue, set isolation CSS prop on the map (DeckGLOverlay parent)
element.
```
     isolation: 'isolate'
```

## Notes on data property

The `data` property will accept any containers that can be iterated over using
ES6 for-of iteration, this includes e.g. native Arrays, ES6 Sets and Maps,
all Immutable.js containers etc. The notable exception are native JavaScript
object maps. It is recommended to use ES6 Maps instead.

It is recommended, but not required, to use immutable data (containers AND
objects) as it ensures that changes to `data` property trigger a rerender.
(See the notes on `rerenderCount` and `updateCount` properties.)


## Notes on picking

**Note**: Because DeckGL layers are designed to take any type of iterable
collection as data (which may not support "random access" array style
references of its elements), the picking calculates and index but the
actual object.

FEATURE IDEA: The base layer could take an optional getObject(index) accessor
and call it if supplied.


## Notes on WebGL buffer management

deck.gl Layers were designed with data flow architectures like React in mind.
The challenge is of course that in the react model, every change to application
state causes a full rerender. The rendering callbacks are then supposed to
detect what changes were made a limit rerendering as appropriate. When you
have a couple of 100K element WebGL buffers to update, this can become quite
expensive unless change detection is well managed.


### Data Management using automatic Buffer updates

The layer will expect each object to provide a number of "attributes" that it
can use to set the GL buffers. By default, the layer will look for these
attributes to be available as fields directly on the objects during iteration
over the supplied data set. To gain more control of attribute access and/or
to do on-the-fly calculation of attributes.


### Manual Buffer Management

For ultimate performance and control of updates, the application can do its
own management of the glbuffers. Each Layer can accept buffers directly as
props.

**Note:** The application can provide some buffers and let others be managed
by the layer. As an example management of the `instancePickingColors` buffer is
normally left to the layer.

**Note**: A layer only renders when a property change is detected. For
performance reasons, property change detection uses shallow compare,
which means that mutating an element inside a buffer or a mutable data array
does not register as a property change, and thus does not trigger a rerender.
To force trigger a render after mutating buffers, simply increment the
`renderCount` property. To force trigger a buffer update after mutating data,
increment the `updateCount` property.

