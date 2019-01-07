/* global window */
import {Layer} from 'deck.gl';
import GL from '@luma.gl/constants';
import {Model, Geometry, Buffer, setParameters, loadTextures, Texture2D} from 'luma.gl';
import {Transform} from 'luma.gl';

import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../../defaults';

import vertex from './particle-layer-vertex.glsl';
import fragment from './particle-layer-fragment.glsl';
import vertexTF from './transform-feedback-vertex.glsl';

const defaultProps = {
  bbox: null,
  texData: null,
  zScale: 1,
  time: 0
};

export default class ParticleLayer extends Layer {
  getShaders() {
    return {
      vs: vertex,
      fs: fragment
    };
  }

  initializeState() {
    const {gl} = this.context;
    const {bbox, texData} = this.props;

    loadTextures(gl, {
      urls: [ELEVATION_DATA_IMAGE],
      parameters: {
        parameters: {
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
        }
      }
    }).then(textures => {
      this.setState({elevationTexture: textures[0]});
    });

    const {textureSize} = this.props.texData;
    const {width, height} = textureSize;
    const textureFrom = this.createTexture(gl, {});
    const textureTo = this.createTexture(gl, {});

    const model = this.getModel({
      gl,
      bbox,
      nx: 1200,
      ny: 600,
      texData
    });

    this.setupTransformFeedback({gl, bbox, nx: 1200, ny: 600});

    this.setState({
      model,
      texData,
      textureFrom,
      textureTo,
      width,
      height
    });
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    const {time} = this.props;
    const timeInterval = Math.floor(time);
    const delta = time - timeInterval;
    this.setState({
      timeInterval,
      delta
    });
  }

