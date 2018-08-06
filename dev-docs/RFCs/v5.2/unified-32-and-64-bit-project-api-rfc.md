# RFC: Layer Shader Customization

* **Authors**: Ib Green, Xiaoji Chen
* **Date**: Feb 2018
* **Status**: **Implemented**

## Abstract

Writing shaders for custom layers is no trivial task, even for people who are familiar with GLSL. While the 32-bit projection APIs are relatively intuitive, translating an existing vertex shader to support fp64 takes a lot of work. 64-bit shaders contain significantly more code. The representaion of fp64 positions are not intuitive and error prone.

This RFC defines a new common API for 32 and 64 bit projection. It proposes implementing this interface in the current `project64` shader module, as well as in a new `project32` shader module. As a result, the same vertex shader can be used for both 32-bit and 64-bit projection depending on which module it includes as dependency.


## Proposal: Common 32 and 64 bit projection interface

This proposal adds a new projection utility interface
```
vec4 project_position_to_clipspace(vec3 positions, vec2 positions64xyLow, vec3 offset, out vec4 worldPosition);
```
Where world position is the projected & offset position in world space, and the return value is the projected position in clipspace.

The interface will be implemented differently in 32-bit and 64-bit shader modules. Vertex shaders can call this function without knowing whether it is in fp64 mode.

#### Example Shader Code

Current fp32 vertex shader:
```
attribute vec3 positions;
attribute vec3 instancePositions;
attribute vec3 instanceNormals;

varying float vLightWeight;

main() {
  vec3 projected_coord = project_position(instancePositions);
  vec4 position_worldspace = vec4(projected_coord + positions, 1.0);

  gl_Position = project_to_clipspace(position_worldspace);

  vLightWeight = getLightWeight(position_worldspace.xyz, project_normal(instanceNormals));
}
```

Current fp64 vertex shader:
```
attribute vec3 positions;
attribute vec3 instancePositions;
attribute vec3 instancePositions64xyLow;
attribute vec3 instanceNormals;

varying float vLightWeight;

main() {
  vec4 instancePositions64xy = vec4(
    instancePositions.x, instancePositions64xyLow.x,
    instancePositions.y, instancePositions64xyLow.y);
  vec2 projected_coord_xy[2];
  project_position_fp64(instancePositions64xy, projected_coord_xy);
  vec2 vertex_pos_localspace[4];
  vec4_fp64(vec4(positions, 0.0), vertex_pos_localspace);
  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = sum_fp64(vertex_pos_localspace[0], projected_coord_xy[0]);
  vertex_pos_modelspace[1] = sum_fp64(vertex_pos_localspace[1], projected_coord_xy[1]);
  vertex_pos_modelspace[2] = sum_fp64(vertex_pos_localspace[2],
    vec2(project_scale(instancePositions.z), 0.0));
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 position_worldspace = vec4(  
    vertex_pos_modelspace[0].x,
    vertex_pos_modelspace[1].x,  
    vertex_pos_modelspace[2].x,
    1.0
  );
  vLightWeight = getLightWeight(position_worldspace.xyz, project_normal(instanceNormals));
}
```

New vertex shader for both fp32 and fp64:
```
attribute vec3 positions;
attribute vec3 instancePositions;
attribute vec3 instancePositions64xyLow;
attribute vec3 instanceNormals;

varying float vLightWeight;

main() {
  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xyLow, positions, position_worldspace);

  vLightWeight = getLightWeight(position_worldspace.xyz, project_normal(instanceNormals));
}
```

#### Proposed Changes
- Add a new shader module `project32`.
- Add new project utility functions to both `project32` and `project64` modules:
  +  `vec4 project_position_to_clipspace(vec3 positions, vec2 positions64xyLow, vec3 offset, out vec4 worldPosition);`
  +  `vec4 project_position_to_clipspace(vec3 positions, vec2 positions64xyLow, vec3 offset);`
- Unify fp32 and fp64 shaders in core layers that do not depend on 64-bit world position in vertex shaders (all but `ArcLayer` and `PathLayer`).
- Layers that utilize this new interface will need to add `project32` to `modules` when creating 32-bit models. The xy low-part attribute will be included at all times, and set as all zeros using generic attribute in 32-bit mode.

#### Impact
- Greatly simplify the usage of fp64 projection. Easier to write vertex shaders for 64-bit layers.
- Remove the necessity to have separate fp32 and fp64 vertex shaders for most core layers.
- Less duplicate code; easier maintenance; smaller bundle size.
- Backward compatible
