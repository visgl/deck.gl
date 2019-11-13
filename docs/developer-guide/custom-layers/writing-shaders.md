# Writing Shaders

A shader library facilitates creating shaders that work seamlessly with deck.gl. The `modules` parameter passed to the [Model](https://github.com/uber/luma.gl/blob/master/docs/api-reference/core/model.md) class can dynamically include parts from this library into your own GLSL code:

```js
import {picking, project32, gouraudLighting} from '@deck.gl/core';

const model = new Model(gl, {
  vs: '// vertex shader GLSL source'
  fs: '// fragment shader GLSL source',
  modules: [picking, project32, gouraudLighting] // list of optional module names
});
```

## Shader Assembly

Your shaders will be run through the luma.gl [shader assembler](https://github.com/uber/luma.gl/blob/master/docs/api-reference/shadertools/assemble-shaders.md), which injects code from various module dependencies, The generated shader always contains a prologue of platform defines, and then the modules (see below), and finally your shader code is added.

### Platform defines

This "virtual" module is a dynamically generated prologue containing #defines describing your graphics card and platform. It is designed to work around certain platform-specific issues to allow the same rendering results are different GPUs and platforms. It is automatically injected by `assembleShaders` before any modules are included.


### Shader Modules

#### projection

The [project](/docs/shader-modules/project.md) shader module is part of the core of deck.gl. It makes it easy to write shaders that support all of deck.gl's projection modes and it supports some advanced rendering techniques such as pixel space rendering etc.

The `project` module also has two extensions, [project32](/docs/shader-modules/project32.md) and [project64](/docs/shader-modules/project64.md).


#### lighting

A simple lighting package is provided in deck.gl, supporting a single directional light in addition to ambient light. Turning on lighting requires normals to be provided for each vertex. There are two flavors:

- [gouraudLighting](https://github.com/uber/luma.gl/blob/master/modules/shadertools/src/modules/phong-lighting/phong-lighting.js) - for lighting calculated in the vertex shader
- [phongLighting](https://github.com/uber/luma.gl/blob/master/modules/shadertools/src/modules/phong-lighting/phong-lighting.js) - for lighting calculated in the fragment shader


#### fp64

The fp64 shader math library can be used leveraged by developers to conduct numerical computations that requires high numerical accuracy. This shader math library uses "multiple precision" algorithms to emulate 64-bit double precision floating point numbers, with some limitations, using two 32-bit single precision floating point numbers. To use it, just set the "fp64" key to "true" when calling `assembleShaders`. Please refer to the "64-bit layers" section in the document for more information.

Note that for geospatial projection, deck.gl v6.1 introduced a "hybrid" 32-bit projection mode that provides the precision of 64-bit projection with the performance of 32-bit calculations, so it is recommended that any use of `fp64` be used for non-position-projection related use cases.

#### picking

Picking is supported using luma.gl [picking shader module](https://github.com/uber/luma.gl/blob/master/docs/api-reference/shadertools/shader-module-picking.md).


### Standard Shader Hooks

When [subclassing](/docs/developer-guide/custom-layers/subclassed-layers.md) an official deck.gl layer with minor feature additions, it is possible to inject custom code into predefined locations into the original shaders. These hooks are considered the public API of layers that will work consistently cross minor releases.

```js
const shaders = this.getShaders();

const model = new Model(gl, {
  ...this.getShaders(),
  inject: {
    'fs:decl': `
      uniform float coverage;
    `
    'fs:DECKGL_FILTER_COLOR': `
      if (abs(geometry.uv.x) > coverage) discard;
    `
  }
});
```

##### vs:#decl

Inject into the top of the vertex shader (declarations).

##### vs:#main-start

Inject into the the very beginning of the main function in the vertex shader.

##### vs:#main-end

Inject into the the very end of the main function in the vertex shader.

##### vs:DeckGL_FILTER_SIZE

Inject into a function in the vertex shader to manipulate the size of a geometry. Called before projection.

Arguments:

- `inout vec3 size` - offset of the current vertex from `geometry.worldPosition` in common space.
- `VertexGeometry geometry` - descriptor of the current geometry


##### vs:DeckGL_FILTER_GL_POSITION

Inject into a function in the vertex shader to manipulate the projected position of the current vertex. Called after projection.

Arguments:

- `inout vec4 position` - position of the current vertex in clipspace
- `VertexGeometry geometry` - descriptor of the current geometry


##### vs:DeckGL_FILTER_COLOR

Inject into a function in the vertex shader to manipulate the color of the current geometry. Called after projection.

Arguments:

- `inout vec4 color` - color of the current geometry, RGBA in the `[0, 1]` range
- `VertexGeometry geometry` - descriptor of the current geometry


##### fs:#decl

Inject into the top of the fragment shader (declarations).

##### fs:#main-start

Inject into the the very beginning of the main function in the fragment shader.

##### fs:#main-end

Inject into the the very end of the main function in the fragment shader.

##### fs:DeckGL_FILTER_COLOR

Inject into a function in the vertex shader to manipulate the color of the current geometry. Called after projection.

Arguments:

- `inout vec4 color` - color of the current geometry, RGBA in the `[0, 1]` range
- `FragmentGeometry geometry` - descriptor of the current geometry


### VertexGeometry struct

- `vec3 worldPosition` - The world position of the current geometry, usually populated from a `getPosition` accessor.
- `vec3 worldPositionAlt` - The secondary world position of the current geometry. This property is populated if the geometry is instanced between a source position and a target position, for example `ArcLayer`.
- `vec3 normal` - The normal at the current vertex in common space. Only populated for 3D layers.
- `vec2 uv` - The uv position at the current vertex.
- `vec4 position` - The position of the current vertex in common space. Populated during projection.
- `vec3 pickingColor` - The picking color of the current vertex.

### FragmentGeometry struct

- `vec2 uv` - The uv position at the current vertex.


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

* **Use With Other GLSL Code Assemblers** - Your shader code can be run through another GLSL code assembler like [glslify](https://github.com/stackgl/glslify) before you pass it to `assembleShaders`. This means that you are not forced to work with only luma.gl shader modules, you can use multiple techniques to organize your shader code to fit your project needs.
