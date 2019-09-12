# deck.gl Design Guidelines

An evolving set of design guidelines intended to ensure that deck.gl is
a consistent framework that is easy-to-learn as new layers and features keep
 being added.

## Design Principles
The design principles listed here reflects deck.gl's general API design
philosophy.

* **Simplicity** - deck.gl was designed to be a very simple way to create
  and package WebGL visualizations APIs - Avoid creating APIs that do many
  things. Make APIs focused and composable.
* **Layers** - When designing layers, think about ease of subclassing.
  If a layer has lots of options and primitives, it's not easy to further
  extend it.
* **Avoid “Magic”** - deck.gl aims to have a set of transparent APIs that
  makes the effects brought by them clear to the users.
  Users can choose to learn WebGL and shader programming through deck.gl.
  This aligns with luma.gl, which exposes one class for every WebGL
  type.
* **Reactive first** - deck.gl is primarily designed to work in a
  [“Reactive architecture”](https://en.wikipedia.org/wiki/Reactive_programming)
  application. It can be used in other programming paradigms but its support
  comes secondary.

## Design Guidelines

This is a list of design rules that general applies to everything in the framework.
However, exceptions are sometimes necessary when there is an actual need and justification
for it. Whenever this is happening, it needs to be documented somewhere, in code comments,
docs, or other places that are easy to track.

## Rules for Defining and Naming Layers

### Basic Principles

* **“Small” Set of Core Layers** - A small selection of versatile core layers
  that are simple to understand and easy to extend through subclassing are provided
  with deck.gl.
* **Groups of Related Layers** - The intention is to have groups of layers that
  each of the groups addresses one type of problem (e.g. general geospatial visualizations,
  geo visualizations using S2 library, 3D chart layers, Mathematical layers, etc).
  Consistency should be maintained throughout the same group in terms of features,
  naming of properties etc.
* **Reasonably Flexible Layers** - Layers comes with deck.gl needs to be flexible
  and handle a reasonable variety of use cases.
* **Avoid Overly Large/Complicated Layers** - Flexibility, but not at the expense of
  making layers large and complicated so that they become hard to subclass and extend
   - that is a signal that the layer should be divided.
* **Orthogonality/Future Proofing** - Features should be added only after some
  thought has been given to the impact of supporting a similar feature on
  other similar layers and also to impact on future versions.
* **64-bit Layers**
  64-bit support of the layers, if offered, will be through a fp64 prop settable by
  deck.gl's users. 64-bit support is usually provided if the layers are
  expected to be used to visualize data with extremely high dynamic range, such as
  many cases in geospatial data visualization.
* **2D vs 2.5D (extrusion)/3D Support**
  Simple “3D”: A “2D” layer can offer “3D” support without additional
  consideration if the cost in terms of code complexity and performance
  is small. E.g. the line layer can add a z coordinate to its positions
  with very little complexity and performance impact.
* **Lighting and effects**
  Layers with extrusion support (2.5D) or 3D should respond correctly to lights through
  the lighting packages provided by deck.gl. This includes providing necessary APIs for
  setting light parameters.
* **Splitting Layers** - If the code is a significantly different variant of the
  same layer (such as 2D and 3D), splitting into two might be necessary - perhaps even
  into two layer groups. Some effort should be done to clean up code and check if code
  reuse is possible.
* **Functional Variants of Layers**
  Functional variants of layers such are Brushed, Animated, Enhanced etc, will be provided
  as examples rather than supported layers to help users implement similar
  functionality for themselves.

## Rules for Data Iteration and Access

A general ambition is that all deck.gl layers should accept any "ES6 container"
in the `data` prop. This includes ES6 Sets and Maps, as well as Immutable.js
containers. For most layers the only requirement is that iteration
over data is performed using general functions:
```
    for (const object of this.props.data) { ... } // GOOD
    this.props.data.forEach((object, index) => ...) // GOOD
```
Note that the following will NOT work on general containers:
```
    for (let i = 0; i < this.props.data.length; i++) { // NOT GOOD
      const object = this.props.data[i];
      ...
    }
```
Special attention is normally only required when accessing elements using
keys or indices. deck.gl provides internal functions `get` and `count` to
handle such cases:
```
    for (let i = 0; i < count(this.props.data); i++) { // GOOD
      const object = get(this.props.data, i); // instead of this.props.data[i]
      const value = get(object, 'value'); // instead of object.value
    }
```
Remarks:
* deck.gl does not attempt to support plain objects as `data`.

## Rules for Naming Props, Attributes, Uniforms and updateTriggers

Summary: Custom layer props usually corresponds to either attributes or uniforms
of the underlying shaders.
An accessor (like "getColor") always sets a WebGL attribute (whether a value
or a function), and a normal prop (like "color") always sets a uniform
(either to a value, or a value returned by calling the supplied function).

### Naming Rules for Accessors (i.e. attribute related props)

An attribute is called `instancePositions` or `positions`, `instanceColors` or
`colors`, etc.
The property associated with that attribute is called `getPosition`, `getColor` etc:
the attribute name with `instance` and the plural removed.

Such property is called an accessor. Its value must be a function, in which
case it is applied to every element in data to extract the data.

The `updateTrigger` for that accessor is named after the accessor:
`getColor`, `getPosition`.

### Naming rules for props that control uniforms

A property that controls shader uniforms should typically be named the same as the uniform
it intends to set.
A uniform related property typically takes only one value (either a number or a short array)

### Naming rules for "Modifier" props (Scale/Offset)

Special care should be applied when naming a uniform that modifies an
attribute (e.g. as a multiplier, or additive element), to ensure that
the semantics of the property is easily understood by the user.

* **Naming** For some well-known modifier concepts, like `opacity`
(which modifies the fourth component of the value returned by the `getColor` accessor),
it is natural to stay with the well-accepted term.

* **Naming** Otherwise it is recommended to use a composite noun that
  indicates that the attribute in question is being modified. We use the
  `...Scale` suffix for multiplicative modifiers and `...Offset` suffix
  for additive modifier props (e.g: `radiusScale`, or `elevationOffset`).

* **Justification** Carefully consider if the layer really needs a modifier.
  Is the use case common enough that it makes sense, or is there another way
  to achieve the same effect.

* **Documentation** Extra care must be taken with documentation to make
  sure that the layer user understands the interaction between the modifying
  props and accessors (E.g. `getRadius` vs. `radiusScale`), as well as the
  making clear what units the value being scaled is in (meters etc.)

* **Default values** Unless with exceptional and well-documented reasons,
multiplicative props (e.g. `radiusScale`) should always default to 1,
and additive props to 0.

### Naming rules for props that control "sizes"

* **Screen Space** Any prop that defines an extent or distance in screen space
  pixels should have the suffix `Pixels`, e.g. `widthPixels`, `radiusMinPixels`,
  unless the prop has a name that clearly indicates that the unit is pixels,
  such as `strokeWidth`, i.e. **`stroke`** is generally assumed to be in pixels.
* **World Space** Any prop that defines an extent or distance in world space
  is named without a suffix (e.g. `width`, `radius`). In cartographic projection
  modes, world space distances will be interpreted in meters according to the
  local projection scale in other projection modes world space distances will
  be taken as unit coordinates.

### Naming rules for groups of uniform-related props

* If a set of uniforms belong to a certain module, it's a common practice to have them
  come with a common prefix or suffix (e. g. `lightDirection`, `lightColorAmbient`,
  `lightColorDirectional`, …)
* If a set of uniforms belong to the same module/effect, it could make sense to
  package them into a single `settings` object. (e. g. `lightSettings`)

### Alignment of property naming between layers

It is important that properties are consistent between layers, especially between
layers in a layer group, as this can dramatically affect the user's ability to learn
and work with deck.gl.

### Naming of updateTriggers

Update triggers should be named the same as the accessor property
for the vertex attribute.

The attribute manager now accepts an `accessor` field that can be a string
or an array of strings - these will be automatically be used as update triggers
for that attribute.

```js
new Layer({
  updateTriggers: {
    getColor: {...},
    instanceColors: {...}  // deprecated, backwards compatibility
  }
});
```
