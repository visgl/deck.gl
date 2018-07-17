# RFC: Lightweight Property Type System for deck.gl

* **Authors**: Ib Green
* **Date**: Jan 2018 (update from Aug 2017)
* **Status**: Review


# Abstract

For a number of reasons (see use cases below) is useful to have access to descriptions of the types of the various properties in a layer. This RFC proposes a lightweight, backwards compatible prop type system implemented as an extension to the current `defaultProps` mechanism. This enables layers to opt-in to specifying types, and also offers a certain amount of type auto-deduction to happen based on existing default values for layers that do not opt in.

```js
Layer.defaultProps = {
  maxRadius: {type: 'number', value: 1, min: 0, max: 1000},
  ...
}
```


# Motivation

### Use Cases

For multiple reasons (outlined in this RFC) it would be useful to support a prop types system in deck.gl
* Enable specification of advanced (e.g. async) properties
* Transitions and Animation
* Type Checking (during development)
* "Reflection" (the layer browser use case, auto discovering layer's props and types)



## Proposal - Extending default props

```
const defaultProps = {
  radiusScale: {value: 1, min: 0}, // {type: 'number'} inferred. No max value.
  highlightedObjectIndex: {value: -1, type: 'integer', min: -1},
  drawOutline: false, // {type: 'boolean' , value: false} inf
  getRadius: ..., // {type: 'function'} inferred
};
```

Notes:
* **Open Ranges** - It's fairly ugly to use `Math.MAX_` constants, just leave the max or min out to specify open ranges
* **Dynamic Limits** - Should the type system be aware of some dynamic limits, like `numInstances`?
```
const defaultProps = {
  highlightedObjectIndex: {type: 'integer': min: -1, max: '#instances'),
  ...
};
```
* **Deprecation Support** - Should we be able to specify a prop as deprecated directly in the prop types?
```
const defaultProps = {
  radius: {deprecated: 'radiusScale'}, // deprecated in favor of radiusScale
  radius: {removed: 'radiusScale'}, // removed in favor of radiusScale
  ...
};
```
* **optimize prop comparison**
In this case, the layer manager could automatically do deep compares of colors since we know these will be short arrays.
```
const defaultProps = {
  color: {type: 'color-rgba', ... }
  ...
};
```
* **automatic type conversion invocation** - We could support color strings for colors, since we know which fields accept colors. We already have an highly optimized `parseColor` method.
```
CustomLayer.defaultProps = {
  color: {type: 'color-rgba', ... }
  ...
};
new CustomLayer({
  color: '#FFEEDD' // string to color converted automatically invoked
})
```


## Extensibility

### Future Idea: Deep-equal on short arrays?

A complication with reactive 3D programming in JavaScript, is that short arrays (representing colors, positions, normals etc) are very common and even though arrays are references, these conceptually represent “primitive” objects that could be expected to compare equally based on value, like JavaScript strings. Even if two arrays contain the same values, they will not compare as equal using default shallow comparisons.

These failed comparisons trigger updates of the reactive state (needlessly resetting uniforms or even recalculating attributes) which hurt performance.

So an app would have to be careful to supply the same array every render to avoid triggering an update. E.g. this innocent looking code:
```js
new Layer({
  color: [255, 0, 0]
});
```
will trigger an update on every render.

Changing this would require special equality handling for different type of props. Thus we could enhance the prop type system in which a layer can declare certain props as Vector2, Vector3, Vector4, and use deep equality for those.
We would also get optional type checking like react
```
const defaultProps = {
   getColor: {type: 'accessor', returns 'vector4', ... }
};
```


## Future Idea: Layer accessors can be constant values (generic attributes)

In cases where there is a direct correspondence between an accessor and a vertex attributes  would allow for a nice optimization where a vertex attribute could simply be set to a single value (using a so called “generic vertex attribute” from luma.gl)

Allowing an accessor to be set to a value instead of a function could be a nice way to enable generic vertex attributes. I.e.
```
const defaultProps = {
   getColor: {type: 'accessor', returns 'vector4', ... }
};
```
Will accept either a Vector4 value or a function that returns a Vector4 value:
```js
   new Layer({getColor: x => [255, 0, 0]}) // would create a full array/WebGLBuffer with colors, each set to [255, 0, 0], just like today
```
Or
```js
   new Layer({getColor: [255, 0, 0]}) // would set a generic vertex attribute (one value shared by all verts, not allocating any array/buffers at all)
```


## Alternatives / Existing Solutions


### Abstract Requirements

When evaluating alternatives, keep the following abstract requirements in mind:

Core Requirements
* **Value Validation** - Needs to be able to determine (efficiently) if a specific value belongs to the type.
* **No perf impact on production** - Validation OK during debug, but not in production.
* **Layer Inheritance** - Prop types should be combined across inheritance chain, like defaultProps are today.
* **Type Metadata** - Not just an ability to validate a value, but needs to provide more granular information (e.g. range of allowed values) about the type:
    * Type information should support layer browser type applications (provide enough information to populate a UI with meaningful controls). This may mean not only knowing that a value is integer, but its range, and whether it is an ordinal value or an index etc.
    * Type information should be able to support an automatic animation system (new value being set and automatically interpolation starts).

Optional Requirements
* **Deprecation Support**
* **Open Range Support**
* **Dynamic Limit Support**


### The React `prop-types` Module

React has "recently" broken out their `PropType` system into a separate component. They are making it optional for React applications, but it remains extremely popular.

PROS:
* **Familiarity** - Many React developers are using it daily, and deck.gl still focuses on React devs.
* **Code Size** - Many React applications will already have included the module. If we roll our own system, many apps will effectively bundle two separate (albeit fairly small) prop type systems.
* **Extensibility** it should be possible to define new types, as they are only functions.

CONS:
* **Limited specification** - The React `PropTypes` just provides boolean functions, that do not contain information on the range of numeric values etc. But perhaps it can be extended to do so.
* **"React-focused"** - Even though broken out from the React core, the `prop-types` module is still React focused.
    * For non-React bindings of deck.gl (which we are talking more and more about) it may make less sense to include this dependency. And it might evolve in ways that do not fit deck.gl.

Working assumption is that we won't build on React prop-types.


### Flow and TypeScript

Interaction with systems like flow and type script: For the foreseeable future, not all apps will use these and so relying on these would not work as a complete solution.

While deck.gl is not adopting typed javascript internally at this time, ideally we'd still like to provide external type definition file that could be consumed by flow-aware applications. These definition file should ideally have type information about the props expected by each layer. Perhaps they can be autogenerated from prop types?

