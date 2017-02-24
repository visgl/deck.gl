import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Program, Buffer, loadTextures} from 'luma.gl';
import ProgramTransformFeedback from './program-transform-feedback.js'
import {join} from 'path';
import vertex from './particle-layer-vertex.js';
import fragment from './particle-layer-fragment.js';
import vertexTF from './transform-feedback-vertex.js';
import fragmentTF from './transform-feedback-fragment.js';
import DelaunayInterpolation from './delaunay-interpolation.js'
import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../defaults';

export default class ParticleLayer extends Layer {

  /**
   * @classdesc
   * WindLayer
   *
   * @class
   * @param {object} opts
   */ 
  constructor(opts) {
    super(opts);
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;
    const {bbox, texData, originalBBox} = this.props;
    const {model, modelTF} = this.getModel(gl, bbox, originalBBox, 1200, 600, texData);
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
    //   debugger;
    //   data.texture = texture;
    // });

    this.setState({model, modelTF, texData, data});
  }

  createTexture(gl, opt) {
    let options = {
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

  getModel(gl, bbox, originalBBox, nx, ny, texData) {
    // This will be a grid of elements
    let {dataBounds, textureArray, textureSize} = texData,
        {width, height} = textureSize,
        textureFrom = this.createTexture(gl, {width, height}),
        textureTo = this.createTexture(gl, {width, height}),
        elevationWidth = 584,
        elevationHeight = 253,
        elevationTexture = this.createTexture(gl, {
          width: elevationWidth,
          height: elevationHeight,
          type: gl.RGBA,
          internalFormat: gl.RGBA,
          parameters: [{
            name: gl.TEXTURE_MAG_FILTER,
            value: gl.LINEAR
          }, {
            name: gl.TEXTURE_MIN_FILTER,
            value: gl.LINEAR
          }, {
            name: gl.TEXTURE_WRAP_S,
            value: gl.CLAMP_TO_EDGE
          }, {
            name: gl.TEXTURE_WRAP_T,
            value: gl.CLAMP_TO_EDGE
          }]
        }),
        diffX = bbox.maxLng - bbox.minLng,
        diffY = bbox.maxLat - bbox.minLat,
        spanX = diffX / (nx - 1),
        spanY = diffY / (ny - 1),
        dim = nx * ny,
        dim3 = dim * 3,
        dim4 = dim * 4,
        positions3 = new Float32Array(dim3),
        positions4 = new Float32Array(dim4),
        tf = gl.createTransformFeedback(),
        timeInt = 0,
        delta = 0,
        state = this.state,
        props = this.props;

    this.state.numInstances = dim;

    // set points
    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        let index4 = (i + j * nx) * 4;
        let index3 = (i + j * nx) * 3;
        positions3[index3 + 0] = 0;
        positions3[index3 + 1] = 0;
        positions3[index3 + 2] = Math.random() * nx;

        positions4[index4 + 0] = i * spanX + bbox.minLng;
        positions4[index4 + 1] = j * spanY + bbox.minLat;
        positions4[index4 + 2] = -1;
        positions4[index4 + 3] = -1;
      }
    }

    let bufferFrom = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
    gl.bufferData(gl.ARRAY_BUFFER, positions4, gl.DYNAMIC_COPY);

    let bufferTo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTo);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * positions4.length, gl.DYNAMIC_COPY);
    
    let bufferSwap;
    let now = Date.now();
    let counter = 0;

    const modelTF = new Model({
        program: new ProgramTransformFeedback(gl, assembleShaders(gl, {
        vs: vertexTF,
        fs: fragmentTF
      })),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'POINTS',
        isInstanced: false,
        attributes: {
          positions: {
            value: positions3,
            type: gl.FLOAT,
            size: 3
          }
        }
      }),
      isIndexed: false,
      isInstanced: false,
      onBeforeRender: () => {
        let time = Date.now() - now;
        let flip = time > 500 ? 1 : -1;
        if (flip > 0) {
          //counter = (counter + 1) % nx;
          counter = (counter + 1) % 10;
          flip = counter;
          // console.log(flip);
        }
        // set uniforms
        modelTF.program.setUniforms({
          bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
          originalBBox: [originalBBox.minLng, originalBBox.maxLng, originalBBox.minLat, originalBBox.maxLat],
          bounds0: [dataBounds[0].min, dataBounds[0].max],
          bounds1: [dataBounds[1].min, dataBounds[1].max],
          bounds2: [dataBounds[2].min, dataBounds[2].max],
          dataFrom: 0,
          dataTo: 1,
          time: time,
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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, textureArray[model.props && model.props.timeInt || timeInt], 0);
        
        // gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, textureArray[(model.props && model.props.timeInt || timeInt) + 1], 0);
        // setup transform feedback
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        let loc = model.program._attributeLocations['posFrom'];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferFrom);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, gl.FALSE, 0, 0);
        gl.vertexAttribDivisor(loc, 0);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufferTo);
        gl.beginTransformFeedback(gl.POINTS);
      },
      onAfterRender: () => {
        gl.endTransformFeedback();
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
      }
    });

    const model = new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: vertex,
        fs: fragment
      })),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'POINTS',
        // instanceCount: 1,
        // isInstanced: true,
        attributes: {
          positions: {
            value: positions3,
            // instanced: 1,
            type: gl.FLOAT,
            size: 3
          },
          vertices: {
            value: positions3,//new Float32Array([1, 1, 1]),
            size: 3,
            type: gl.FLOAT
          }
        }
      }),
      isIndexed: false,
      // isInstanced: true,
      onBeforeRender: () => {
        modelTF.render();
        model.setProgramState();
        model.program.setUniforms({
          bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
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

        // upload texture (data) before rendering
        gl.bindTexture(gl.TEXTURE_2D, textureFrom);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureFrom);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, textureArray[model.props && model.props.timeInt || timeInt], 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, textureArray[(model.props && model.props.timeInt || timeInt) + 1], 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        if (state.data && state.data.img) {
          gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, elevationWidth, elevationHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, state.data.img);
        }

        let loc = model.program._attributeLocations['posFrom'];
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferTo);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, gl.FALSE, 0, 0);
        gl.vertexAttribDivisor(loc, 0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
      },
      onAfterRender: () => {
        // let loc = model.program._attributeLocations['posFrom'];
        // gl.bindBuffer(gl.ARRAY_BUFFER, bufferTo);
        // gl.vertexAttribDivisor(loc, 0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // swap buffers
        bufferSwap = bufferFrom;
        bufferFrom = bufferTo;
        bufferTo = bufferSwap;
      }
    });

    return {model, modelTF};
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    const {time} = this.props;
    const timeInt = Math.floor(time);
    const delta = time - timeInt;
    this.state.model.props = {
      timeInt,
      delta
    };
    this.state.modelTF.props = {
      timeInt,
      delta
    };
    this.setUniforms({
      delta
    });
  }

  getNumInstances() {
    return this.state.numInstances;
  }

  countVertices(data) {
  }

  updateUniforms() {
  }

  calculateIndices(attribute) {
  }

  calculatePositions(attribute) {
  }

  calculateColors(attribute) {
  }
}