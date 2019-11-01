# Subclassed Layers

deck.gl layers are designed to be easy to extend in order to add features.
Subclassing allows redefining both layer life cycle methods as well as
the vertex and/or fragment shaders.

If a small feature is missing from a layer, subclassing can often be a
good technique to add it.

## Overriding Attribute Calculation

```js
// Example to add per-segment color to PathLayer
import {PathLayer} from '@deck.gl/layers';
import GL from '@luma.gl/constants';

// Allow accessor: `getColor` (Function, optional)
// Returns an color (array of numbers, RGBA) or array of colors (array of arrays).
export default class MultiColorPathLayer extends PathLayer {
  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        update: this.calculateColors
      }
    })
  }

  calculateColors(attribute) {
    const {data, getPath, getColor} = this.props;
    const {value} = attribute;

    let i = 0;

    for (const object of data) {
      const path = getPath(object);
      const color = getColor(object);
      if (Array.isArray(color[0])) {
        if (color.length !== path.length) {
          throw new Error(`PathLayer getColor() returned a color array, but the number of
           colors returned doesn't match the number of segments in the path`);
        }
        color.forEach((segmentColor) => {
          value[i++] = segmentColor[0];
          value[i++] = segmentColor[1];
          value[i++] = segmentColor[2];
          value[i++] = isNaN(segmentColor[3]) ? 255 : segmentColor[3];
        });
      } else {
        for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = isNaN(color[3]) ? 255 : color[3];
        }
      }
    }
  }
}
```

*[Courtesy](https://github.com/uber/deck.gl/pull/336) of [@dcposch](https://github.com/dcposch).*

## Overriding Shaders

You can replace the shaders used in a layer by overriding the `getShaders()`
method. Every core layer calls this method during initialization. It
returns the shaders and modules used by the layer in an object:

* `vs`: string, GLSL source of the vertex shader
* `fs`: string, GLSL source of the fragment shader
* `modules`: Array, list of shader modules to be used
* `inject`: Object, map from injection points to custom GLSL code to be injected

Read about [writing your own shaders](/docs/developer-guide/custom-layers/writing-shaders.md).

When you are implementing your own custom layers, and want to change the shaders
it is encouraged that you also define a `getShaders()` function and selectively
overwrite required shader(s) with custom shaders.
This makes it much easier for others to subclass your layer and make small
changes to the shaders.

Note: When overwriting `getShaders()` you should pass down any unmodified shader(s)
and `modules` as is. See code example below.

## Defining Additional Uniforms

The best way to pass additional uniforms to your custom shader is to override
the `draw()` method:

```js
/// rounded-rectangle-layer.js
// Example to draw rounded rectangles instead of circles in ScatterplotLayer
import {ScatterplotLayer} from '@deck.gl/layers';
import customFragmentShader from './rounded-rectangle-layer-fragment';

export default RoundedRectangleLayer extends ScatterplotLayer {

  draw({uniforms}) {
    super.draw({
      uniforms:
        {
        ...uniforms,
        cornerRadius: this.props.cornerRadius
        }
    })
  }

  getShaders() {
    // use object.assign to make sure we don't overwrite existing fields like `vs`, `modules`...
    return Object.assign({}, super.getShaders(), {
      fs: customFragmentShader
    });
  }
}

RoundedRectangleLayer.defaultProps = {
  // cornerRadius: the amount of rounding at the rectangle corners
  // 0 - rectangle. 1 - circle.
  cornerRadius: 0.1
}
```

Modified fragment shader that uses this uniform (learn more in [writing your own shaders](/docs/developer-guide/custom-layers/writing-shaders.md)):

```js
/// rounded-rectangle-layer-fragment.js
// This is copied and adapted from scatterplot-layer-fragment.glsl.js
// Modifications are annotated
export default `\
#define SHADER_NAME rounded-rectangle-layer-fragment-shader

precision highp float;

uniform float cornerRadius;

varying vec4 vFillColor;
varying vec2 unitPosition;

void main(void) {

  float distToCenter = length(unitPosition);

  /* Calculate the cutoff radius for the rounded corners */
  float threshold = sqrt(2.0) * (1.0 - cornerRadius) + 1.0 * cornerRadius;
  if (distToCenter <= threshold) {
    gl_FragColor = vFillColor;
  } else {
    discard;
  }

  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
```

## Defining Additional Attributes

During initialization, you may define additional attributes by accessing the
layer's [attribute manager](/docs/developer-guide/custom-layers/attribute-management.md):

```js
// my-point-cloud-layer.js
// Example to add per-point size to point cloud layer
import {PointCloudLayer} from 'deck.gl';
import vertexShader from 'my-point-cloud-layer-vertex';

export default MyPointCloudLayer extends PointCloudLayer {

  initializeState() {
    super.initializeState();

    this.state.attributeManager.addInstanced({
      instanceRadiusPixels: {size: 1, accessor: 'getRadius'}
    });
  }

  getShaders() {
    return Object.assign({}, super.getShaders(), {
      vs: vertexShader,
    });
  }
}

MyPointCloudLayer.defaultProps = {
  // returns point radius in pixels
  getRadius: {type: 'accessor', value: 1}
};
```

Modified vertex shader that uses this attribute (learn more in [writing your own shaders](/docs/developer-guide/custom-layers/writing-shaders.md)):

```js
// my-point-cloud-layer-vertex.js
// This is copied and adapted from point-cloud-layer-vertext.glsl.js
// Modifications are annotated
export default `\
#define SHADER_NAME point-cloud-layer-vertex-shader

attribute vec3 positions;
attribute vec3 instanceNormals;
attribute vec4 instanceColors;
attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute vec3 instancePickingColors;

/* New attribute */
attribute flat instanceRadiusPixels;

uniform float opacity;

varying vec4 vColor;
varying vec2 unitPosition;

void main(void) {
  unitPosition = positions.xy;

  vec4 position_commonspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xyLow, vec3(0.), position_commonspace);
  /* replaced uniform 'radiusPixels' with 'instanceRadiusPixels' */
  gl_Position.xy += project_pixel_size_to_clipspace(positions.xy * instanceRadiusPixels);

  vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project_uCameraPosition, position_commonspace.xyz, project_normal(instanceNormals));

  vColor = vec4(lightColor, instanceColors.a * opacity) / 255.0;

  picking_setPickingColor(instancePickingColors);
}
`;
```

## Layer Extensions

Sometimes we need to subclass multiple layers to add similar functionalities.
[Layer extension](/docs/api-reference/extensions/overview.md) is a way to generalize, reuse, and share subclassed layer code. [Read on](/docs/developer-guide/custom-layers/layer-extensions.md) about how to package up a subclassed layer code into a layer extension.
