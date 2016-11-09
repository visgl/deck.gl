# Using Layers

Deck.gl is designed to allow you to take any list of objects with which you
can associate positions, and easily render that data on a map.

## Notes on Layer Creation

Every time some state in your application that affects visualization changes,
you simply create new layer instances with updated properties and pass them to
deck.gl for rendering.

The constant creation and disposal of layer instances may seem wasteful,
however the creation and recycling of JavaScript objects is quite efficient
in modern JavaScript environments.

The advantage of this model is that it enables a functional, reactive
application model, where the UI is completely re-rendered to correspond to
application state changes. There is no need to distribute your application
state throughout your UI components.


## The id Property

The `id` property is similar to the `key` property on React components. It is
used to ensure that new components are matched with their counterparts from the
previous rendering cycle. However, unlike React.js, the `id` property is not
optional in deck.gl. It must be unique for each layer or deck.gl will fail to
match layers.


## The data Property and Accessors

Every deck.gl layer takes a `data` property, which the application usually
sets to an array of JavaScript objects. When the layer is about to be
drawn on screen for the first time, the layer will traverse this array
and build up WebGL buffers that allow it to render the data very quickly.
These WebGL buffers are saved and matched with any future changes.

The `data` property will accept any containers that can be iterated over using
ES6 for-of iteration, this includes e.g. native Arrays, ES6 Sets and Maps,
all [Immutable.js](https://facebook.github.io/immutable-js/)
containers, etc. Even native JavaScript objects can be passed in as data containers to deck.gl, by supplying the `dataIterator` prop to enable
iteration over object values.

As a side note, use of Immutable containers and data structures is fairly
common in applications that follow the Reactive architecture. While using
them is by no means required, their use does ensure that deep changes to
the `data` property always triggers a re-render.


## Notes on picking

**Note**: Because the deck.gl layers are designed to take any type of iterable
collection as data (which may not support "random access" array style
references of its elements), the picking calculates and index but the
actual object.
