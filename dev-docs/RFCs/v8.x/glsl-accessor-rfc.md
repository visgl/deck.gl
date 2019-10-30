# RFC: GLSL Accessors

* Authors: Ib Green
* Date: June 13, 2018
* Status: **Draft**

This RFC is part of the [binary support roadmap](dev-docs/roadmaps/performance-roadmap.md).


## Summary

This RFC proposes supporting GLSL accessors (setting accessors to strings containing fragments of GLSL code), allowing layers to:

* Completely or partially skip CPU side attribute generation
* Work directly on supplied binary data (e.g. binary tables).
* Do additional GPU processing on data, enabling "remarkably" performant custom effects.


## Overview

This RFC explores the idea of allowing modification of behavior of layers to be done on the GLSL level, not just the JS level.

Let's start with a couple of API examples to illustrate what we want to achieve:


### API Example: Using Columnar Binary Data Sirectly

Columnar binary data systems (like Apache arrow) will often store primitive values (e.g. a Float32) in separate columns, rather than as a `vec2` or `vec3`. This means that even if we exposed these columns as attributes in GLSL, we cannot use them directly as the expected `vec3` attribute for positions. However, if we could just define a snippet of GLSL code to override how the shader extracs a position from attributes (`getPosition`), we could still use these values rather than pre-processing them in JavaScript:

```
new CircleLayer({

  // inject new attributes
  glsl: {
    attributes: {
      longitude: 'float',
      latitude: 'float'
    },
  },

  // Define a custom glsl accessor (string valued accessor will be treated as GLSL)
  getPosition: 'return vec3(longitude, latitude, 0.);',

  // Supply values to the injected attributes
  attributes: {
    longitude: new Float32Array(...),
    latitude: new Float32Array(...)
  },
})
```

The `CircleLayer` vertex shader would be defined as follows:

```
// Shader module system would e.g. do a line-based replacement of getPosition
vec3 getPosition() { return instancePosition; }

main() {
  const position = getPosition();
  // Note: layer no longer assumes `position = instancePositions`, but calls overridable GLSL function
}
```


### API Example: Adapting Data to fit layer's Requirement

Let's say that we load binary data for a point cloud that only contains a single value per point (e.g. `reflectance`), but the `PointCloudLayer` only supports specifying an RGBA color per point. While we could certainly supply a JavaScript function to the layer's `getColor` accessor to have it build a complete RGBA color array attribute, this extra time and memory could be avoided:

```
PointCloudLayer({

  // inject new attributes and uniforms
  glsl: {
    attributes: {
   	  reflectance
    },
    uniforms: {
   	  alpha
    }
  },

  // Define a custom glsl accessor (string valued accessor will be treated as GLSL)
  getColor: 'return vec4(reflectance, reflectance, reflectance, alpha);',

  // Supply actual values to the injected attributes and uniforms
  attributes: {
    reflectance: new Float32Array(...)
  },
  uniforms: {
    alpha: 0.5
  }
})
```

## Proposals

> THIS SECTION IS STILL BEING DEVELOPED, NOT READY FOR REVIEW

### AttributeManager changes

* The presence of a string valued accessor would cause the `AttributeManager` to skip the generation of the attribute related to that accessor.
* The presence of `attributes` prop would cause those attributes
    1. to be included in the generated attribute map by the attribute manager (this map is passed to luma.gl `Model`)
    2. declarations for those attributes to be injected into the shader source code.
* The presense of the `uniforms` prop would cause that uniform:
    1. to be added to the generated uniform map (this map passed to luma.gl `Model`)
    2. declaration for that uniform

Notes:
* A simple size 1, `Float32Array` attribute like `reflectance` can just be passed in as a value above, but typed arrays would typically be wrapped in the usuak attribute descriptor object (Accessor) stating size, type etc.

The vertex shaders of deck.gl layers that wanted to support glsl accessors would need to be (lightly) refactored to call functions to access attributes instead of accessing those directly. For instance the `PointCloudLayer` vertex shader would look as follows (this code includes )


