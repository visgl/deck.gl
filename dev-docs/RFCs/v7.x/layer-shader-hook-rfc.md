# RFC: Using Binary Data

* Authors: Xiaoji Chen
* Date: June 7, 2019
* Status: **Draft**


## Overview

With the new [shader hooks](https://github.com/uber/luma.gl/blob/7.1-release/docs/api-reference/shadertools/assemble-shaders.md#createshaderhookhook-opts) system in luma.gl v7.1, it is now possible to create public APIs for shaders. This RFC proposes adding a set of standard shader hooks to the official deck.gl layers.

## Background

One of the biggest pain points in subclassing a layer is injecting custom code into its shaders. Currently, this is done in one of two ways:

- Our [developer guide](https://github.com/uber/deck.gl/blob/7.1-release/docs/developer-guide/custom-layers/subclassed-layers.md) instructs users to copy and modify the entire shader. This is very fragile because every future change we make to this layer's shaders, which is considered private API, will break the custom layer.
- Our [brushing example](https://github.com/uber/deck.gl/tree/7.1-release/examples/website/brushing/brushing-layers) and [TripsLayer](https://github.com/uber/deck.gl/blob/7.1-release/modules/geo-layers/src/trips-layer/trips-layer.js) use shader injection.
 
While the second approach is a little more robust by dynamically adding custom code to the base shader, the following issues remain:

- The subclass is difficult to read, as it does not contain the full shader code.
- The injection usually depends on certain assumptions about the base layer implementation, e.g. attribute names and varyings, which is prone to breakage in a future release.
- Because each layer's attributes are different, the injection code cannot be ported to other layers easily.
- The standard injection points (`decl`, `main-start`, `main-end`) is very limiting. If the subclass wishes to manipulate intermediate values in the shader, e.g. `offset` in `ScatterplotLayer`'s vertex shader before projection is performed, custom code must be injected using key strings in the base shader, which is even more fragile.

## Target Use Cases

Publicly documented shader hooks make it possible to:

- Standardize layer shaders and make them easier to tweak for people who are less familiar with WebGL.
- Write one set of injection that works for many layers.
- Write custom layers that remain working for future releases of the same major version.
- As a result of the above, package and distribute layers and layer extensions as reusable components.

### Example 1: Generic GPU Data Filter

The basic implementation of the [GPU data filter](/dev-docs/RFCs/v6.0/data-filter-rfc.md) discards any fragment from objects that are filtered out. However, some users (including kepler.gl) wish to have more control of the output appearance, e.g. circles grow/shrink as they enter/exit a time window; render the objects that are filtered out with a different color; etc. This requires layers to expose shader hooks for object dimensions and colors.

### Example 2: Generic Brushing

Brushing is based on mouse position and the position of the current object. To implement it in a way that is reusable across multiple layers, it requires the layers to expose shader hooks for object positions.

### Example 3: Pattern Fill

Instead of filling an area (triangle) with a solid color, fill it with a tiling pattern. The pattern would be supplied with a sprite image, with additional attributes controlling the size and the orientation. This is needed in rendering realistic maps e.g. a polygon or path that represents "crosswalk." This requires layers to expose shader hooks for object colors and texture coordinates.

## Proposal

### Naming Conventions

Shader hook names follow the pattern `DECKGL_<action>_<target>`.

- All hooks start with the `DECKGL_` prefix
- Actions:
  + `FILTER`: if the hook can modify the input value(s).
  + `USE`: if the hook does not expect any output.
- Targets:
  + Colors are normalized to the WebGL color space.
  + Coordinates are presumed to be in common space.
  + Non-commonspace coordinates must contain modifiers in their names, e.g. `worldPosition`, `pixelSize`.

### Standard Layer Hooks

#### vs:DECKGL_FILTER_SIZE(inout vec3 size)

Modify the commonspace dimensions associated with the current vertex, before it's projected.

Sementic meanings:

- ScatterplotLayer/IconLayer/PointCloudLayer/ColumnLayer: the offset from center
- PathLayer/ArcLayer/LineLayer: the extrusion from the current vertex
- SimpleMeshLayer: the local position
- SolidPolygonLayer/BitmapLayer: (not applicable)


#### vs:DECKGL_USE_POSITION(vec3 worldPosition)

Observe the world space position associated with a point-link object.

Sementic meanings:

- SolidPolygonLayer (top): the vertex position (from `getPolygon`)
- BitmapLayer: the vertex position (from `bounds`)
- PathLayer/ArcLayer/LineLayer: (not applicable)
- All other layers: the object center (from `getPosition`)


#### vs:DECKGL_USE_POSITIONS(vec3 sourceWorldPosition, vec3 targetWorldPosition)

Observe the world space source and target positions associated with an edge-like object.

Sementic meanings:

- ArcLayer/LineLayer: the source/target positions (from `getSourcePosition` and `getTargetPosition`)
- PathLayer: the start/end of the current leg (from `getPath`)
- SolidPolygonLayer (side): the two vertices that form the current edge (from `getPolygon`)
- All other layers: (not applicable)


#### vs:DECKGL_FILTER_COLOR(inout vec4 color, vec3 position, vec3 normal)

Modify the color of the current vertex. `position` and `normal` are in common space.


#### fs:DECKGL_FILTER_COLOR(inout vec4 color, vec2 texCoord)

Modify the color of the current fragment.
