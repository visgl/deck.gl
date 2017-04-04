/* global Image */
import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Program} from 'luma.gl';
import ProgramTransformFeedback from './program-transform-feedback';

import DelaunayInterpolation from '../delaunay-interpolation/delaunay-interpolation';
import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../../defaults';

import vertex from './particle-layer-vertex.glsl';
import fragment from './particle-layer-fragment.glsl';
import vertexTF from './transform-feedback-vertex.glsl';
import fragmentTF from './transform-feedback-fragment.glsl';

const defaultProps = {
  boundingBox: null,
  originalBoundingBox: null,
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
    const {boundingBox, texData, originalBoundingBox} = this.props;

    const data = {};
    const image = new Image(584, 253);
    image.onload = () => {
      data.img = image;
    };
    image.src = ELEVATION_DATA_IMAGE;

    // loadTextures(gl, {
    //   urls: [ELEVATION_DATA_IMAGE],
    //   parameters: {
    //     magFilter: GL.LINEAR
    //   }
    // })
    // .then(([texture]) => {
    //   data.texture = texture;
    // });

    const elevationWidth = 584;
    const elevationHeight = 253;

    const elevationTexture = this.createTexture(gl, {
      width: elevationWidth,
      height: elevationHeight,
      type: gl.UNSIGNED_BYTE,
      internalFormat: gl.RGBA,
      parameters: [
        {name: gl.TEXTURE_MAG_FILTER, value: gl.LINEAR},
        {name: gl.TEXTURE_MIN_FILTER, value: gl.LINEAR},
        {name: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE},
        {name: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE}
      ]
    });

    const {textureSize} = this.props.texData;
    const {width, height} = textureSize;
    const textureFrom = this.createTexture(gl, {width, height});
    const textureTo = this.createTexture(gl, {width, height});

    const model = this.getModel({
      gl, boundingBox, originalBoundingBox, nx: 1200, ny: 600, texData
    });

    this.setupTransformFeedback({gl, boundingBox, nx: 1200, ny: 600});

    const modelTF = this.getModelTF({
      gl, boundingBox, originalBoundingBox, nx: 1200, ny: 600, texData
    });

    this.setState({
      model,
      modelTF,
      texData,
      data,
      elevationWidth,
      elevationHeight,
      elevationTexture,
      textureFrom,
      textureTo,
      width,
      height
    });
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
    const {gl} = this.context;

    const state = this.state;
    const props = this.props;
    const {boundingBox, texData} = this.props;
    const {dataBounds} = texData;

    this.runTransformFeedback({gl});

    const {model} = this.state;
    model.setUniforms({
      boundingBox: [boundingBox.minLng, boundingBox.maxLng, boundingBox.minLat, boundingBox.maxLat],
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      color0: [83, 185, 148].map(d => d / 255),
      color1: [255, 255, 174].map(d => d / 255),
      color2: [241, 85, 46].map(d => d / 255),
      dataFrom: 0,
      dataTo: 1,
      elevationTexture: 2,
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE,
      zScale: props.zScale
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendEquation(gl.MAX);

    const {textureArray} = texData;
    const {
      textureFrom, textureTo, width, height,
      elevationTexture, elevationWidth, elevationHeight,
      bufferTo, bufferFrom,
      timeInterval
    } = this.state;

    // upload texture (data) before rendering
    gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
      textureArray[timeInterval], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
      textureArray[timeInterval + 1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (state.data && state.data.img) {
      gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, elevationWidth, elevationHeight,
        0, gl.RGBA, gl.UNSIGNED_BYTE, state.data.img);
    }

    const loc = model.program._attributeLocations.posFrom;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, 0 /* gl.FALSE */, 0, 0);
    gl.vertexAttribDivisor(loc, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.state.model.render(Object.assign({}, uniforms, {}));

    // Swap the buffers
    this.setState({
      bufferFrom: bufferTo,
      bufferTo: bufferFrom
    });
  }

  setupTransformFeedback({gl, boundingBox, nx, ny}) {
    const positions4 = this.calculatePositions4({boundingBox, nx, ny});

    const bufferFrom = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
    gl.bufferData(gl.ARRAY_BUFFER, positions4, gl.DYNAMIC_COPY);

    const bufferTo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTo);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * positions4.length, gl.DYNAMIC_COPY);

    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    this.setState({
      counter: 0,
      bufferFrom,
      bufferTo,
      transformFeedback
    });
  }

  runTransformFeedback({gl}) {
    // Run transform feedback
    const {modelTF, textureFrom, textureTo} = this.state;

    const {boundingBox, originalBoundingBox} = this.props;
    const {dataBounds, textureArray, textureSize} = this.props.texData;
    const {width, height} = textureSize;
    const timeInterval = 0;

    let now = Date.now();

    const {bufferFrom, bufferTo} = this.state;
    let {counter} = this.state;

    // onBeforeRender
    const time = Date.now() - now;
    let flip = time > 500 ? 1 : -1;
    if (flip > 0) {
      counter = (counter + 1) % 10;
      flip = counter;
    }

    // set uniforms
    modelTF.setUniforms({
      boundingBox: [
        boundingBox.minLng, boundingBox.maxLng,
        boundingBox.minLat, boundingBox.maxLat
      ],
      originalBoundingBox: [
        originalBoundingBox.minLng, originalBoundingBox.maxLng,
        originalBoundingBox.minLat, originalBoundingBox.maxLat
      ],
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      dataFrom: 0,
      dataTo: 1,
      time,
      flip
    });

    if (flip > 0) {
      flip = -1;
      now = Date.now();
    }

    // upload texture (data) before rendering
    // gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
      textureArray[timeInterval], 0);

    // gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
      textureArray[timeInterval + 1], 0);

    // setup transform feedback
    gl.enable(gl.RASTERIZER_DISCARD);

    modelTF.program.use();
    const {transformFeedback} = this.state;
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    const loc = modelTF.program._attributeLocations.posFrom;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, 0 /* gl.FALSE */, 0, 0);
    gl.vertexAttribDivisor(loc, 0);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferTo);
    gl.beginTransformFeedback(gl.POINTS);

    modelTF.render(
      /*
      settings: {
        [GL.RASTERIZER_DISCARD]: true
      }
      */
    );

    gl.endTransformFeedback();
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.disable(gl.RASTERIZER_DISCARD);

    this.setState({
      counter
    });
  }
  /* eslint-enable max-statements */

  getModelTF({gl, boundingBox, originalBoundingBox, nx, ny, texData}) {
    const positions3 = this.calculatePositions3({nx, ny});

    const modelTF = new Model({
      program: new ProgramTransformFeedback(gl, assembleShaders(gl, {
        vs: vertexTF,
        fs: fragmentTF
      })),
      geometry: new Geometry({
        id: this.props.id,
        // FIXME - change to GL.POINTS when luma assert is fixed
        drawMode: 'POINTS',
        isInstanced: false,
        attributes: {
          positions: {size: 3, type: gl.FLOAT, value: positions3}
        }
      }),
      isIndexed: false,
      isInstanced: false
    });

    return modelTF;
  }

  getModel({gl, nx, ny, texData}) {
    // This will be a grid of elements
    this.state.numInstances = nx * ny;

    const positions3 = this.calculatePositions3({nx, ny});

    return new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: vertex,
        fs: fragment
      })),
      geometry: new Geometry({
        id: this.props.id,
        // FIXME - Update to GL.POINTS once assert in luma has been fixed
        drawMode: 'POINTS',
        attributes: {
          positions: {size: 3, type: GL.FLOAT, value: positions3},
          vertices: {size: 3, type: GL.FLOAT, value: positions3}
        }
      }),
      isIndexed: false
    });
  }

  getNumInstances() {
    return this.state.numInstances;
  }

  createTexture(gl, opt) {
    const options = {
      data: {
        format: gl.RGBA,
        value: false,
        type: opt.type || gl.FLOAT,
        internalFormat: opt.internalFormat || gl.RGBA32F,
        width: opt.width,
        height: opt.height,
        border: 0
      }
    };

    if (opt.parameters) {
      options.parameters = opt.parameters;
    }

    return new DelaunayInterpolation({gl})
      .createTexture(gl, options);
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

  calculatePositions4({boundingBox, nx, ny}) {
    const diffX = boundingBox.maxLng - boundingBox.minLng;
    const diffY = boundingBox.maxLat - boundingBox.minLat;
    const spanX = diffX / (nx - 1);
    const spanY = diffY / (ny - 1);

    const positions4 = new Float32Array(nx * ny * 4);

    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        const index4 = (i + j * nx) * 4;
        positions4[index4 + 0] = i * spanX + boundingBox.minLng;
        positions4[index4 + 1] = j * spanY + boundingBox.minLat;
        positions4[index4 + 2] = -1;
        positions4[index4 + 3] = -1;
      }
    }

    return positions4;
  }
}

ParticleLayer.layerName = 'ParticleLayer';
ParticleLayer.defaultProps = defaultProps;
