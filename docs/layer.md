# Layer Class

The `Layer` class is the base class of all deck.gl layers. It defines
the life cycle of the layers, and provides a number of methods


## Common Parameters


### `id` (string, required): layer ID


### `viewport` (Viewport, optional, default=injected)

Viewport


### `pickable` [bool, optional, default=false]

Whether layer responds to mouse events


### `visible` [bool, optional, default=true] whether layer is drawn

For performance reasons it is sometimes better to control layer visibility
with a flag rather than not rendering them, as the latter approach will cause
the layer state to be destroyed and regenerated.


### `opacity` (number, required)

The opacity of the layer. deck.gl automatically applies gamma to the opacity
in an attempt to make opacity changes appear linear (i.e. the opacity is
visually proportional to the value of the prop.)

It is up to each layer's fragment shader to implement support for opacity.


### data

The data prop contains an iterable JavaScript container, see [Symbol.iterator].


### dataIterator

Normally the iterator for data is extracted by looking at [Symbol.iterator]
field of the supplied container. Sometimes it is valuable

deck.gl supplies an object iterator making it possible to use objects directly
as `data` props in deck.gl, even though the JavaScript language not providing
such facilities.

### deepEqual

This prop causes the `data` prop to be compared using deep equality.
This has a considerable performance impact and should only be used
for small data sets.


### updateTriggers

This prop expects an object with keys matching attribute names.
Each attributeName will contain an object with keys representing property names.
If any property mentioned in the updateProps has changed, the corresponding
attribute will be invalidated.

This way, if an attribute update depends on properties other than data,
the layer can ensure that the attribute gets autoupdated when those props
change.


### "attributes" properties

The layer will look for properties with names matching its attributes,
and if present, assume their contents is a typed array or WebGLBuffer,
and pass them directly to the shader. This also disables the automatic
attribute calculation.

This is intended to support applications that want to optimize attribute
calculation. Perhaps only a few data items change each frame, and recalculating
all attributes is unnecessary. Or maybe the application uses several layers
that share the same attributes (typical when using multiple layers to
create effects like shadows or highlights around the primary primitives),
making it desirable to avoid having multiple layers repeat the same
automatic attribute recalculations.

This allows an application to supply its own buffers properties.
If attributes are shared between layers, a useful technique is to create
a separate AttributeManager and calculate the attributes once, and then
pass them in as "overrides" to the layers.


