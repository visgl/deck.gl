# project64 (Shader Module)

The `project64` shader module is an extension of the [project](https://deck.gl/next/docs/api-reference/core/project.md) shader module that does projection using 64 bit floating point. It provides an increase in precision, at the cost of performance. Note that starting with deck.gl v6.1, the improved default 32 bit projection mode provides sufficient precision for most use cases.

## getUniforms[​](#getuniforms "Direct link to getUniforms")

The uniforms needed by `project64` are extracted from the `project` module uniforms `project.viewProjectionMatrix` and `project.scale`.

## GLSL Uniforms[​](#glsl-uniforms "Direct link to GLSL Uniforms")

Uniforms are considered private to each shader module. They may change in between patch releases. Always use documented functions instead of accessing module uniforms directly.

The uniforms of the `project64` shader module are prefixed with `project64_` in their names.

## GLSL Functions[​](#glsl-functions "Direct link to GLSL Functions")

### project\_position\_to\_clipspace[​](#project_position_to_clipspace "Direct link to project_position_to_clipspace")

64 bit implementation of the `project_position_to_clipspace` interface.

```
vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset)

vec4 project_position_to_clipspace(vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition)
```

Parameters:

* `position` - vertex position in the layer's coordinate system.
* `position64Low` - low part of the vertex position, calculated as `aLow = a - Math.fround(a)`.
* `offset` - offset from the coordinate, in common space
* `commonPosition` - projected position in the common space

Returns: Projected position in the clipspace.

### project\_position\_fp64[​](#project_position_fp64 "Direct link to project_position_fp64")

64 bit counterpart of the `project` modules `project_position`

```
void project_position_fp64(vec4 position_fp64, out vec2 out_val[2])

void project_position_fp64(vec2 position, vec2 position64Low, out vec2 out_val[2])
```

### project\_common\_position\_to\_clipspace\_fp64[​](#project_common_position_to_clipspace_fp64 "Direct link to project_common_position_to_clipspace_fp64")

64 bit counterpart of the `project` modules `project_common_position_to_clipspace`

```
vec4 project_to_clipspace_fp64(vec2 vertex_pos_modelspace[4])
```

## Remarks[​](#remarks "Direct link to Remarks")

* `project64` depends on luma.gl's `fp64` module which is a big and complex shader module, which means that `project64` is a big dependency for your shader.
