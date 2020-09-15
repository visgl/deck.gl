import {Model, Texture2D, Framebuffer, isWebGL2} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const AGGREGATE_VS = `\
#define SHADER_NAME data-filter-vertex-shader

attribute float instanceFilterIndex;
attribute float instanceFilterPrevIndex;

void main() {
  dataFilter_value *= float(instanceFilterIndex != instanceFilterPrevIndex);
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

export function getFramebuffer(gl) {
  const fb = new Framebuffer(gl, {
    width: 1,
    height: 1,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: new Texture2D(gl, {
        format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
        type: GL.FLOAT
      })
    }
  });

  return fb;
}

export function getModel(gl, shaderOptions) {
  return new Model(gl, {
    id: 'data-filter-aggregation-model',
    vertexCount: 1,
    isInstanced: true,
    drawMode: GL.POINTS,
    vs: AGGREGATE_VS,
    fs: AGGREGATE_FS,
    ...shaderOptions
  });
}
