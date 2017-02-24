import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Program} from 'luma.gl';
import {join} from 'path';
import vertex from './wind-layer-vertex.js';
import fragment from './wind-layer-fragment.js';
import DelaunayInterpolation from './delaunay-interpolation.js'
import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../defaults';


export default class WindLayer extends Layer {

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
    const {bbox, texData, time, originalBBox} = this.props;
    const data = {};
    
    const image = new Image(584, 253);
    image.onload = () => {
      data.img = image;
    };
    image.src = ELEVATION_DATA_IMAGE;

    const model = this.getModel(gl, bbox, originalBBox, 80, 30, texData);

    this.setState({model, texData, data});
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

  getNumInstances() {
    return this.state.numInstances;
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
        diffX = originalBBox.maxLng - originalBBox.minLng,
        diffY = originalBBox.maxLat - originalBBox.minLat,
        spanX = diffX / (nx - 1),
        spanY = diffY / (ny - 1),
        positions = new Float32Array(nx * ny * 3),
        instances = nx * ny,
        timeInt = 0,
        delta = 0,
        state = this.state,
        props = this.props;

    this.state.numInstances = instances;
    // build lines for the vector field
    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        let index = (i + j * nx) * 3;
        positions[index + 0] = i * spanX + originalBBox.minLng + ((j % 2)? spanX / 2 : 0);
        positions[index + 1] = j * spanY + originalBBox.minLat;
        positions[index + 2] = 0;
      }
    }

    const model = new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: vertex,
        fs: fragment
      })),
      isIndexed: false,
      isInstanced: true,
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'TRIANGLE_FAN',
        isInstanced: true,
        instanceCount: 1,
        attributes: {
          positions: {
            value: positions,
            instanced: 1,
            type: gl.FLOAT,
            size: 3
          },
          vertices: {
            value: new Float32Array([0.3, 0, 250, 0, 0.10, 0, 1, 0, 0, 0, -0.10, 0, 0, 0.10, 0]),
            size: 3,
            type: gl.FLOAT
          },
          normals: {
            value: new Float32Array([0, 0, 1, 0, 0.10, 0, 1, 0, 0, 0, -0.10, 0, 0, 0.10, 0]),
            size: 3,
            type: gl.FLOAT
          }
        }
      }),
      onBeforeRender: () => {
        // console.log(
        //   model.props && model.props.timeInt || timeInt,
        //   (model.props && model.props.timeInt || timeInt) + 1,
        //   (model.props && model.props.delta || delta)
        // );
//        console.log(textureArray[(model.props && model.props.timeInt || timeInt) + 1]);

        model.program.setUniforms({
          bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
          size: [width, height],
          delta: (model.props && model.props.delta || delta),
          bounds0: [dataBounds[0].min, dataBounds[0].max],
          bounds1: [dataBounds[1].min, dataBounds[1].max],
          bounds2: [dataBounds[2].min, dataBounds[2].max],
          lightsPosition: [-70.585, 38.00, 15000],
          ambientRatio: 0.9,
          diffuseRatio: 0.8,
          specularRatio: 0.9,
          lightsStrength: [1.0, 0.0],
          numberOfLights: 2,
          dataFrom: 0,
          dataTo: 1,
          elevationTexture: 2,
          elevationBounds: ELEVATION_DATA_BOUNDS,
          elevationRange: ELEVATION_RANGE
        });

        // upload texture (data) before rendering
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_2D, textureFrom);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureFrom);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
          textureArray[(model.props && model.props.timeInt || timeInt)], 0);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureTo);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT,
         textureArray[(model.props && model.props.timeInt || timeInt) + 1], 0);

        if (state.data && state.data.img) {
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, elevationWidth, elevationHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, state.data.img);
        }

        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
      },
      onAfterRender: () => {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    });

    return model;
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    const {time} = this.props;
    const timeInt = Math.floor(time);
    const delta = time - timeInt;
    this.state.model.props = {
      timeInt,
      delta
    };
    // this.setUniforms({
    //   delta
    // });
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