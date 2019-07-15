# RFC: Shadow for directional lights

* **Authors**: Jian Huang

* **Date**: July. 2019

* **Status**: For Review

## Abstract
Deck.gl has new basic lighting effect since 7.0, shadow effects for directional lights can improve rendering quality.

## Proposal
### API
`ShadowEffect` class is the public interface to create shadow effects, it has two params.
* `lights`(Object): collection of directional light sources
* `shadowColor`(Array): RGBA color for shadow rendering

`ShadowExtension` class is the public interface to interact with layers, inject GLSL code to layer shaders.

### Example
```js
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight0 = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [10, -20, -30]
});

const dirLight1 = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-10, -20, -30]
});

const lightingEffect = new LightingEffect({ambientLight, dirLight0, dirLight1});
const shadowEffect = new ShadowEffect({dirLight0, dirLight1});
const LAYER_EXTENSIONS = [new ShadowExtension()];
const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  effects: [lightingEffect, shadowEffect],
  layers: [
	  // building layer
	  new SolidPolygonLayer({
	  extensions: LAYER_EXTENSIONS,
      ...}),
      // ground layer
      new SolidPolygonLayer({
	  extensions: LAYER_EXTENSIONS,
      ...})]
});
```
### Workflow
* Shadow effect passed into deck and create shadow passes based on light directions, there is one shadow pass for each directional light, for now totally two lights are supported
* Shadow module code injected to layer shader by layer extension
* For each shadow pass, layers with shadow extension are rendered to a shadow map
* After all the effects are processed, there is a regular layer rendering pass, shadow maps are used to render the final shadows.

## Future Ideas
 With current design user need specify both shadow effect and extension to enable shadow effects, we could design a mechanism to add shadow extension to qualified layers automatically
