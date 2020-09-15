import {Model, Texture2D, Framebuffer, isWebGL2} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const AGGREGATE_VS = `\
#define SHADER_NAME data-filter-vertex-shader

attribute float filterIndices;
attribute float filterPrevIndices;

void main() {
  dataFilter_value *= float(filterIndices != filterPrevIndices);
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}
`;

const AGGREGATE_FS = `\
#define SHADER_NAME data-filter-fragment-shader
precision highp float;

void main() {
  if (dataFilter_value < 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(1.0);
  }
}
`;

export function isSupported(gl) {
  return Framebuffer.isSupported(gl, {colorBufferFloat: true});
}

// A 1x1 framebuffer object that encodes the total count of filtered items
export function getFramebuffer(gl) {
  return new Framebuffer(gl, {
    width: 1,
    height: 1,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: new Texture2D(gl, {
        format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
        type: GL.FLOAT,
        mipmaps: false
      })
    }
  });
}

// Increments the counter based on dataFilter_value
export function getModel(gl, shaderOptions) {
  shaderOptions.defines.NON_INSTANCED_MODEL = 1;

  return new Model(gl, {
    id: 'data-filter-aggregation-model',
    vertexCount: 1,
    isInstanced: false,
    drawMode: GL.POINTS,
    vs: AGGREGATE_VS,
    fs: AGGREGATE_FS,
    ...shaderOptions
  });
}

export const parameters = {
  viewport: [0, 0, 1, 1],
  blend: true,
  blendFunc: [GL.ONE, GL.ONE, GL.ONE, GL.ONE],
  blendEquation: [GL.FUNC_ADD, GL.FUNC_ADD],
  depthTest: false
};
