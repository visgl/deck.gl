# RFC: GLSL Accessors

* Authors: Ib Green, ...
* Date: June 13, 2018
* Status: **Draft**

This RFC is intended to support the binary support roadmap.


## Summary

This RFC proposes supporting GLSL accessors (setting accessors to strings containing fragments of GLSL code), allowing layers to completely or partially skip attribute generation and work directly on supplied binary data.


## Overview

This RFC explores the idea of allowing modification of behavior of layers to be done on the GLSL level, not just the JS level.


## Proposal

Let's say that we load binary data for a point cloud that only contains a single value per point (e.g. `reflectance`), but the `PointCloudLayer` only supports specifying an RGBA color per point. While we could certainly supply a JavaScript function to the layer's `getColor` accessor to have it build a complete RGBA color array attribute, this extra time and memory could be avoided:

```
PointCloudLayer({
   attributes: {
   	 reflectance
   },
   uniforms: {
   	 alpha
   },
   getColor: 'return vec4(reflectance, reflectance, reflectance, alpha);'
})
```

### New features

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


### Descriptive Attributes (non-positions)

One of the aspects of tesselating layers is that for descriptive attributes (non-positions) they tend to have to duplicate the same input value for all tesselated vertices for that visual element, such as `colors` etc.

This duplication has two limitations:
* It is inefficient (potentially throwing away a perfectly good binary input buffer, replacing it with a much bigger buffer with lots of copies of the same value).
* It is also limiting in the sense that having different values could be used to e.g. color or even animate the object in a good way.

To address the first issue, and allow binary input buffers with one datum per visual element to be used as descriptive attributes without transformation would could be to store them as data textures and index them with the current `instance id`. `gl_InstanceId` is available in GLSL 3.00 in but would have to be polyfilled in GLSL 1.30 (with another attribute, or perhaps `instanceColors` could be reused, reinterpreted as `Uint32`).

To address the second issue, it could be interesting to pass arguments to (or provide global functions available to) the GLSL accessor.

```
new PathLayer({
});
```


## Design Discussions

### Choice of Accessors as GLSL replacement points

A key idea in this RFC is to let the layer user easily redefine some well-defined functions in the layers GLSL code. A reasonable question is whether overloading accessors vs defining a separate set of overridable functions is better, or even if both should be supported.

"Overloading" the accessors have the big advantage that it ties this feature into a well documented existing configuration system.

An apparent downside of overloading accessors is that it forces a choice between JS generation (function) and GLSL override (string) although this could be handled by supporting an object descriptor.

A layer shader could potentially define additional overridable functions that it would call at the right moments. These would then have to be separately documented. It would be good to see examples of such functions, and understand why they would not reasonably be expressed as new accessors, and convince ourselves that such function could be added in a structured, maintainable, non-adhoc way, before adding support.


### Fragment Shaders

If it is desirable to offer the ability to redefine GLSL functions in the fragment shader, the GLSL accessor system outlined in this system does not extend well.
* attributes are not available in the fragment shader, and such data needs to be explicitly plumbed through as `varyings` that "eat into" a very limited bank (often only 8 varyings or `vec4`s).
* It may be necessary to implement a "varying compressor" and additonal props with more complicated semantics to describe the data flow.
Naturally, if user-defined GLSL functions in the fragment shaders can only use the data already available, the system should be simpler.


## Complications/Open Issues

* Positions - do we want to make "tesselating" accessor (positions) to be GLSL injectable as well as "descriptive" accessors
* Tesselated Layers - 
* Composite Layers - a reasonable "solution" to using GLSL accessors in composite layers is probably related to a general solution for forwarding props in composite layers.
* Naming Conflicts - Define conventions for naming variables in layer shader code to maximize predictability/minimize conflicts with user's GLSL accessor code.
* Non-one-to-one accessors - Can GLSL accessors be supported in such cases with any generality?
* Transitions - it would seem possible to implement transitions for custom attributes. Perhaps some descriptor metadata is needed so that the user can specify how this should be done.


## Future Extensions

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


## Missing: Accessors affecting Fragment Shader?

This RFC as written does not offer any way for layer users to modify fragment shaders.
