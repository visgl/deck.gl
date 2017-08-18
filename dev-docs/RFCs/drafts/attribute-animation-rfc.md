# RFC: Attribute Animation

* **Authors**: Xiaoji Chen
* **Date**: Aug 2017
* **Status**: Early draft, not ready for formal review.

Notes:
*  This could build on a "GeometryBuilder RFC", @ibgreen has been doing some work in this area.

## Motivation

For a general motivation of animation, see the [Property Animation RFC]().

The goal of this supplmentary RFC is to investigate to what extend deck.gl could provide automatic interpolation of vertex attribute arrays, in addition to primitive values like properties, uniforms and gl parameters.

## Proposal: Attribute Array Interpolation

TBA



## Proposal: Layer accessors can be constant values

> NOTE: Copied from feature scratch-pad, but related to attribute animation, would allow simple interpolation.

In cases where there is a direct correspondence between an accessor and a vertex attributes  would allow for a nice optimization where a vertex attribute could simply be set to a single value (using a so called “generic vertex attribute” from luma.gl)

Allowing an accessor to be set to a value instead of a function could be a nice way to enable generic vertex attributes. I.e.
```js
   new Layer({getColor: x => [255, 0, 0]}) // would create a full array/WebGLBuffer with colors, each set to [255, 0, 0], just like today
```
while
```js
   new Layer({getColor: [255, 0, 0]}) // would set a generic vertex attribute (one value shared by all verts, not allocating any array/buffers at all)
```

Likewise:
```js
  new Layer({color: [255, 0, 0]}) - would set the uniform once, as today
```
while
```js
  new Layer({color: ({tick}) => [tick % 255, 0, 0]}) - would activate animation of this layer and update this prop every frame with an incremented tick value.
```


## Questions

* Probably interesting updateTrigger implications...
