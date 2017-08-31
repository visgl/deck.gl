# Writing Shaders

A shader library facilitates creating shaders that work seamlessly with deck.gl.
Use the `modules` parameter to the `Model` class (or call the `assembleShaders` function directly) to dynamically
include this library into your own GLSL code:

```js
const model = new Model(gl, {
  vs: '// vertex shader GLSL source'
  fs: '// fragment shader GLSL source',
  modules: ['lighting'] // list of optional module names
});
```

The generated shader always contains a prologue of platform defines, and then
the [modules](/docs/advanced/writing-shaders.md#shader-modules),
and finally your shader code is added.


## Shader Modules

### Filtering and Brushing (Vertex and Fragment Shaders)

When rendering large data sets (especially a lot of intersecting lines or
arcs) it can be hard to see the structure in the data in the resulting
visualization. A useful technique in these cases is to use brushing

Sometimes, being able to filter out a specific color, or range of colors,
from the data without modifying the data container itself can be helpful
for performance or just code simplification reasons. This is also a feature
that can easily be added to a deck.gl shader.

**Tip:** Use `discard` in the fragment shader instead of 0 alpha.
Faster and leaves the depth buffer unaffected.

### Lighting (Vertex and Fragment Shaders)

A simple lighting package is provided in deck.gl, supporting a single
directional light in addition to ambient light. Turning on lighting requires
normals to be provided for each vertex.

### Animation (Vertex Shader)

A powerful capability of deck.gl is to render layers with thousands of
animated and/or interactive objects with the computing power of GPUs.

Creating an animated layer can be as easy as having the application supply
start and end positions for every object, and a time interval over which
to animate, and have the vertex shader interpolate the positions for every
frame using a simple `mix` GLSL instruction.

### Platform defines

This "virtual" module is a dynamically generated prologue containing #defines describing
your graphics card and platform. It is designed to work around certain platform-specific
issues to allow the same rendering results are different GPUs and platforms. It is
automatically injected by `assembleShaders` before any modules are included.

### fp64

A core feature of deck.gl is the fp64 shader math library that can be used leveraged by
developers to conduct numerical computations that requires high numerical accuracy.
This shader math library uses "multiple precision" algorithms to emulate 64-bit double
precision floating point numbers, with some limitations, using two 32-bit single
precision floating point numbers. To use it, just set the "fp64" key to "true" when
calling `assembleShaders`. Please refer to the "64-bit layers" section in the document
for more information.


## Uniforms

The following uniforms are injected by deck.gl and available to all shaders:

### Viewport uniforms

##### `mat4 projectionMatrix`

The view projection matrix based on the current viewport and layer.

##### `vec2 viewportSize`

Viewport width and height in physical pixels. Useful when rendering pixel sizes.

##### `float devicePixelRatio`

Device pixel ratio of the browser window.

### Layer prop uniforms

##### `float layerIndex`

The layerIndex is a small integer that starts at zero and is incremented
for each layer that is rendered. It can be used to add small offsets to
the z coordinate of layers to resolve z-fighting between overlapping
layers.

##### `float opacity`

In the fragment shader, multiply the fragment color with the opacity
uniform.

### Picking uniforms

##### `float renderPickingBuffer` (Deprecated)

Note: This uniform is deprecated and will be removed in future releases.
For picking functionality please refer to `picking` shader module.

If you choose to implement picking through picking colors, make sure
the `pickingColors` or `instancePickingColors` attribute is correctly set up,
and ensure that you return the picking color when `renderPickingBuffer`
uniform is set. Alternatively call the `layerColor` method on your
fragment color before assigning to `gl_FragColor`.

Note that the picking color must be rendered exactly as is with an alpha
channel of 1. Beware blending in opacity as it can result in the rendered
color not matching the picking color, causing the wrong index to be picked.

```glsl
gl_FragColor = mix(
  vec4(instanceColor.rgb, instanceColor.a * opacity),
  vec4(instancePickingColor, 1.),
  renderPickingBuffer
);
```

## Use With Other GLSL Code Assemblers

Your code can be run through another GLSL code assembler like
[glslify](https://github.com/stackgl/glslify)
before you pass it to `assembleShaders`. The `assembleShaders` function
does **not** do any kind of syntax analysis so is not able to prevent naming conflicts
when variable or function names from different modules. You can use multiple
techniques to organize your shader code to fit your project needs.
