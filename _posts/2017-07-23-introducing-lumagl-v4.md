---
title: Introducing luma.gl v4.0
description: In many ways v4.0 is the biggest luma.gl release to date. It is a major upgrade that brings full WebGL2 support to luma.gl, as well as adding advanced features such as GL state management and a shader module system.
author: ib
tags:
  - Visualization
  - WebGL
  - Luma.gl
---

# Introducing luma.gl v4.0

## Version 4.0

In many ways v4.0 is the biggest luma.gl release to date. It is a major upgrade that brings full WebGL2 support to luma.gl, as well as adding advanced features such as GL state management and a shader module system.

## Major Updates

* New Documentation
* Full WebGL2 Support with WebGL Capability Management
* WebGL State Management
* GLSL Module System
* Seer Debug Integration


### New Documentation

Before even going into the wealth of new features in luma.gl v4, the documentation has been completely rewritten
* New documentation site, aligned with other frameworks in the same visualization suite, such as deck.gl, react-map-gl and react-vis.
* Extensive overhaul of documentation structure and contents
If you are an existing user of luma.gl this might be the biggest immediate benefit for you.

### Complete WebGL2 support

A short overview of WebGL2 and some of the additions to the luma.gl API that have been made to support it.

## New Classes

* `Texture2DArray`, - e.g. for texture atlases
* `Texture3D` - for volumetric rendering or 3D lookup tables
* `Query` - Asynchronously query for occlusions, transform feedback, timings
* `Sampler` - Let's shaders sample same texture in different ways
* `FenceSync` - Get notified when GPU reaches certain point in command stream
* `TransformFeedback` - Get output from vertex shaders
* `VertexArrayObject` - Stores multiple attribute bindings

Note that `VertexArrayObject` and `Query` can be used in WebGL1 with certain restrictions.


WebGL2 introduces objects that collect state allowing applications to switch state with a single call:

* `VertexArrayObject`s - holds a set of vertex array buffer bindings
* `Sampler` - holds a set of texture sampling parameters
* `TransformFeedback` - holds a set of transform feedback output buffer bindings.
* `UniformBufferLayout` - a helper class to simplify manipulation of uniform values in "std140" memory layout.


### WebGL2 Support

* luma.gl classes for the new WebGL2 objects (`FenceSync`, `Query`, `Sampler`, `Texture2DArray`, `Texture3D`, `TransformFeedback`).
* New `UniformBufferLayout` helper class to make uniform buffer usage easy.
* `Textures`, `Renderbuffers` and `Framebuffers` updated to handle all the new WebGL2 image formats, including floating point textures, and multiple render targets.
* Every existing WebGL class has been overhauled and has received additional methods that expose WebGL2 functionality whenever available.


### New Features

`WebGL state management and shader module`: after the launch of luma.gl v3, the feedback we received from some long-time WebGL programmers suggested that luma.gl had the right API surface with two big exceptions: it lacked a system for managing global WebGL state, and a solution for managing shader modules. Both of these deficiencies have been addressed in luma.gl v4.


### WebGL Capability Management

* Dramatically simplifies building apps that run on both WebGL1 and WebGL2, seamlessly leveraging extensions when available.
* Helps apps to query if a WebGL feature is available on the current platform - regardless of whether it is available through WebGL2 or a WebGL1 extension.
* When a feature can be provided either through WebGL2 or a WebGL1 extension, luma.gl provides a single API that transparently uses the available implementation.


### WebGL State Management

* Enables apps to work with WebGL context state without having to worry about global side effects, addressing one of the major weak spots of the WebGL API.
* Lets apps temporarily change global context state without having to do expensive queries to remember what values to restore it to.
* Tracks changes to the context happening outside of luma.gl to ensure that global state always remains synchronized.
* Prevents unnecessary calls to set state to current value.


### GLSL Module System

* The `ShaderAssembler` system allows shader code to be split into composable pieces.
* It is completely optional, the application can use raw shader strings, `glslify`, the `ShaderAssembler` system or any other tools in isolation or combination to generate its shaders.
* Optionally integrates with a `ShaderCache` to ensure textually equivalent shaders are only compiled once.


### Seer Integration (Debug and Profiling)

Debugging GLSL shaders can be one of the more frustrating part of WebGL programming, and from the start, luma.gl has included strong debugging support (including optionally logging values attributes and uniforms before draw calls, throwing exceptions showing the exact location of parsing errors in GLSL source code etc). In v4 we have taken this to the next level by integrating with the Seer chrome plugin. It is now possible to list and inspect all your `Model` instances directly in the Chrome dev tools, check attributes and uniforms, and even see performance timings from the last draw calls directly in the debugger.



## WebGL2 API highlights

* WebGL2 constants added to `GL` export

