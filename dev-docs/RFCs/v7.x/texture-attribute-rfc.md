# RFC: Texture-based Descriptive Attributes

* Authors: Ib Green, ...
* Date: March, 2019
* Status: **Draft**

This RFC is a component of deck.gl's "binary support roadmap".

## Summary

This RFC proposes to use WebGL textures to supply values for "descriptive attributes" for "variable-primitive layers". This would allow:
* external tables to be used directly as input without further processing.
* avoids the need for layers to generate long attribute arrays for each descriptive attribute that just contain repeated copies of the attribute value


## Background

For purposes of GPU computation, there are effectively two types of layers and two types of attributes. We'll use the following terminology:

|                          | Geometric Attribute per row   | Descriptive Attribute per row |
| ---                      | ---                           | ---                           |
| Shared-Primitive Layer   | N/A (Use shared primitive)    | `1` value (instance) per row  |
| Variable-Primitive Layer | Variable # of vertices (`Ni`) | `Ni` duplicate values per row  |

Before this proposal, deck.gl variable-primitive layers generate long attribute arrays for each descriptive attribute that just contain repeated copies of the attribute value.

While this happens on the CPU and is inefficient, more importantly it prevents external binary table data from being used directly as input.


## Proposals

### Descriptive Attributes in Vartiable 

One of the aspects of tesselating layers is that for descriptive attributes (non-positions) they tend to have to duplicate the same input value for all tesselated vertices for that visual element, such as `colors` etc.

This duplication has two limitations:
* It is inefficient (potentially throwing away a perfectly good binary input buffer, replacing it with a much bigger buffer with lots of copies of the same value).
* It is also limiting in the sense that having different values could be used to e.g. color or even animate the object in a good way.

To address the first issue, and allow binary input buffers with one datum per visual element to be used as descriptive attributes without transformation would could be to store them as data textures and index them with the current `instance id`. `gl_InstanceId` is available in GLSL 3.00 in but would have to be polyfilled in GLSL 1.30 (with another attribute, or perhaps `instanceColors` could be reused, reinterpreted as `Uint32`).

To address the second issue, it could be interesting to pass arguments to (or provide global functions available to) the GLSL accessor.

```
new PathLayer({
});
```




## Performance

Texture creation


Texture reads in GPUs are slow in the sense that they have very long latency.

### Immutable Textures?

