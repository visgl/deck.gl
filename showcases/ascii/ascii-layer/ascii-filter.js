import {Texture2D, Model, Buffer, Framebuffer, Geometry, TransformFeedback, readPixelsToArray} from 'luma.gl';
import GL from 'luma.gl/constants';
import {sortCharactersByBrightness} from './utils';

const vs = `
#define SHADER_NAME feedback-vertex-shader

uniform sampler2D video;
uniform sampler2D pixelMapTexture;
attribute vec2 uv;

varying vec4 instanceIconFrames;
varying vec4 instanceColors;

float bitColor(float x) {
  return floor(x * 4. + 0.5) * 64.;
}

void main(void) {
  vec4 pixel = texture2D(video, uv);
  float luminance = 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;

  instanceColors = vec4(
    bitColor(pixel.r),
    bitColor(pixel.g),
    bitColor(pixel.b),
    255.0
  );

  instanceIconFrames = texture2D(pixelMapTexture, vec2(luminance + 0.5 / 256., 0.5));

  gl_Position = vec4(0.0);
}
`;

const fs = `
#define SHADER_NAME feedback-fragment-shader

precision highp float;

varying vec4 instanceIconFrames;
varying vec4 instanceColors;

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;

function getPixelMapTexture(gl, {iconMapping, iconAtlas}) {
  // Read the number of dark pixels by character
  const darkPixelsByCharacter = {};
  const {width, height} = iconAtlas;
  const frameBuffer = new Framebuffer(gl, {
    width,
    height,
    attachments: {
      [gl.COLOR_ATTACHMENT0]: iconAtlas
    }
  });

  for (const char in iconMapping) {
    const bbox = iconMapping[char];

    const pixels = readPixelsToArray(frameBuffer, {
      sourceX: bbox.x,
      sourceY: height - bbox.y - bbox.height,
      sourceWidth: bbox.width,
      sourceHeight: bbox.height
    });
    const len = pixels.length;
    let sum = 0;
    for (let i = 0; i < len; i += 4) {
      const r = pixels[i];
      const a = pixels[i + 3];
      if (a) {
        sum += 1 - r / 255 * (a / 255);
      }
    }
    darkPixelsByCharacter[char] = sum;
  }

  const chars = sortCharactersByBrightness(darkPixelsByCharacter);

  const data = new Float32Array(4 * 256);
  let index = 0;
  for (let i = 0; i < 256; i++) {
    const icon = iconMapping[chars[i]];
    data[index++] = icon.x;
    data[index++] = icon.y;
    data[index++] = icon.width;
    data[index++] = icon.height;
  }

  return new Texture2D(gl, {
    width: 256,
    height: 1,
    dataFormat: GL.RGBA,
    format: GL.RGBA32F,
    type: GL.FLOAT,
    mipmaps: false,
    parameters: {
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
    },
    data
  });
}

export default class AsciiFilter {
  constructor(gl, {iconMapping, iconAtlas}) {
    this.gl = gl;
    this.transformFeedback = new TransformFeedback(gl);

    this.model = new Model(gl, {
      id: 'ascii-filter',
      vs,
      fs,
      varyings: ['instanceIconFrames', 'instanceColors'],
      geometry: new Geometry({
        drawMode: GL.POINTS
      }),
      vertexCount: 0,
      isIndexed: true
    });

    this.videoTexture = new Texture2D(gl, {
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
      }
    });
    this._updateDimension({width: 1, height: 1});

    this.model.setUniforms({
      pixelMapTexture: getPixelMapTexture(gl, {iconMapping, iconAtlas}),
      video: this.videoTexture
    });
  }

  getBuffers({width, height, video}) {
    const {model, videoTexture, transformFeedback} = this;

    this._updateDimension({width, height, video});
    videoTexture.setSubImageData({width: video.videoWidth, height: video.videoHeight, data: video});

    model.draw({
      uniforms: {
        video: videoTexture
      },
      transformFeedback,
      parameters: {
        [GL.RASTERIZER_DISCARD]: true
      }
    });

    return this.buffers;
  }

  _updateDimension({width, height, video}) {
    const {videoTexture, model, transformFeedback, gl} = this;

    if (width === videoTexture.width && height === videoTexture.height) {
      return;
    }

    // video.width = width;
    // video.height = height;
    videoTexture.resize({width: video.videoWidth, height: video.videoHeight});

    const vertexCount = width * height;
    model.setVertexCount(vertexCount);

    // update attribute
    const uv = new Float32Array(2 * vertexCount);
    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        uv[i++] = (x + 0.5) / width;
        uv[i++] = (y + 0.5) / height;
      }
    }

    model.setAttributes({uv: {size: 2, value: uv}});

    const iconFrameBuffer = new Buffer(gl, {
      size: 4,
      instanced: 1,
      data: new Float32Array(4 * vertexCount),
      usage: GL.DYNAMIC_COPY
    });

    const colorBuffer = new Buffer(gl, {
      size: 4,
      instanced: 1,
      data: new Float32Array(4 * vertexCount),
      usage: GL.DYNAMIC_COPY
    });

    this.buffers = {
      instanceIconFrames: iconFrameBuffer,
      instanceColors: colorBuffer
    };

    transformFeedback.setBuffers({
      0: iconFrameBuffer,
      1: colorBuffer
    });
  }
}
