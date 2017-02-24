# deck.gl API and Layer Design Guidelines

An evolving set of API design guidelines intended to ensure that we offer
a consistent, easy-to-learn API to our end users even as we add new layers and
features.

## Design Principles
First we define some abstract principles to define our general API design
philosophy. The intention is that these can help us all get on the same page
in terms of API vision, and help guide us in specific API design decisions
when detailed recommendations covering a specific case are not available.

* **Simplicity** - deck.gl was designed to be a very simple way to create
  and package WebGL visualizations APIs - Avoid creating APIs that do many
  things. Make APIs focused and composable.
* **Layers** - When designing layers, think about ease of subclassing.
  If you have lots of options and primitives in your layer, it will not
  be easy for others to use.
* **Avoid “Magic”** - deck.gl aims for a transparent API that makes it
  clear to the user what happens at every stage.
  Makes it easy to get introduced to WebGL and shader programming through
  deck.gl. This aligns with luma.gl, which exposes one class for every WebGL
  type.
* **Reactive first** - deck.gl is designed to work in a
  [“Reactive architecture”](https://en.wikipedia.org/wiki/Reactive_programming)
  application. It is great if it works well in other paradigms as well
  but this is a secondary goal.

## Design Guidelines

This is a list of specific design rules that have been agreed upon.
Exceptions to all rules can always be made if there is a good justification
(which should be documented somewhere if possible, in code comments, docs or
similar).

## Rules for Defining and Naming Layers

### Basic Principles

* **“Small” Set of Core Layers** - We want a small selection of versatile core layers,
  that are simple to understand and learn and easy to extend through subclassing.
* **Groups of Related Layers** - Ideally we'd like to have small “groups” of similar
  layers organized together. The layers within a group should be designed to
  address one type of problem (e.g. general geospatial visualizations,
  geo visualizations using S2 library, 3D chart layers,
  Mathematical layers, etc) and within each group w should at least have a
  consistent design in terms of features, naming of properties etc.
* **Reasonably Flexible Layers** - We want layers to be flexible and handle a
  reasonable variety of use cases (to avoid having to maintain many very
  similar layers)
* **Avoid Overly Large/Complicated Layers** - Flexibility, but not at the
  expense of making our layers large and complicated so that they become
  hard to subclass and extend - that is a signal that the layer should be
  divided.
* **Orthogonality/Future Proofing** - Features should be added only after some
  thought has been given to the impact of supporting a similar feature on
  other similar layers and also to impact on future versions.
* **64-bit Layers**
  32 vs 64 bits: Until we can unify 32 and 64 bit layers (or fix the perf impact of 64 bits), we should offer both 32 and 64 bit versions (or only a 32 bit version, but never just a 64 bit version).
  Naming: 64 bit layers will simply have the number `64` added at the end. ScatterplotLayer vs. ScatterplotLayer64.
* **Consistency** We want to be consistent when offering 64 bit versions of our
  layers, so at least within a given “group” of layers all layers should
  either have 64bits or not.
* **Geospatial** 64 bits is most valuable for geospatial layers, other layers
  that are primarily designed for non-geo use cases probably do not need
  >1.000.000x zoom.
* **2D vs 2.5D (extrusion)/3D Support**
  Simple “3D”: A “2D” layer can offer “3D” support without additional
  consideration if the cost in terms of code complexity and performance
  is small. E.g. the line layer can add a z coordinate to its positions
  with very little complexity and performance impact.
* **Consistency within Layer Groups** - The layers withing a group should have a
  similar ambition in terms of 3D, e.g. the core geospatial layers in general
  try to provide 2.5D (extrusion) and low cost Z-coordinate support.
* **Lighting and effects: TBD**
* **Splitting Layers** - If the code is significantly different between 2D and 3D
  it can be better to split into two layers - perhaps even into two layer
  groups. Some effort should be done to clean up code and check if sharing
  of some parts is possible.
* **Functional Variants of Layers**
  Examples are Brushed, Animated, Enhanced etc layers.
  Unless of a compelling reason, we will probably want to provide these as
  examples rather than supported layers. When we have dynamic shaders we
  may be able to auto inject such features into existing layers using a
  handful of props.


## Rules for Naming Props, Attributes, Uniforms and updateTriggers

Summary: Custom layer props usually refer to either attributes or uniforms.
An accessor (like "getColor") always sets a WebGL attribute (whether a value
or a function), and a normal prop (like "color") always sets a uniform
(either to a value, or a value returned by calling the supplied function).
That seems more orthogonal to me.

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

A property that controls shader uniforms should typically be named the same
as the uniform, to simplify code readability.
A uniform related property typically takes only one value (either a number or a short array)
It typically sets a uniform of the same name with the given value
(either directly or after some simple transformation, e.g. applying gamma to opacity).

### Naming rules for "Modifier" props (Scale/Offset)

Special care should uniform that modifies an attribute (e.g. as a multiplier,
or additive element).

* **Naming** For some well-known modifier concepts, like `opacity`
(which modifies the forth component of the value returned byt the `getColor` accessor),
it is natural to stay with the well-accepted term.

* **Naming** Otherwise it is recommended to use a composite noun that
  indicates that the attribute in question is being modified. We use the
  `...Scale` suffix for multiplicative modifiers and `...Offset` suffix
  for additive modifier props (e.g: `radiusScale`, or `elevationOffset`).

* **Justification** Carefully consider if the layer really needs a modifier.
  Is the use case common enough that it makes sense, or is there another way
  to achieve the same effect. E.g. an `elevationOffset` or `elevationScale`
  propscould be handled by the `modelMatrix` prop in many situations.

* **Documenation** Extra care must be taken with documentation to make
  sure that the layer user understands the interaction between modifying
  props and accessors.

* **Default values** Unless there are strong reasons, multiplicative props
  (e.g. `radiusScale`) should always default to 1, and additive props to 0.

### Naming rules for groups of uniform-related props

* If a set of uniforms belong to certain module, it may make sense to given them
  a common prefix or suffix (`lightDirection`, `lightColorAmbient`, `lightColorDirectional`, …)
* If a set of uniforms belong to the same module/effect, it could make sense to
  package them into a single `settings` object. `lightSettings`.

### Alignment of property naming between layers

It is important that properties are consistent between layers,
especially between layers in a layer group, as this can dramatically affect
the user's ability to learn and easily work with deck.gl.

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

## Design Decisions

This is a list of specific issues that have been raised and discussed, and current position/decision

### Overloading props and APIs on types?

Decision: LIMITED. We should be conservative with overloading,
but it is acceptable if the value is significant (in terms of
simplification of the API etc), as long as the resulting API remains
intuitive and documentation and tests are provided.

E.g. make a prop take both a function and a string, and do different
but similar things dependending on which type was supplied
