# Writing Layer Shaders

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
in both [longitude,latitude,altitude] or [metersX, metersY,metersZ] format.

The projection package is included by default by the `assembleShaders` function,
and offers three functions `preproject`, `scale` and `project`.

```glsl
attribute vec3 positions;
attribute vec3 instancePositions;
attribute float instanceRadius;

void main(void) {
  vec3 center = preproject(instancePositions);
  vec3 vertex = positions * scale(radius * instanceRadius);
  gl_Position = project(center + vertex);
}

```


### Opacity (Fragment Shader)

In the fragment shader, multiply the fragment color with the opacity
uniform or call the `layerColor` method.


### Picking (Fragment Shader)

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
for performance or just code simplication reasons. This is also a feature
that can easily be added to a deck.gl shader.

**Tip:** Use `discard` in the fragment shader instead of 0 alpha.
Faster and leaves the depth buffer unaffected.


### Lighting (Vertex and Fragment Shaders)

A simple lighting package is provided in deck.gl, supporting a single
directional light in addition to ambient light. As is usually the case
with lighting calculations, he package requires normals to be defined
for each vertex.


### Animation (Vertex Shader)

A powerful capability of deck.g is the ability to create layers that animate
objects using the GPU instead of the CPU.

Updating the positions of thousands of objects in JavaScript
between each frame can be slow, and moving those calculations to the GPU
can lead to significant speedups.

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
`glslify` before you pass it to `assembleShaders`. You can use multiple
techniques to organize your shader code to fit your project needs.


### Platform defines

This "virtual" module is a dynamically generated prologue containing
#defines describing your graphics card and platform. It is automatically
injected by `assembleShaders` before any modules are included.


### fp64

A core feature of deck.gl are the math libraries. These both provide
emulated 64-bit floating point, to compensate for the lack of 64-bit
floating point in WebGL. Note that this library is tested on (and contains
fixes for) graphics cards from both

### math

Contains basic math functions



