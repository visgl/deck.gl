# Using Layers

Deck.gl is designed to allow you to take any list of objects with which you
can associate positions, and easily render that data on a map.

## Notes on Layer Creation

Every time some state in your application that affects visualization
changes, you simply create new Layer instances with updated properties
and render them.

The constant creation and disposal of Layer instances may seem wasteful,
however the creation and recycling of JavaScript objects is quite efficient
in modern JavaScript environments.

The advantage of this model is that it enables a functional, dataflow
driven application architecture, where the UI is completely rerendered to
correspond to application state whenever that changes. There is no need to
distribute your application state throughout your UI components.


## The id property

The `id` property is similar to the `key` property on React components,
which is used to ensure that new components are matched with their
counterparts from the previous render cycle.
However, in deck.gl, `id` is not optional. It must be unique for each layer
or deck.gl will fail to match layers.

## The data Property and Accessors

Every deck.gl layer takes a `data` property, which the application usually
sets to an array of JavaScript objects. When the layer is about to be
drawn on screen for the first time, the layer will traverse this array
and build up WebGL buffers that allow it to render the data very quickly.
These WebGL buffers are saved and matched with any futre


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

