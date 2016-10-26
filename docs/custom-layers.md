# Creating Custom Layers


## Choosing the Type of Layer

There are a couple of ways to build a layer in deck.gl

* **Single-primitive, instanced layer** - This is type of layer renders
  the same geometry many times. Usually the simplest way to go
  when creating layers that renders a lot of similar objects (think
  ScatterplotLayer, ArcLayers etc).
* **Single-primitive, dynamic geometry layer** - This is needed when
  dealing with data that needs to be rendered as unique, comples geometries,
  such as polygons.
* Multi-primitive layer - it sometimes desirable to have a single layer
  render using multiple primitives. Note that it often useful to keep
  layers focused on drawing one thing well, and having the application
  compose them to get desired effects,.
* Composite layer - a layer that creates other layers. This allows you to
  build e.g. a "semantic layer" - a layer that presents a different interface
  (set of props) than an existing layer, transforms those props into
  a format that fits and existing layer, and renders that.

Note that there is no strict division between layers that draw and composite
layers, a layer could do both. That said, it often makes sense to keep your
layers simple.


## Implementing the Layer Lifecycle Functions


### Creating, Destroying and Drawing Layers

`initializeState` - This is the one method that you must implement to create
any WebGL resources you need for rendering your layer.

deck.gl looks for the variable `model` on your state, and if set expects it
to be an instance of a [luma.gl] `Model` class. It then uses this model
during rendering and picking etc meaning that you don't have to do anything
more to get a working layer.

`draw` - If you want to use custom uniforms or settings when drawing, you would
typicall implement the `draw` method and pass those to your render call.
Note that `draw` is called with viewport uniforms that you need to pass
to your shader, but you can of course add any layer
specific uniforms to that.

Note: the reason that the supplied uniforms need to be passed on to your
shaders is to enable your shader to use deck.gl's GLSL shaderlibs such as
`project` or `project64` etc). If you don't use these shaderlibs, you
would obviously not need to supply these uniforms, but you would have to
implement features like cartographi projection etc on your own.

`finalizeState` - If implemented, this method is called when your layer
state is discarded. Use it e.g. to destroy non-shared WebGL resources
directly, rather than waiting for the garbage collector to do it.

A layer is discarded when a new set of layers are rendered and none of
them match (have the same `id` prop) as your old layer.


### Handling property updates

The key to writing good, performant deck.gl layers lies in understanding
how to minimize updates of any calculated data, such as WebGL.

The ideas used here are very similar to (and directly inspired by)
those used in the React/Redux/Flux/Immutable.js communities, and
learning more about those frameworks can be helpful as a way to get a
better understanding of how to use these concepts in the best way.


## Defining your vertex attributes.

See the separate article on Attribute Managemement.

Some questions to ask yourself.
- Will you support altitude?
- Do you need 64 bit support?
- Do you want to opt in to deck.gl's lighting system?


## Writing the Shaders

For details, please see the separate article on shaders.


### Supporting Map Coordinates

While you have the freedom to create any type of layer you want,
with any type of coordinate system that suits your application, a common
characteristic of the layers provided by deck.gl is that they work seamlessly
as map overlays, both with positions specified as longitude and latitude
coordinates, as well as with positions specified in meters.

Deck.gl makes it easy to make your own layers work this way too. You just need
to import the `project` package in your shader file and the functions will be
made available to your shader.


