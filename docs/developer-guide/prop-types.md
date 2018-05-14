# Property Types

> This article is a Work In Progress.


This article documents the system that deck.gl offers to provide extra type annotations for layer properties.

For a number of reasons it is useful to have access to descriptions of the types of the various properties in a layer.

* Enable specification of advanced (e.g. async) properties
* Transitions and Animation
* Type Checking (during development)
* "Reflection" (the layer browser use case)


## Default Property Values

`defaultProps`

This enables layers to opt-in to specifying types, and also offers a certain amount of type auto-deduction to happen based on existing default values for layers that do not opt in.


## Property Types

```js
const defaultProps = {
  maxRadius: {type: 'number', value: 1, min: 0, max: 1000},
  radiusScale: {value: 1, min: 0}, // {type: 'number'} inferred. No max value.
  highlightedObjectIndex: {value: -1, type: 'integer', min: -1},
  drawOutline: false, // {type: 'boolean' , value: false} inf
  getRadius: ..., // {type: 'function'} inferred
};
```

Tips:

* **Open Ranges** - It's unnecessary use `Math.MAX_` constants for open numeric ranges, just leave the max or min out to specify an open range.

