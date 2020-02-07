# RFC: SSAO Effect

* **Authors**: Jian Huang

* **Date**: July. 2019

* **Status**: For Review

## Abstract
SSAO is an efficient approximation of ambient occlusion, which tunes the ambient lighting based on depths of the current pixel and the surrounding area.

## Proposal
### API
`SSAOEffect` class is the public interface to create the SSAO effect.

### Example
```js
const ssaoEffect = new SSAOEffect();
const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  effects: [ssaoEffect],
  layers: [
	  // building layer
	  new SolidPolygonLayer({
      ...})]
});
```
### Workflow
* SSAO effect is constructed by the user
* SSAO shader module is set to default in the constructor and a depth pass is also created
* In the depth pass, all the layers are rendered to a depth map
* After all the effects are processed, 3D layers with SSAO module injected tunes the ambient lighting factor based on depths.

## Limitations
We only apply SSAO to 3D layers. Pixels in 2D layers close to 3D objects should also have this effect.
