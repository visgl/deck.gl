/* global document */
import {assembleShaders} from 'deck.gl';
import {Model, Geometry, Program, createGLContext} from 'luma.gl';

import vertex from './delaunay-interpolation-vertex.glsl';
import fragment from './delaunay-interpolation-fragment.glsl';

export default class DelaunayInterpolation {
  constructor(opts) {
    this.props = opts;
    this.context = opts.gl;
    if (!opts.gl) {
      const canvas = document.getElementById('texture-canvas') || document.createElement('canvas');
      canvas.id = 'texture-canvas';
      canvas.style.display = 'none';
      document.body.appendChild(canvas);
      this.context = createGLContext({canvas: 'texture-canvas', debug: false, webgl2: true});
    }
  }

  getTextureWidth() {
    return this.props.textureWidth || 256;
  }

  generateTextures() {
    const gl = this.context;
    const {boundingBox, measures, triangulation} = this.props;
    const {txt, bounds, textures, width, height} =
      this._generateTextures(gl, boundingBox, triangulation, measures);

    return {
      textureObject: txt,
      dataBounds: bounds,
      textureArray: textures,
      textureSize: {width, height}
    };
  }

  getDelaunayShaders() {
    return {
      vs: vertex,
      fs: fragment
    };
  }

  getDelaunayModel(gl, triangulation) {
    const positions = [];
    triangulation.forEach(triangle => positions.push(
      -triangle[0].long, triangle[0].lat, triangle[0].elv,
      -triangle[1].long, triangle[1].lat, triangle[1].elv,
      -triangle[2].long, triangle[2].lat, triangle[2].elv
    ));

    const shaders = assembleShaders(gl, this.getDelaunayShaders());

    return new Model({
      gl,
      id: 'delaunay',
      program: new Program(gl, shaders),
      geometry: new Geometry({
        drawMode: 'TRIANGLES',
        positions: new Float32Array(positions)
      }),
      isInstanced: false
    });
  }

  createTexture(gl, options) {
    gl.getExtension('EXT_color_buffer_float');

    const opt = Object.assign({
      textureType: gl.TEXTURE_2D,
      pixelStore: [
        {name: gl.UNPACK_FLIP_Y_WEBGL, value: true}
      ],
      parameters: [
        {name: gl.TEXTURE_MAG_FILTER, value: gl.NEAREST},
        {name: gl.TEXTURE_MIN_FILTER, value: gl.NEAREST},
        {name: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE},
        {name: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE}
      ],
      data: {
        internalFormat: gl.RGBA32F,
        format: gl.RGBA,
        value: false,
        type: gl.FLOAT,

        width: 0,
        height: 0,
        border: 0
      }
    }, options);

    const textureType = opt.textureType;
    const textureTarget = textureType;
    const pixelStore = opt.pixelStore;
    const parameters = opt.parameters;
    const data = opt.data;
    const value = data.value;
    const type = data.type;
    const format = data.format;
    const internalFormat = data.internalFormat;
    const hasValue = Boolean(data.value);

    const texture = gl.createTexture();
    gl.bindTexture(textureType, texture);

    // set texture properties
    pixelStore.forEach(option => gl.pixelStorei(option.name, option.value));

    // load texture
    if (hasValue) {
      if ((data.width || data.height) && (!value.width && !value.height)) {
        gl.texImage2D(textureTarget, 0, internalFormat, data.width, data.height,
          data.border, format, type, value, 0);
      } else {
        gl.texImage2D(textureTarget, 0, internalFormat, format, type, value);
      }

    // we're setting a texture to a framebuffer
    } else if (data.width || data.height) {
      gl.texImage2D(textureTarget, 0, internalFormat, data.width, data.height,
        data.border, format, type, null);
    }
    // set texture parameters
    for (let i = 0; i < parameters.length; i++) {
      const opti = parameters[i];
      gl.texParameteri(textureType, opti.name, opti.value);
    }

    return texture;
  }

  createRenderbuffer(gl, options) {
    const opt = Object.assign({
      storageType: gl.DEPTH_COMPONENT16,
      width: 0,
      height: 0
    }, options);

    const renderBuffer = gl.createRenderbuffer(gl.RENDERBUFFER);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, opt.storageType, opt.width, opt.height);

