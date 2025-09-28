# Layer Attributes

This section explains how the data in deck.gl layers are mapped to and accessed by the GPU during rendering.


## Overview

A central concept of deck.gl is that every `Layer` accepts a "table of data" (through the `data` prop) and maps into visual elements that are then rendered efficiently on the GPU.

For purposes of GPU computation, there are two separate types of layers and two types of attributes. We'll use the following terminology:

|                          | Geometric Attribute per row   | Descriptive Attribute per row |
| ---                      | ---                           | ---                           |
| Shared-Primitive Layer   | N/A (Use shared primitive)    | `1` value (instance) per row  |
| Variable-Primitive Layer | Variable # of vertices (`Ni`) | `Ni` duplicate values per row  |



### Fixed vs Variable Primitive Layers

* **Fixed Primitive Layer** - (Sometimes called _instanced layers_). These layers map each data row to a fixed primitive (set of vertices). Because of this simple mapping, these layers can naturally use instanced rendering, in the sense that the unique attributes for each row (instance) can be described by a single value in an instanced attribute array.

* **Variable Primitive Layer** - (Sometimes called _tesselated layers_). These layers require custom primitive for each row in the data table. The process of generating a custom primitive is referred to as tesselation, and requires extra work during generation. In this case it is not possible to use instancing to represent the unique attributes

Examples of _fixed primitive layers_ are `CircleLayer`, `PointCloudLayer`, `LineLayer` etc.

Examples of _variable primitive layers_ are `PathLayer`, `PolygonLayer` etc.

Remarks:

* The primitive in a _fixed primitive layer_ can be arbitrarily complex (from a single triangle, through more complex primitives like an extruded hexagon, to an entire mesh or scenegraph loaded from e.g. a glTF file). As the glTF example hints at, there can even be multiple primitives per table row (in multi-model layers). The defining characteristic is just that the primitive(s) are identical for each row.
* As mentioned, _Fixed primitive layers_ are sometimes called _instanced layers_, however the term is not precise as it is possible for a tesselated/variable primitive layer to use instanced rendering (e.g. the `PathLayer` currently does this as a performance micro-optimization to reduce the amount of custom geometry generated during tesselation). This use of instancing is not related to efficiently storing the unique values for each table row.


## Geometric vs Descriptive Attributes

### Geometric Attributes

Positions, Normals, Tangents, Co-Tangents etc.

For fixed primitive layers, these attributes are all pre-defined as part of the Layer's reference primitive.

For _variable primitive layers_, these attributes are normally all generated as a result of the tesselation process, and it is normal to have a unique value for each of these attributes in each vertex.


### Descriptive Attributes

Descriptive Attributes are used to share (non-geometrical) attributes (colors, ...) related to the data in each table row.

The big difference between the two layer types is how descriptive attributes are handled.

For _fixed primitive layers_ the standard setup is very simple: each descriptive attribute is an instanced attribute, with one value for each table row.

For _variable primitive layers_ there are two options:

2) Copy each descriptive attribute `N` times (`N` being the number of vertices generated for that row during tesselation). This is the method that is used in deck.gl today.

3) Add a single `rowIndex` attribute and copy the same index `N` times as above. In this approach, descriptive values could then be read from textures where they are stored a single time. This provides flexibility at the price of performance (texture access latency) and complexity (working with data in textures).


Remarks:
* In tesselated layers it is of course possible to use the fact that each vertex has a unique value for each descriptive attribute value to achieve certain effects. One could for instance make a custom `PathLayer` that defines a gradient of colors along the path. This technique tends to get harder to use for layers that tesselate triangles in 2D or 3D as the order of vertices is less predictable. Also, if indices are generated in this phase, in which case extra care must be taken since some vertices can be repeated in the geometry. Because of these complications, this is not a promoted customization technique for layers.
