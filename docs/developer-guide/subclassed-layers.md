# Subclassed Layers

deck.gl layers are designed to be easy to extend in order to add features.
Subclassing allows redefining both layer life cycle methods as well as
the vertex and/or fragment shaders.

If a small feature is missing from a layer, subclassing can often be a
good technique to add it.

## Overriding Attribute Calculation

```js
// Example to add per-segment color to PathLayer
import {PathLayer} from 'deck.gl';

// Accessor: `getColor` (Function, optional)
// Returns an color (array of numbers, RGBA) or array of colors (array of arrays).

export default MultiColorPathLayer extends PathLayer {
  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const color = getColor(data[index], index);
      if (Array.isArray(color[0])) {
        if (color.length !== path.length) {
          throw new Error('PathLayer getColor() returned a color array, but the number of '
           `colors returned doesn't match the number of points in the path. Index ${index}`);
        }
        color.forEach((pointColor) => {
          const alpha = isNaN(pointColor[3]) ? 255 : pointColor[3];
          colors[i++] = pointColor[0];
          colors[i++] = pointColor[1];
          colors[i++] = pointColor[2];
          colors[i++] = alpha;
        });
      } else {
        if (isNaN(color[3])) {
          color[3] = 255;
        }
        for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = color[3];
        }
      }
    });
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

Read about [writing your own shaders](/docs/developer-guide/writing-shaders.md).

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
/// my-scatterplot-layer.js
// Example to draw rounded rectangles instead of circles in ScatterplotLayer
import {ScatterplotLayer} from 'deck.gl';
import customFragmentShader from 'my-scatterplot-layer-fragment';

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
    const shaders = Object.assign({}, super.getShaders(), {
      fs: customFragmentShader
    });
    return shaders;
  }
}
RoundedRectangleLayer.defaultProps = {
  ...ScatterplotLayer.defaultProps,
  // cornerRadius: the amount of rounding at the rectangle corners
  // 0 - rectangle. 1 - circle.
  cornerRadius: 0.1
}
```

```js
/// my-scatterplot-layer-fragment.js
export default `\
#define SHADER_NAME my-scatterplot-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform float cornerRadius;

varying vec4 vColor;
varying vec2 unitPosition;

void main(void) {

  float threshold = sqrt(2.0) * (1.0 - cornerRadius) + 1.0 * cornerRadius;
  float distToCenter = length(unitPosition);

  if (distToCenter <= threshold) {
    gl_FragColor = vColor;
  } else {
    discard;
  }
}
`;
```

## Defining Additional Attributes

During initialization, you may define additional attributes by accessing the
layer's [attribute manager](/docs/developer-guide/attribute-management.md):

```js
// my-point-cloud-layer.js
// Example to add per-point size to point cloud layer
import {PointCloudLayer} from 'deck.gl';
import vertexShader from 'my-point-cloud-layer-vertex';

export default MyPointCloudLayer extends PointCloudLayer {

  initializeState() {
    super.initializeState();

    this.state.attributeManager.addInstanced({
      instanceRadiusPixels: {size: 1, accessor: 'getRadius', update: this.calculateInstanceRadiusPixels}
    });
  }

  calculateInstanceRadiusPixels({value}) {
    const {data, getRadiusPixels} = this.props;
    let i = 0;
    for (const point of data) {
      value[i++] = getRadiusPixels(point);
    }
  }

  getShaders() {
    return {
      vs: vertexShader,
      fs: super.getShaders().fs
    }
  }
}
MyPointCloudLayer.defaultProps = {
  ...PointCloudLayer.defaultProps,
  // returns point radius in pixels
  getRadiusPixels: d => 1
}
```

```js
// my-point-cloud-layer-vertex.js
export default `\
#define SHADER_NAME my-point-cloud-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instanceNormals;
attribute vec4 instanceColors;
attribute vec3 instanceRadiusPixels;

uniform float opacity;
uniform vec2 viewportSize;

varying vec4 vColor;
varying vec2 unitPosition;

void main(void) {
  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;

  // Find the center of the point and add the current vertex
  vec4 position_worldspace = vec4(project_position(instancePositions), 1.0);
  vec2 vertex = positions.xy * instanceRadiusPixels / viewportSize * 2.0;
  gl_Position = project_to_clipspace(position_worldspace) + vec4(vertex, 0.0, 0.0);

  // Apply lighting
  float lightWeight = getLightWeight(position_worldspace.xyz, // the w component is always 1.0
    instanceNormals);

  // Apply opacity to instance color, or return instance picking color
  vColor = vec4(lightWeight * instanceColors.rgb, instanceColors.a * opacity) / 255.;
}
`;
```
