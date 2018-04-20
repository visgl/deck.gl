# project64 (Shader Module)

The `project64` shader module is an extension of the `project` shader module that does projection using 64 bit floating point. This slows down the layer.


## getUniforms

The uniforms needed by `project64` are extracted from the `project` module uniforms `project_uViewProjectionMatrix` and `project_uScale`.


## GLSL Uniforms

Uniform names are not considered part of the official API of shader modules and can potentially change between minor releases, but are documented for applications that need this level of access. Use the module's public GLSL functions instead of directly accessing uniforms when possible.

| Uniform | Type | Description |
| --- | --- | --- |
| project_uViewProjectionMatrixFP64 | uniform vec2[16] | 64-bit view projection matrix |
| project64_uScale | uniform vec2 | 64-bit Web Mercator scale |

## GLSL Functions


### project_position_to_clipspace

64 bit implementation of the `project_position_to_clipspace` interface.

`vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset)`

`vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset, out vec4 worldPosition)`

Parameters:

* `position` - vertex position in the layer's coordinate system.
* `position64xyLow` - low part of the vertex position's xy
* `offset` - meter offset from the coordinate
* `worldPosition` - projected position in the world space

Returns:
Projected position in the clipspace.


### project_position_fp64

64 bit counterpart of the `project` modules `project_position`

`void project_position_fp64(vec4 position_fp64, out vec2 out_val[2])`

`void project_position_fp64(vec2 position, vec2 position64xyLow, out vec2 out_val[2])`


### project_to_clipspace_fp64

64 bit counterpart of the `project` modules `project_to_clipspace`

`vec4 project_to_clipspace_fp64(vec2 vertex_pos_modelspace[4])`


## Remarks

* `project64` depends on luma.gl's `fp64` module which is a big and complex shader module, which means that `project64` is a big dependency for your shader.
