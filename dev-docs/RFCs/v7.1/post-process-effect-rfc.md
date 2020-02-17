# RFC: Post-processing Effect Rendering

* **Authors**: Jian Huang
* **Date**: May. 2019
* **Status**: For Review

## Abstract
Post-processing effect rendering is part of deck.gl effect rendering pipeline, focusing on screen space pixel manipulation by using ping-pong technique.

## Design

A post-processing effect is created from `PostProcessEffect` class and Shader module.
```js
import {brightnessContrast} from '@luma.gl/effects';
import {PostProcessEffect} from '@deck.gl/core';

const postProcessEffect = new PostProcessEffect(brightnessContrast, {
  brightness: 0.5,
  contrast: 0.5
});

const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  initialViewState,
  controller: true,
  // add effect to deck
  effects: [postProcessEffect],
  layers: [new GeoJsonLayer({
    ...
  })]
});
```

### API

`PostProcessEffect` class is the public interface to create post-processing effects, it only has two params.
* `module`(Object): GLSL shader code and default uniforms for rendering
* `props`(Object): parameters to tune effects

`ScreenPass` class is the internal interface to handle the rendering of one pass, it is created by PostProcessEffect dynamically from shader module.
* `inputBuffer`(Object): frame buffer object as input data
* `outputBuffer`(Object): frame buffer object as out

### Shader Module
`@luma.gl/effects` lib will host all the post-processing effect shader modules, currently most of them are sitting in `@luma.gl/glfx`. A typical shader module defines `name`, `uniforms` and `Shader Func`.
```js
const fs = `\  
uniform float brightness;  
uniform float contrast;  

vec4 brightnessContrast_filterColor(vec4 color, vec2 texSize, vec2 texCoords) {  
 return brightnessContrast_filterColor(color);
}  
`;  

const uniforms = {  
  brightness: {value: 0, min: -1, max: 1},  
  contrast: {value: 0, min: -1, max: 1}  
};  

export default {  
  name: 'brightnessContrast',  
  uniforms,  
  fs,  
  passes: [{filter: true}]  
};
```
### Workflow
<pre>Layers -----> Framebuffer
                       \
                        DeckRenderer -----> Screen
                       /
Effects -----> ScreenPasses</pre>

## Limitation
* At launch post-processing effect is applied to the entire canvas. Multi-view support will be implemented in future iterations.
* Only support pure screen space effects from luma.gl
* Post-processing effect won't apply to mapbox base map.
