# outline Shader Module

The `outline` module is useful when you are rendering 2D elements in the same plane (on top of each other), but want to show some kind of outline or shadow to indicate which element is logically on top.

Implementation note: This module works by rendering your graphics into a sample "outline" shadow map, and then darkens the color on pixels in your graphics when they are drawn close to another object with a higher "logical z order", giving a shadow outline effect.


## Usage

Your vertex shader might look like:
```
attribute vec3 position;
attribute vec4 lineColor;
attribute float zLevel;

varying vec4 vColor;

void main() {
  ...

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
  vColor = lineColor;

  ...

  // Store info needed to render outline shadows
  outline_setZLevel(zLevel);
  outline_setUV(gl_Position);
}
```

And in the fragment shader:
```
varying vec4 vColor;

void main() {
  gl_FragColor = vColor;

  ...

  // Render outline shadows
  gl_FragColor = outline_filterColor(gl_FragColor);

  ...
}
```

## getUniforms

`getUniforms({outlineRender, outlineShadowMap})`

* `outlineRender` (Boolean, `false`) - set to `true` during the "outline map" rendering pass (i.e. specifies whether to render into or from the shadowmap).
* `outlineShadowmap` (`Texture`, required) -