```
#define SHADER_NAME point-cloud-layer-vertex-shader

varying vec4 vColor;
varying vec2 unitPosition;

// Default attributes and uniforms
attribute vec3 positions;
attribute vec3 instanceNormals;
attribute vec4 instanceColors;
attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float radiusPixels;

// NEW
// BEGIN Default accessor implementations
float getRadius() { return instanceRadius; }
// vec4 getColor() { return instanceColors; }
// END default accessors

// NEW
// BEGIN Custom (injected) attributes, uniforms and accessors
in float reflectance;
uniform float alpha;
vec4 getColor() { return vec4(reflectance, reflectance, reflectance, alpha); }
// END Custom (injected) accessors

void main(void) {
  // NEW
  // Call GLSL accessors
  vec3 position = getPosition();
  vec2 position64xyLow = getPosition64();
  float instanceNormal = getNormal();
  float instanceRadius = getRadius();
  vec4 color = getColor();
  vec3 pickingColor = getPickingColor();

  // position on the containing square in [-1, 1] space
  unitPosition = position.xy;

  // Find the center of the point and add the current vertex
  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(positions, positions64xyLow, vec3(0.), position_worldspace);
  gl_Position += project_pixel_to_clipspace(positions.xy * radiusPixels);

  // Apply lighting
  float lightWeight = lighting_getLightWeight(position_worldspace.xyz, // the w component is always 1.0
    project_normal(normals));

  // Apply opacity to instance color, or return instance picking color
  vColor = vec4(lightWeight * color.rgb, color.a * opacity) / 255.;

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(pickingColor);
}
```


## Design Discussions

### Choice of Accessors as GLSL replacement points

A key idea in this RFC is to let the layer user easily redefine some well-defined functions in the layers GLSL code. A reasonable question is whether overloading accessors vs defining a separate set of overridable functions is better, or even if both should be supported.

"Overloading" the accessors have the big advantage that it ties this feature into a well documented existing configuration system.

An apparent downside of overloading accessors is that it forces a choice between JS generation (function) and GLSL override (string) although this could be handled by supporting an object descriptor, or using e.g. the glsl\`...\` string syntax.

A layer shader could potentially define additional overridable functions that it would call at the right moments. These would then have to be separately documented. It would be good to see examples of such functions, and understand why they would not reasonably be expressed as new accessors, and convince ourselves that such function could be added in a structured, maintainable, non-adhoc way, before adding support.


## Complications/Open Issues

### Support for Composite Layers

Since the proposed API is prop-based, the general solution for forwarding props in composite layers should work though not clear how practical it would be to use.

### Naming Conflicts

Define/reinforce naming conventions/prefixes for GLSL functions and variables in layer shader code to maximize predictability/minimize conflicts with user's GLSL accessor code.

### Transitions

It would seem possible to implement transitions for injected attributes. Perhaps some descriptor metadata is needed so that the user can specify if/how this should be done.


### Other Possible Issues

* Positions - do we want to make "tesselating" accessor (positions) to be GLSL injectable as well as "descriptive" accessors
* Tesselated Layers -
* Non-one-to-one accessors - Can GLSL accessors be supported in such cases with any generality? Do we need to provide separate interface for GLSL functions in this case.



## Future Extensions

### Proposal: More Abstract Syntax for GLSL accessors

Being able to write accessors in GLSL is certainly powerful and cool but probably also a bit intimidating for many users.

In addition, there are multiple versions of GLSL and in the future when we port to WebGPU we will likely have one more shader syntax on our hands.

For these reasons it could be worthwhile to define a simple syntax/format that generates GLSL accessors.


### Proposal: Dynamic Shader Regeneration

> This should likely be a separate RFC

Being able to specify props that affect the shader source code means that either:
* Changes to these props need to be detected, shaders recompiled and programs relinked
* Or we need to specify in documentation that shaders are only generated on creation

Apart from the work/extra complexity required to accurately detect when shaders should be recompiled, the big issue is that recompilation and relinking of GLSL shaders tends to be slow (sometimes extremely slow, as in several seconds, or even half a minute or more) and happens synchronously on the main WebGL thread, freezing all rendering or even the entire app.

If we support dynamic recompilation of shaders based on changing props, we therefore need to be extra careful to avoid (and detect/warn for) "spurious" recompiles. The user might not realize that the supplied props are triggering constant recompiles causing app performance to crater.

For ideas around working around slow shader compilation, see:
* [Deferring linking till first draw](http://toji.github.io/shader-perf/)
* [KHR_parallel_shader_compile extension](https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/)
* [KHR_parallel_shader_compile discussion](https://github.com/KhronosGroup/WebGL/issues/2690)
* [Intel webGL 2018 presentation](https://docs.google.com/presentation/d/1qeD2xio2dgkqWGQucZs6nezQPePOM4NtV9J54J7si9c/htmlpresent) search for KHR_parallel_shader_compile


### Fragment Shader Support

This RFC as written does not offer any way for layer users to modify fragment shaders.

If it is desirable to offer the ability to redefine GLSL functions in the fragment shader, the GLSL accessor system outlined in this system does not extend well.
* attributes are not available in the fragment shader, and such data needs to be explicitly plumbed through as `varyings` that "eat into" a very limited bank (often only 8 varyings or `vec4`s).
* It may be necessary to implement a "varying compressor" and additonal props with more complicated semantics to describe the data flow.
Naturally, if user-defined GLSL functions in the fragment shaders can only use the data already available, the system should be simpler.
