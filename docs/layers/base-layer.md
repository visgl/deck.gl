# Layer Base Class

The `Layer` class is the base class of all deck.gl layers, and it provides
a number of **base properties** which are availabe in all layers.

## Common Layer Properties

### Basic Properties

##### `id` (String, optional)

The id must be unique among all your layers. The layer's id defaults to the
`Layer` class name. If you have more than one instance of the same
`Layer` subclass you must supply unique id strings.

Note that for sublayers, the actual layer id is going to be the supplied
layer id appended to the parent layer's (i.e. the composite layer's) id,
which helps avoid id collisions in this case.

E.g. assuming a composite GeoJsonLayer layer that renders two sublayers,
choropleths and lines, with those ids:

    new GeoJsonLayer({id: 'street-grid'});

Will generate the following layers and ids:

    GeoJsonLayer: 'street-grid'
    ChoroplethLayer: 'street-grid-choropleth'
    LineLayer: 'street-grid-choropleth'

React Note: `id` is similar to the `key` property used in React to match
components between rendering calls.

##### `visible` (Boolean, optional)

- Default: `true`

Whether layer is drawn.

For performance reasons it is often better to control layer visibility
with the `visible` prop rather than through conditional rendering.

Compare:

    const layers = [
      new MyLayer({visible: showMyLayer});
    ];

with

    const layers = [];
    if (showMyLayer) {
      new MyLayer({visible: showMyLayer});
    }

In the second example (conditional rendering) the layer state will
be destroyed and regenerated every time the showMyLayer flag changes.

##### `opacity` (Number, required)

The opacity of the layer. deck.gl automatically applies gamma to the opacity
in an attempt to make opacity changes appear linear (i.e. the opacity is
visually proportional to the value of the prop.)

Note: While it is a recommended convention that all deck.gl layers should
support the opacity prop, it is up to each layer's fragment shader
to implement support for opacity.

### Interaction Properties

Layers can be interacted with using these properties.

##### `pickable` (Boolean, optional)

- Default: `false`

Whether layer responds to mouse events.

##### `onHover` (Function, optional)

This callback will be called when the mouse hovers over the deck.gl
viewport. The callback will be called for every layer that has
both `visible` and `picking` properties set. When hovering over a
feature drawn by the layer will be detected and mapped to an index.

The function will be called with a single parameter `info`, which is an
object that contains a variety of fields describing the mouse or touch
event and what was hovered.

If index is -1, no feature was matched for this layer

**Requires `pickable` to be true.**

##### `onClick` (Function, optional)

This callback will be called when the mouse clicks on the deck.gl
viewport. The callback will be called for every layer that has
both `visible` and `picking` properties set. When clicking on a
feature drawn by the layer this will be detected and mapped to an
index in the data prop.

The function will be called with a single parameter `info`, which is an
object that contains a variety of fields describing the mouse or touch
event and what was clicked.

If index is -1, no feature was matched for this layer

**Requires `pickable` to be true.**

## Coordinate System Properties

Normally only used when the application wants to work with coordinates
that are not Web Mercator projected longitudes/latitudes.

##### `projectionMode` (Number, optional)

Specifies how layer positions and offsets should be interpreted.

The default is to interpret positions as latitude and longitude, however it
is also possible to interpret positions as meter offsets from the
`projectionCenter` prop.

See the article on Coordinate Systems for details.

##### `projectionCenter` ([Number, Number], optional)

Required when the `projectionMode` is in meter offsets.

Specifies a longitude and a latitude from which meter offsets are calculated.

See the article on Coordinate Systems for details

##### `viewMatrix` (Number[16], optional)

An optional 4x4 matrix that is premultiplied into the affine projection
matrices used by shader `project` GLSL function and the
Viewport's `project` and `unproject` JavaScript function.

Allows local coordinate system transformations to be applied to a layer,
which is useful when composing data from multiple sources that use
different coordinate systems.

Note that the matrix projection is applied after the non-linear mercator
projection calculations are resolved, so be careful when using view matrices with lng/lat encoded coordinates.

### Data Properties

While many applications only use the `data` property, there are a number
of additional properties that provide extra control over data
iteration, comparison and update.

##### `data` (Iterable Object or Array, optional)

- Default: `[]`

The data prop should contain an iterable JavaScript container,
please see JavaScript `[Symbol.iterator]`.

Note: To avoid forcing applications to add checks during rendering
while e.g. initializing asynchronous data, deck.gl allows data to be
omitted or supplied as null (or undefined). These cases are treated
as if an empty array had been supplied.

##### `dataIterator` (ES6 Iterator, optional)

Normally the iterator for data is extracted by looking at the
`[Symbol.iterator]` field of the supplied container. Sometimes
`[Symbol.iterator]` is not defined, or doesn't provide the desired
iteration order, so deck.gl allows you to supply your own iterator.

Note: deck.gl even supplies an object iterator (`makeObjectValueIterator`)
making it possible to use objects directly as `data` props in deck.gl
without first converting them to arrays.

    import {ScatterplotLayer, objectValueIterator} from `deck.gl`;
    new ScatterplotLayer({
      data: {element1: [0, 0], element2: [1, 1]},
      dataIterator: makeObjectValueIterator(data)
    });

##### `dataComparator` (Function, optional)

This prop causes the `data` prop to be compared using a custom comparison
function. The comparison function is called with the old data and the new
data objects, and is expected to return true if they compare equally.

Used to override the default shallow comparison of the `data` object.

As an illustration, the app could set this to e.g. 'lodash.isequal',
enabling deep comparison of the data structure. This particular examples
would obviously have considerable performance impact and should only
be used as a temporary solution for small data sets until the application
can be refactored to avoid the need.

##### `numInstances` (Number, optional)

deck.gl is often able to autodetect the number of objects in your `data` prop,
however in special situations it can be useful to control this directly.

##### `updateTriggers`

This prop expects an object with keys matching attribute names.
Each attributeName will contain an object with keys representing property names.
If any property mentioned in the updateProps has changed, the corresponding
attribute will be invalidated.

This way, if an attribute update depends on properties other than data,
the layer can ensure that the attribute gets autoupdated when those props
change.

The value of `updateTriggers` is a map with fields corresponding to
attribute names (or `all`). Each field has a value which is an object,
it can contain any amount of data. The data for each field is compared
shallowly, and if a change is detected, the attribute is invalidated
(all attributes are invalidated if the `all` key is used.)

Note: updateTriggers are ignored by the normal shallow comparison, so it is
ok for the app to mint a new object on every render.

##### "attributes" properties

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