* Textures
    * Can now create from `WebGLBuffers` in addition to typed arrays
    * Tons of new texture formats
    * Compressed textures from

    * GLSL `dFdx`, `dFdy` Texture derivatives - (e.g. to compute normals in fragment shader)
    * GLSL `texelFetch` - (e.g. for manual bilinear filtering)
    * GLSL `textureGrad` - (e.g. for tweaking mipmap levels)
    * Immutable texture?
    * Integer texture - uint sampler
    * Texture LOD
    * GLSL `textureOffset`
    * pixelStore
    * sRGB
    * texture vertex (e.g. for displacement mapping)

* Vertex Formats (GL.HALF_FLOAT)

* GLSL
    * centroid
    * discard
    * flat_smooth_interpolators
    * non_square_matrix

* TBD
    * Uniform buffers

* Misc
    * New blending modes: `GL.MIN` and `GL.MAX`

* Efficiency


## GPGPU Programming Highlights

Enabling GPGPU (General Purpose GPU) programming, i.e. the use of the GPU for computations in addition to rendering is a major goal for luma.gl.

While much more is planned for future releases, this is a quick overview of some of the features in v4 that facilitate GPGPU use cases:

### Buffers

Memory Management* - A big part of efficient GPGPU computing is setting up memory so that the GPU can access it, and manipulating and reading back that memory in an efficient way. It is therefore important to be aware of what tools WebGL and luma.gl provide to manipulate memory.

Buffers represent memory on the GPU. One can think of it as "uploading"
a memory to the GPU. The cost of the upload depends on the GPU architecture
but it should not be considered free.

The buffers are just memory block, the interpretation depends on how they
are used.

| Method             | Version | Description |
| ---                | ---     | ---         |
| Buffer.subData     | WebGL1* | Enables updating only part of a buffer on the GPU. Note that WebGL2 provides additional control parameters |
| Buffer.copySubData | WebGL2  | Enables direct copy between buffers on GPU without moving memory to the CPU |
| Buffer.getSubData  | WebGL2  | Enables readback of memory from |


### Textures

Textures also contain memory and is organized depending on the texture width, height, format etc.

Textures can be used as a source of data to the GPU so they can be quite useful in GPGPU computing, either when the WebGL API does not directly support buffers (often the case in WebGL1) or to achieve special results (e.g. implementing accumulation through blending).

* **Floating Point Textures** - Usually, the most useful textures for GPGPU computing are floating point textures (i.e. each color value can be a 16 bit or 32 bit float, rather than just a small integer). In WebGL1, the support for floating point textures depends on the availability of extensions, and there are many limitations and variations between platforms. In WebGL2, the situation is much better, floating point textures are available by default, although some uses are still dependent on extensions (the luma.gl capability management system makes this easy to check).


### Transform Feedback

While WebGL2 does not support pure compute shaders, it does allow the application to capture the output of the vertex shader stage (in WebGL1 the processed vertices are sent directly to the fragment shader and are not accessible to the application).

To use transform feedback, instantiate the `TransformFeedback` class and add the buffers you want the GPU to store processed vertex data in. Also, let your program know what varyings you want to extract into `Buffers` before you link it:

```
const transformFeedback = new TransformFeedback(gl, {})
.bindBuffersForVaryings({
  gl_Position: new Buffer(gl, {}),
  vColor: new Buffer(gl, {}),
  vNormal: new Buffer(gl, {}),
});

transformFeedback.begin(GL.POINTS);
const program = new Program(gl, {vs, fs, transformFeedback}})
const program = new Program(gl, {vs, fs, transformFeedback}})
```

For more details on how transform feedback works refer to the [OpenGL Wiki](https://www.khronos.org/opengl/wiki/Transform_Feedback).


### Disabling the Fragment Shader

When using transform feedback, you are often not interested in the output of the fragment shader. If so, you can stop it from running to improve performance. Just turn off rasterization in your draw calls.

```
program.draw({
  settings: {
    [GL.RASTERIZER_DISCARD]: true
  }
});
```

## What's Next

Development luma.gl is by no means finished and here are some highlights of what can be expected in coming releases:

* **Library Size** - WebGL2 is a big API and together with the new advanced features in luma.gl, it means that the luma.gl library has grown considerably in size. Expect a bigger effort already for the next minor release to reduce the size of the library and the impact it has on the size of application bundles.
* **GPGPU computing** - This remains an area of active development for luma.gl and deck.gl. We expect to add new examples to demonstrate GPGPU techniques, and the luma.gl API will continue to evolve to make sure the necessary code in applications becomes as clean and easy to work with as possible.
* **More Shader Modules** - More shader modules will be provided. While the shader module system introduced in v4 is already useful, the real power will come from having a library of composable, documented, and tested shader modules. More examples will also be rewritten to take advantage of the shader module system.
* **WebGL2 (Continued)** - More WEBGL2 enabled examples will be added, giving developers an easy way to start using the new classes and methods, and we plan to track and integrate any new extensions for WebGL2 as they become available in browsers.
* **Seer Integration** - The Seer Chrome extension is a highly flexible and extensible system, and further leveraging Seer should surface much more information about the state of various luma.gl objects in future releases, further simplifying debugging and profiling of luma.gl applications.
