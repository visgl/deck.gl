# RFC: Projection Mode Improvements

* **Authors**: Ib Green and Xiaoji Chen
* **Date**: Sep 2017
* **Status**: Draft

Notes:
* See discussions at end of [Issue 677](https://github.com/visgl/deck.gl/issues/677)
* Also see [PR 904](https://github.com/visgl/deck.gl/pull/904)


## Summary

This RFC proposes generalizations to the project system in deck.gl.


## Motivation

Cartographic Projections are a core functionality of deck.gl.

## Proposal: Prop to supply JavaScript Project Function

What I have been thinking is to offer the user to provide a simple JS function that maps any position (from any other coordinates) to one of our supported coordinate systems. This function would be called during position attribute generation. I.e we'd still show a mercator projected world but be able to correctly position coordinates specified in other projections. If the project function projected to TILE_ZERO it would have perf advantages during render too.


## Proposal: Replaceable Project Shader Module for Custom Projections

The shadertools module system was designed with a focus on interfaces, with an intention of allowing modules to be replaced with similar modules implementing the same interface. It would take a little more work on shadertools, but it is almost there. This was mostly intended for replacing e.g. lighting but would most likely work for projections as well.

Also shadertools already supports a generic getUniforms system that allows each module to opt in and extract what uniforms it needs from a common JS object, so modules that have the same GLSL interface could still listen for different JS props.

This should allow apps to plug in a replacement project module as you suggest, that could pick up any uniforms it wanted from the layers' props, e.g. your suggested projectionParams.

## Proposal: Support Preprojected Web Mercator Coordinates (Tile 0)

Add a `COORDINATE_SYSTEM.TILE_ZERO` mode. It would allow the app to preproject lng/lats in JavaScript to numbers between 0-512.

* The shader already knows the scale so it could apply it without the app having to modify distance scales.
* Implementing this mode is easy. I mainly want to make sure there is a use case for these modes before we add more complexity to the framework.

The main advantages:
* Somewhat better precision in 32-bit mode as the projections (trigonometry etc) are done in JavaScript 64 bits. Results are reported to be "between 32 and 64 bit".
* Somewhat faster rendering (no need for vertex shader to reproject lng/lats every frame). The improvement may be limited in fp32 mode as rendering is typically fragment bound, although it may have bigger impact in 64-bit mode.
* A bit more flexibility for the application when converting coordinates from other systems to web mercator

Note that the full "precision" advantages only come when we use offsets instead of absolute coordinates, so this mode would ideally need to support `fp64`.

Questions:
* Maybe we could also add a `COORDINATE_SYSTEM.TILE_ZERO_OFFSETS` mode? But that makes the setup ever more complex... And what would the reference point be? lngLat or tile 0?


