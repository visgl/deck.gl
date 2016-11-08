# Creating Custom Layers

## Choosing the Type of Layer

There are a couple of ways to build a layer in deck.gl

* **Single-primitive, instanced layer** - This is type of layer renders
  the same geometry many times. Usually the simplest way to go
  when creating layers that renders a lot of similar objects (think
  ScatterplotLayer, ArcLayers etc).
* **Single-primitive, dynamic geometry layer** - This is needed when
  dealing with data that needs to be rendered as unique, complies geometries,
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
typical implement the `draw` method and pass those to your render call.
Note that `draw` is called with viewport uniforms that you need to pass
to your shader, but you can of course add any layer
specific uniforms to that.

Note: the reason that the supplied uniforms need to be passed on to your
shaders is to enable your shader to use deck.gl's GLSL shaderlibs such as
`project` or `project64` etc). If you don't use these shaderlibs, you
would obviously not need to supply these uniforms, but you would have to
implement features like cartographic projection etc on your own.

`finalizeState` - If implemented, this method is called when your layer
state is discarded. Use it e.g. to destroy non-shared WebGL resources
directly, rather than waiting for the garbage collector to do it.

A layer is discarded when a new set of layers are rendered and none of
them match (have the same `id` prop) as your old layer.

## Change Detection

Before reading the description of each life cycle method, it is helpful
to consider change detection to understand what work a layer typically
needs to do in response to changes.

* `data` - Typically if a layer is re-rendered with a changed `data` prop,
  all WebGL attributes must be regenerated and the layer needs to be redrawn.
  The default is to do exactly that, but sometimes a layer can be smarter
  and limit updates, or more work needs to be done.

* If the viewport has changed, the layer will automatically be re-rendered.
  Many layers can thus ignore viewport changes, however, if the layer has
  any dependencies on the viewport (such as a layer
  that calculates extents or positions in screen space rather than world space)
  it would need to update state or uniforms whenever the viewport changes.

* If other props change, it would typically mean that the layer needs to
  update some uniform or state so that rendering is affected appropriately.

### Handling property updates

The key to writing good, performant deck.gl layers lies in understanding
how to minimize updates of any calculated data, such as WebGL.

The ideas used here are very similar to (and directly inspired by)
those used in the React/Redux/Flux/Immutable.js communities, and
learning more about those frameworks can be helpful as a way to get a
better understanding of how to use these concepts in the best way.

## Implementing Picking

Picking can be controlled by leveraging or overriding two
lifecycle functions, `pick` and `getPickInfo`.

To take full control of picking, override `pick`. To leverage the
built-in picking while adding layer specific selection information, override
`getPickInfo`.

Technical Note: The default picking implementation uses picking colors.
The layer is rendered with a special uniform set to 1, which causes it to
render into a off-screen frame buffer using `pickingColor` or
`instancePickingColor` attributes instead of using its normal color calculation.

See [`Layer.encodePickingColor`](/docs/custom-layers.md#layerencodepickingcolorindex--number).

## Defining your vertex attributes.

See the separate article on Attribute Management.

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

## Layer Methods

Layer methods are designed to support the creation of new layers through
layer sub-classing and are not intended to be called by applications.

## General Methods

##### Layer.setState()

Used to update the layers state object, which allows a layer to store
information that will be available to the next matching layer.

## Layer Projection Methods

While most projection is handled "automatically" in the layers vertex
shader, it is occasionally useful to be able to work in the projected
coordinates in JavaScript while calculating uniforms etc.

##### Layer.project(lngLatZ, {topLeft = true})

Projects a map coordinate using the current viewport settings.

##### Layer.unproject(xyz, {topLeft = true})

Projects a pixel coordinate using the current viewport settings.

##### Layer.projectFlat(lngLatZ, {topLeft = true})

Projects a map coordinate using the current viewport settings, ignoring any
perspective tilt. Can be useful to calculate screen space distances.

##### Layer.unprojectFlat(xyz, {topLeft = true})

Unrojects a pixel coordinate using the current viewport settings, ignoring any
perspective tilt (meaning that the pixel was projected).

##### Layer.screenToDevicePixels(pixels: Number)

Simply multiplies `pixels` parameter with `window.devicePixelRatio` if
available.

Useful to adjust e.g. line widths to get more consistent visuals between
low and high resolution displays.

## Layer Picking Methods

While deck.gl allows applications to implement picking however they want
(by overriding the `pick` lifecycle method), special support is provided
for the built-in "picking color" based picking system, which most layers
use.

##### Layer.nullPickingColor()

Returns the "null" picking color which is equal the the color of pixels
not covered by the layer. This color is guaranteed not to match any index value
greater than or equal to zero.

##### Layer.encodePickingColor(index : Number)

Returns a color that encodes the supplied "sub-feature index" number.
This color can be decoded later using `Layer.decodePickingColor`.

To get a color that does not correspond to any "sub-feature", use
`Layer.nullPickingColor`.

Notes:
* indices to be encoded must be integers larger than or equal to 0.
* Picking colors are 24 bit values and can thus encode up to 16 million indices.

##### Layer.decodePickingColor(color: Number[3])

Returns the number that was used to encode the supplied picking color.
See `Layer.encodePickingColor`. The null picking color (See
`Layer.nullPickingColor`) will be decoded as -1.

Note: The null picking color is returned when a pixel is picked that is not
covered by the layer, or when they layer has selected to render a pixel
using the null picking color to make it unpickable.

##### Layer.calculateInstancePickingColors

A default picking colors attribute generator that is used for most
instanced layers. It simply sets the picking color of each instance to
the colors that directly encodes the the index of the instance in the
`data` property.
