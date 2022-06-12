import {Model, Texture2D, Framebuffer, isWebGL2} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const AGGREGATE_VS = `\
#define SHADER_NAME data-filter-vertex-shader

#ifdef FLOAT_TARGET
  attribute float filterIndices;
  attribute float filterPrevIndices;
#else
  attribute vec2 filterIndices;
  attribute vec2 filterPrevIndices;
#endif

varying vec4 vColor;
const float component = 1.0 / 255.0;

void main() {
  #ifdef FLOAT_TARGET
    dataFilter_value *= float(filterIndices != filterPrevIndices);
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    vColor = vec4(0.0, 0.0, 0.0, 1.0);
  #else
    // Float texture is not supported: pack result into 4 channels x 256 px x 64px
    dataFilter_value *= float(filterIndices.x != filterPrevIndices.x);
    float col = filterIndices.x;
    float row = filterIndices.y * 4.0;
    float channel = floor(row);
    row = fract(row);
    vColor = component * vec4(bvec4(channel == 0.0, channel == 1.0, channel == 2.0, channel == 3.0));
    gl_Position = vec4(col * 2.0 - 1.0, row * 2.0 - 1.0, 0.0, 1.0);
  #endif
  gl_PointSize = 1.0;
}
`;

const AGGREGATE_FS = `\
#define SHADER_NAME data-filter-fragment-shader
precision highp float;

varying vec4 vColor;

void main() {
  if (dataFilter_value < 0.5) {
    discard;
  }
  gl_FragColor = vColor;
}
`;

export function supportsFloatTarget(gl: WebGLRenderingContext): boolean {
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#Support_for_float_textures_doesnt_mean_you_can_render_into_them!
  return Boolean(
    gl.getExtension('EXT_float_blend') &&
      // WebGL 2
      (gl.getExtension('EXT_color_buffer_float') ||
        // WebGL 1
        gl.getExtension('WEBGL_color_buffer_float'))
  );
}

// A 1x1 framebuffer object that encodes the total count of filtered items
export function getFramebuffer(gl: WebGLRenderingContext, useFloatTarget: boolean): Framebuffer {
  if (useFloatTarget) {
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
  return new Framebuffer(gl, {
    width: 256,
    height: 64,
    depth: false
  });
}

// Increments the counter based on dataFilter_value
export function getModel(
  gl: WebGLRenderingContext,
  shaderOptions: any,
  useFloatTarget: boolean
): Model {
  shaderOptions.defines.NON_INSTANCED_MODEL = 1;
  if (useFloatTarget) {
    shaderOptions.defines.FLOAT_TARGET = 1;
  }

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
  blend: true,
  blendFunc: [GL.ONE, GL.ONE, GL.ONE, GL.ONE],
  blendEquation: [GL.FUNC_ADD, GL.FUNC_ADD],
  depthTest: false
};
