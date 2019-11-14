# project64 (Shader Module)

The `project64` shader module is an extension of the [project](/docs/shader-modules/project.md) shader module that does projection using 64 bit floating point. It provides an increase in precision, at the cost of performance. Note that starting with deck.gl v6.1, the improved default 32 bit projection mode provides sufficient precision for most use cases.


## getUniforms

The uniforms needed by `project64` are extracted from the `project` module uniforms `project_uViewProjectionMatrix` and `project_uScale`.


## GLSL Uniforms

Uniforms are considered private to each shader module. They may change in between patch releases. Always use documented functions instead of accessing module uniforms directly.

The uniforms of the `project64` shader module are prefixed with `project64_` in their names.

## GLSL Functions


### project_position_to_clipspace

64 bit implementation of the `project_position_to_clipspace` interface.

```glsl
vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset)
vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition)
```

Parameters:

* `position` - vertex position in the layer's coordinate system.
* `position64Low` - low part of the vertex position, calculated as `aLow = a - Math.fround(a)`.
* `offset` - offset from the coordinate, in common space
* `commonPosition` - projected position in the common space

Returns:
Projected position in the clipspace.


### project_position_fp64

64 bit counterpart of the `project` modules `project_position`

```glsl
void project_position_fp64(vec4 position_fp64, out vec2 out_val[2])
void project_position_fp64(vec2 position, vec2 position64Low, out vec2 out_val[2])
```


### project_common_position_to_clipspace_fp64

64 bit counterpart of the `project` modules `project_common_position_to_clipspace`

```glsl
vec4 project_to_clipspace_fp64(vec2 vertex_pos_modelspace[4])
```


## Remarks

* `project64` depends on luma.gl's `fp64` module which is a big and complex shader module, which means that `project64` is a big dependency for your shader.
