# RFC: Shadow for directional lights

* **Authors**: Jian Huang

* **Date**: July. 2019

* **Status**: Approved

## Abstract
Deck.gl has new basic lighting effect since 7.0, having shadow effects for directional lights can improve rendering quality.

## Proposal
### API
`DirectionalLight` class is the public interface to create shadow effects
* `_shadow`(Boolean): create shadow effect when set to `true`, default is `false`

New layer prop
* `shadowEnabled`(Boolean): when this prop is true, layer casts and renders shadows

### Example
```js
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight0 = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [10, -20, -30],
  _shadow: true
});

const dirLight1 = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-10, -20, -30],
  _shadow: true
});

const lightingEffect = new LightingEffect({
  ambientLight,
  dirLight0,
  dirLight1
});
const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  effects: [lightingEffect],
  layers: [
    // building layer
    new SolidPolygonLayer({
      shadowEnabled: true,
      ...
    }),
    // ground layer
    new SolidPolygonLayer({
      shadowEnabled: true,
      ...
    })
  ]
});
```
### Workflow
* User creates `LightingEffect` instance which adds shadow modules into default shader modules
* `LightingEffect` instance is passed into deck and create shadow passes based on light directions, there is one shadow pass for each directional light, for now totally two lights are supported
* For each shadow pass, layers are rendered to a shadow map
* After all the effects are processed, there is a regular layer rendering pass, shadow maps are used to render the final shadows.

## Limitations
With the current design, the user needs to create `LightingEffect` instance before Deck's initialization, so that the default modules can be modified before layer shaders are assembled.