  /* eslint-disable max-statements */
  draw({uniforms}) {
    // Return early if elevationTexture is not loaded.
    if (!this.state.elevationTexture) {
      return;
    }
    const {gl} = this.context;

    const props = this.props;
    const {bbox, texData} = this.props;
    const {dataBounds} = texData;

    this.runTransformFeedback({gl});

    const {model, textureFrom, textureTo, delta} = this.state;
    const {textureArray} = texData;
    const {width, height, elevationTexture, bufferTo, bufferFrom, timeInterval} = this.state;

    const currentUniforms = {
      bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      color0: [83, 185, 148].map(d => d / 255),
      color1: [255, 255, 174].map(d => d / 255),
      color2: [241, 85, 46].map(d => d / 255),
      dataFrom: textureFrom,
      dataTo: textureTo,
      elevationTexture,
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE,
      zScale: props.zScale,
      delta,
      pixelRatio: window.devicePixelRatio || 1
    };

    setParameters(gl, {
      blend: true,
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
      depthTest: true,
      depthFunc: gl.LEQUAL
    });
    const pixelStoreParameters = {
      [GL.UNPACK_FLIP_Y_WEBGL]: true
    };

    textureFrom.setImageData({
      pixels: textureArray[timeInterval],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    textureTo.setImageData({
      pixels: textureArray[timeInterval + 1],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    bufferTo.setAccessor(Object.assign({}, bufferTo.accessor, {divisor: 1}));
    model.setAttributes({
      posFrom: bufferTo
    });

    model.render(Object.assign({}, currentUniforms, uniforms));

    // Swap the buffers
    this.setState({
      bufferFrom: bufferTo,
      bufferTo: bufferFrom
    });
  }

  setupTransformFeedback({gl, bbox, nx, ny}) {
    const positions4 = this.calculatePositions4({bbox, nx, ny});

    const bufferFrom = new Buffer(gl, {
      size: 4,
      data: positions4,
      usage: gl.DYNAMIC_COPY
    });

    const bufferTo = new Buffer(gl, {
      size: 4,
      bytes: 4 * positions4.length,
      usage: gl.DYNAMIC_COPY
    });

    const transform = new Transform(gl, {
      vs: vertexTF,
      varyings: ['gl_Position'],
      elementCount: positions4.length / 4,
      sourceBuffers: {posFrom: bufferFrom},
      feedbackBuffers: {gl_Position: bufferTo},
      feedbackMap: {posFrom: 'gl_Position'}
    });

    this.setState({
      counter: 0,
      now: Date.now(),
      bufferFrom,
      bufferTo,
      transform
    });
  }

  runTransformFeedback({gl}) {
    // Run transform feedback
    const {textureFrom, textureTo, delta, timeInterval, transform} = this.state;

    const {bbox} = this.props;

    const {dataBounds, textureArray, textureSize} = this.props.texData;
    const {width, height} = textureSize;

    const {bufferFrom, bufferTo, now} = this.state;
    let {counter} = this.state;

    // onBeforeRender
    const time = Date.now() - now;
    let flip = time > 500 ? 1 : -1;
    if (flip > 0) {
      counter = (counter + 1) % 10;
      flip = counter;
    }

    const pixelStoreParameters = {
      [GL.UNPACK_FLIP_Y_WEBGL]: true
    };

    textureFrom.setImageData({
      pixels: textureArray[timeInterval],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    textureTo.setImageData({
      pixels: textureArray[timeInterval + 1],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    const uniforms = {
      bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      dataFrom: textureFrom,
      dataTo: textureTo,
      time,
      flip,
      delta // TODO: looks to be 0 always , verify.
    };

    bufferFrom.setAccessor(Object.assign({}, bufferFrom.accessor, {divisor: 0}));
    bufferTo.setAccessor(Object.assign({}, bufferTo.accessor, {divisor: 0}));

    transform.run({uniforms});
    transform.swapBuffers();

    if (flip > 0) {
      flip = -1;
      this.setState({
        now: Date.now()
      });
    }
    this.setState({
      counter
    });
  }
  /* eslint-enable max-statements */

  getModel({gl, nx, ny, texData}) {
    // This will be a grid of elements
    this.state.numInstances = nx * ny;

    const positions3 = new Float32Array([0, 0, 0]);

    return new Model(gl, {
      id: 'ParticleLayer-model',
      vs: vertex,
      fs: fragment,
      geometry: new Geometry({
        id: this.props.id,
        drawMode: GL.POINTS,
        vertexCount: 1,
        attributes: {
          positions: {size: 3, type: GL.FLOAT, value: positions3, instanced: 0}
        }
      }),
      isInstanced: true,
      instanceCount: this.state.numInstances,
      isIndexed: false
    });
  }

  getNumInstances() {
    return this.state.numInstances;
  }

  createTexture(gl, opt) {
    const textureOptions = Object.assign(
      {
        format: gl.RGBA32F,
        dataFormat: gl.RGBA,
        type: gl.FLOAT,
        parameters: {
          [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
          [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
          [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
          [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
        },
        pixelStore: {[gl.UNPACK_FLIP_Y_WEBGL]: true}
      },
      opt
    );

    return new Texture2D(gl, textureOptions);
  }

  calculatePositions3({nx, ny}) {
    const positions3 = new Float32Array(nx * ny * 3);

    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        const index3 = (i + j * nx) * 3;
        positions3[index3 + 0] = 0;
        positions3[index3 + 1] = 0;
        positions3[index3 + 2] = Math.random() * nx;
      }
    }

    return positions3;
  }

  calculatePositions4({bbox, nx, ny}) {
    const diffX = bbox.maxLng - bbox.minLng;
    const diffY = bbox.maxLat - bbox.minLat;
    const spanX = diffX / (nx - 1);
    const spanY = diffY / (ny - 1);

    const positions4 = new Float32Array(nx * ny * 4);

    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        const index4 = (i + j * nx) * 4;
        positions4[index4 + 0] = i * spanX + bbox.minLng;
        positions4[index4 + 1] = j * spanY + bbox.minLat;
        positions4[index4 + 2] = -1;
        positions4[index4 + 3] = -1;
      }
    }

    return positions4;
  }
}

ParticleLayer.layerName = 'ParticleLayer';
ParticleLayer.defaultProps = defaultProps;
