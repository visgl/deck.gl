# project64 (Shader Module)

The `project64` shader module is an extension of the `project` shader module that does projection using 64 bit floating point. This slows down the layer.


## getUniforms

For efficiency, the uniforms needed by `project64` are set by the `project` module (which is a dependency of `project64`). This is done since it is essentially the same calculations that are needed in both cases, so it would be wasteful to do it twice.


## GLSL Functions


### project_position_fp64

64 bit counterpart of the `project` modules `project_position`

`void project_position_fp64(vec4 position_fp64, out vec2 out_val[2])`


### project_to_clipspace_fp64

64 bit counterpart of the `project` modules `project_to_clipspace`

`vec4 project_to_clipspace_fp64(vec2 vertex_pos_modelspace[4])`


## Remarks

* `project64` depends on luma.gl's `fp64` module which is a big and complex shader module, which means that `project64` is a big dependency for your shader.
