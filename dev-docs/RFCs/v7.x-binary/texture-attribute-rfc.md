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
I.e. theu duplicate the same input value for all tesselated vertices for that visual element, such as `colors` etc, leading to ranges of same value in the generated attribute.

* The extended attribute generation happens on the CPU and is inefficient
* It throws away a perfectly good binary input buffer, replacing it with a much bigger buffer with lots of copies of the same value.
* It hits performance when animate the object.

Finally it prevents external binary table data from being used directly as input which is highly desirable to support the "data frame" use case where very large data is sliced and diced directly without ever being copied or moved once loaded.


## Proposals: Read Descriptive Attributes by Index From Data Texture

To allow binary input buffers with one datum per visual element to be used as descriptive attributes without transformation the proposal is to wrap them as immutable data textures and then in the vertex shader index them with the current `instance id`. 

`gl_InstanceId` is available in GLSL 3.00 in but would have to be polyfilled in GLSL 1.30. We could supply another attribute with indices, or perhaps `pickingColors` could be reused, reinterpreted as `Uint32`. We do have the freedom to redefine the picking color encoding scheme).


## Texture API Implications

### Limitations

There are limitations to textures. WebGL2 addresses many of them but not all:
* Floating point textures are supported, but there are still a confusing number of limitations and caveats.
* Reading from textures in vertex shaders is supported.
* ...

A key questions is if single component `GL.R` floating point textures can be created (some issues with arose during `Transform` development). If this is not supported, there may still need to be a data transformation step when preparing the data to be uploaded in the texture. That transformation will be a constant factor duplication rather than a variable factor duplication, but **such a limitation might still effectively invalidate this RFC**, so due diligence is required.


### Performance

We need to factor in texture creation instead of/in addition to buffer creation. This will however not be done frequently as columnar tables (or rather their constituent columns, or chunks) are effectively treated as immutable.

Regarding perf concerns during use (binding uniforms/draws etc) Immutable Textures are supposed to have performance advantages (e.g. less error checking during use) and should probably be our weapon of choice.

Texture reads in GPUs are very slow in the sense that texture memory has very long latency, GPUs overcome this by making huge amounts of parallel reads. We need some measurements to understand how well this will work in our case and much performance we lose compared to direct buffer access.


## Use Transform class?

The luma.gl `Transform` class was recently upgraded to support Buffers and Textures interchangeably. Though not directly transform feedback related, it would be nice if this feature could leverage some of that work and help refine/extend that capability.
