# Writing Shaders

A shader library facilitates creating shaders that work seamlessly with deck.gl. Use the `modules` parameter to the `Model` class to dynamically include this library into your own GLSL code:

```js
const model = new Model(gl, {
  vs: '// vertex shader GLSL source'
  fs: '// fragment shader GLSL source',
  modules: ['lighting'] // list of optional module names
});
```


## Shader Assembly

Your shaders will be run through the luma.gl shader assembler, which injects code from various module dependencies, The generated shader always contains a prologue of platform defines, and then the modules (see below), and finally your shader code is added.

### Platform defines

This "virtual" module is a dynamically generated prologue containing #defines describing your graphics card and platform. It is designed to work around certain platform-specific issues to allow the same rendering results are different GPUs and platforms. It is automatically injected by `assembleShaders` before any modules are included.


## Shader Modules

### Lighting (Vertex and Fragment Shaders)

A simple lighting package is provided in deck.gl, supporting a single directional light in addition to ambient light. Turning on lighting requires normals to be provided for each vertex.


### fp64

A core feature of deck.gl is the fp64 shader math library that can be used leveraged by developers to conduct numerical computations that requires high numerical accuracy. This shader math library uses "multiple precision" algorithms to emulate 64-bit double precision floating point numbers, with some limitations, using two 32-bit single precision floating point numbers. To use it, just set the "fp64" key to "true" when calling `assembleShaders`. Please refer to the "64-bit layers" section in the document
for more information.


### picking

Picking is supported using luma.gl [picking shader module](https://github.com/uber/luma.gl/tree/5.2-release/src/shadertools/modules/picking).


## Shader Techniques and Ideas

### Filtering and Brushing (Vertex and Fragment Shaders)

When rendering large data sets (especially a lot of intersecting lines or arcs) it can be hard to see the structure in the data in the resulting visualization. A useful technique in these cases is to use "brushing".

Sometimes, being able to filter out a specific color, or range of colors, from the data without modifying the data container itself can be helpful for performance or just code simplification reasons. This is also a feature that can easily be added to a deck.gl shader.

**Tip:** Use `discard` in the fragment shader instead of 0 alpha. Faster and leaves the depth buffer unaffected.


### Animation (Vertex Shader)

A powerful capability of deck.gl is to render layers with thousands of animated and/or interactive objects with the computing power of GPUs.

Creating an animated layer can be as easy as having the application supply start and end positions for every object, and a time interval over which to animate, and have the vertex shader interpolate the positions for every frame using a simple `mix` GLSL instruction.


## Uniforms

### Layer prop uniforms

##### `float layerIndex`

The layerIndex is a small integer that starts at zero and is incremented for each layer that is rendered. It can be used to add small offsets to the z coordinate of layers to resolve z-fighting between overlapping layers.

##### `float opacity`

In the fragment shader, multiply the fragment color with the opacity uniform.

### Shader Module Uniforms

The luma.gl/deck.gl shader modules provide javascript functions to set their uniforms but the actual GLSL uniforms are typically considered implementation dependent. The intention is that you should use the public functions exposed by each shader module. That said, some uniforms from the [`project`](/docs/shader-modules/project.md) module are considered special and are documented.

## Remarks

* **Use With Other GLSL Code Assemblers** - Your shader code can be run through another GLSL code assembler like [glslify](https://github.com/stackgl/glslify) before you pass it to `assembleShaders`. This means that you are not forced to work with onlyy luma.gl shader modules, you can use multiple techniques to organize your shader code to fit your project needs.