    return renderBuffer;
  }

  createFramebufferWithTexture(gl, options) {
    const opt = Object.assign({
      width: 0,
      height: 0,
      // All texture params
      bindToTexture: false,
      textureOptions: {
        attachment: gl.COLOR_ATTACHMENT0
      },
      // All render buffer params
      bindToRenderBuffer: false,
      renderBufferOptions: {
        attachment: gl.DEPTH_ATTACHMENT
      }
    }, options.fb);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // create fb
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    // create txt
    const texture = this.createTexture(gl, options.txt);

    const texOpt = opt.textureOptions;

    // bind to texture
    gl.framebufferTexture2D(gl.FRAMEBUFFER, texOpt.attachment, gl.TEXTURE_2D, texture, 0);

    // create rb
    const rb = this.createRenderbuffer(gl, options.rb);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

    return {fb, rb, texture};
  }

  _generateTextures(gl, boundingBox, triangulation, measures) {
    const delaunayModel = this.getDelaunayModel(gl, triangulation);
    const lngDiff = Math.abs(boundingBox.maxLng - boundingBox.minLng);
    const latDiff = Math.abs(boundingBox.maxLat - boundingBox.minLat);
    const width = this.getTextureWidth();
    const height = Math.ceil(latDiff * width / lngDiff);
    const bounds = [];
    const correctAngles = (angle1, angle2, angle3) => {
      // return [angle1, angle2, angle3];
      const abs = Math.abs.bind(Math);
      const modulo = 8;
      let flip = false;
      if (abs(angle1 - angle2) > abs(angle1 - (angle2 + modulo))) {
        flip = true;
      }
      if (abs(angle1 - angle3) > abs(angle1 - (angle3 + modulo))) {
        if (flip) {
          // need to flip angle1
          angle1 -= modulo;
        } else {
          // need to flip angle3
          angle3 += modulo;
        }
      } else if (flip) {
        // need to flip angle2
        angle2 += modulo;
      }
      return [angle1, angle2, angle3];
    };
    const {fb, rb, texture} = this.createFramebufferWithTexture(gl, {
      fb: {width, height},
      rb: {width, height},
      txt: {
        data: {
          internalFormat: gl.RGBA32F,
          format: gl.RGBA,
          value: false,
          type: gl.FLOAT,
          width,
          height,
          border: 0
        }
      }
    });

    // basic gl set up
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const textures = measures.map((measure, hour) => {
      const sample = [];
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      triangulation.forEach(triplet => {
        if (!bounds[0]) {
          bounds[0] = {min: measure[triplet[0].index][0], max: measure[triplet[0].index][0]};
          bounds[1] = {min: measure[triplet[0].index][1], max: measure[triplet[0].index][1]};
          bounds[2] = {min: measure[triplet[0].index][2], max: measure[triplet[0].index][2]};
        } else {
          [0, 1, 2].forEach(index => {
            triplet.forEach(t => { // eslint-disable-line
              if (measure[t.index][index] !== 0) {
                bounds[index].min = bounds[index].min > measure[t.index][index] ?
                  measure[t.index][index] : bounds[index].min;
                bounds[index].max = bounds[index].max < measure[t.index][index] ?
                  measure[t.index][index] : bounds[index].max;
              }
            });
          });
        }

        const [angle1, angle2, angle3] = correctAngles(
          measure[triplet[0].index][0],
          measure[triplet[1].index][0],
          measure[triplet[2].index][0]
        );

        sample.push(
          angle1,
          measure[triplet[0].index][1],
          measure[triplet[0].index][2],

          angle2,
          measure[triplet[1].index][1],
          measure[triplet[1].index][2],

          angle3,
          measure[triplet[2].index][1],
          measure[triplet[2].index][2]
        );
      });

      delaunayModel.setAttributes({
        data: {
          id: 'data',
          value: new Float32Array(sample),
          bytes: Float32Array.BYTES_PER_ELEMENT * sample.length,
          size: 3,
          type: gl.FLOAT,
          isIndexed: false
        }
      });

      delaunayModel.render({
        boundingBox: [
          boundingBox.minLng, boundingBox.maxLng, boundingBox.minLat, boundingBox.maxLat
        ],
        size: [width, height]
      });

      gl.bindTexture(gl.TEXTURE_2D, texture);

      // read texture back
      const pixels = new Float32Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, pixels, 0);

      // let imageData = new Uint8ClampedArray(width * height * 4);
      // for (let i = 0; i < pixels.length; i+=4) {
      //   imageData[i] = Math.abs(Math.floor(pixels[i]));
      //   imageData[i+1] = Math.abs(Math.floor(pixels[i+1]));
      //   imageData[i+2] = Math.abs(Math.floor(pixels[i+2]));
      //   imageData[i+3] = 255;
      // }
      // let id = new ImageData(imageData, width, height);
      // createImageBitmap(id).then((ib) => {
      //   let canvas = document.createElement('canvas');
      //   canvas.width = width;
      //   canvas.height = height;
      //   canvas.getContext('2d').drawImage(ib, 0, 0);
      //   canvas.style.position = 'absolute';
      //   canvas.style.zIndex = '100000';
      //   document.body.appendChild(canvas);
      // });

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return pixels;
    });

    return {fb, rb, texture, bounds, textures, width, height};
  }
}
