# Writing Layer Shaders

Note: This documentation is a Work-in-Progress.

## Instanced vs non-instanced rendering

When doing instanced rendering your vertex shader will be called once for
every vertex in the primitive geometry, for every instance.

By convention deck.gl names all instanced attributes with the prefix
`instance`.

## Mandatory shader features

To support the basic features expected of a deck.gl layer, your new layer's
shaders need to follow a few rules.

### Projection (Vertex Shader)

The projection shaderlib package makes it easy to write vertex shaders that
follow deck.gl's projection methods, enabling your layer to accept coordinates
in both [longitude,latitude,altitude] or [metersX,metersY,metersZ] format.

The projection package is included by default by the `assembleShaders` function,
and offers three functions `project_position`, `project_scale` and `project_to_clipspace`.

```glsl
attribute vec3 positions;
attribute vec3 instancePositions;
attribute float instanceRadius;

void main(void) {
  vec3 center = project_position(instancePositions);
  vec3 vertex = positions * project_scale(radius * instanceRadius);
  gl_Position = project_to_clipspace(center + vertex);
}

```

## Uniforms

### `layerIndex` uniform

The layerIndex is a small integer that starts at zero and is incremented
for each layer that is rendered. It can be used to add small offsets to
the z coordinate of layers to resolve z-fighting between overlapping
layers.

### `opacity` uniform

In the fragment shader, multiply the fragment color with the opacity
uniform.

### `picking` uniforms

If you choose to implement picking through picking colors, make sure
the `pickingColors` or `instancePickingColors` attribute is correctly set up,
and ensure that you return the picking color when `renderPickingColors`
uniform is set. Alternatively call the `layerColor` method on your
fragment color before assigning to `gl_FragColor`.

Note that the picking color must be rendered exactly as is with an alpha
channel of 1. Beware blending in opacity as it can result in the rendered
color not matching the picking color, causing the wrong index to be picked.

Compare (bad)
```
   gl_FragColor = vec4(
     mix(
   	  instanceColor.rgb,
   	  instancePickingColor,
   	  renderPickingBuffer
     ),
     opacity
   );
```
vs (good)
```
   gl_FragColor = mix(
   	vec4(instanceColor.rgb, instanceColor.a * opacity),
   	vec4(instancePickingColor, 1.),
   	renderPickingBuffer
   );
```

## Build Concerns

You need to decide how to organize your shader code. If you decide to use
the [glslify](https://github.com/stackgl/glslify) tool you will need to
install that module and add the required transform or plugin to your
application build process.


## Optional Features


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


## Shader libraries

deck.gl comes with a basic "shader compositor" (the `assembleShaders` function)
that allows you to dynamically assemble a shader from a set of shader
libraries or modules.

The generated shader always contains a prologue of platform defines, and then
other modules are included based on flags to `assembleShaders`, and finally
your shader code is added.

**Note**: Your code can be run through another glsl code assembler like
`glslify` before you pass it to `assembleShaders`. The `assembleShaders` function
does NOT do any kind of syntax analysis so is not able to prevent naming conflicts
when variable or function names from different modules. You can use multiple
techniques to organize your shader code to fit your project needs.


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
