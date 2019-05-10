# RFC: Post-processing Effect Rendering

* **Authors**: Jian Huang
* **Date**: May. 2019
* **Status**: For Review

## Abstract
Post-processing effect rendering is part of deck.gl effect rendering pipeline, focusing on screen space pixel manipulation by using ping-pong technique.

## Design

A post-processing effect is created from `PostProcessEffect` class and `Shader module`.
```js
import {Convolution} from @luma.gl/effects;
import {PostProcessEffect} from @deck.gl/core;

const postProcessEffect = new PostProcessEffect(Convolution, {
  kernel: Convolution.KERNEL.EMBOSS,
  kernelWeight: Convolution.KERNEL.EMBOSS.reduce((sum, x) => sum + x, 0)
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
* Only support postprocessing on the entire screen, not per viewport.
* Only support pure screen space effects from luma.gl
