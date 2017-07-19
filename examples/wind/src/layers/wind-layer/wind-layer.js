/* global Image */
import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Program} from 'luma.gl';

import DelaunayInterpolation from '../delaunay-interpolation/delaunay-interpolation';
import {
  ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE, LIGHT_UNIFORMS
} from '../../defaults';

import vertex from './wind-layer-vertex';
import fragment from './wind-layer-fragment';

const defaultProps = {
  boundingBox: null,
  originalBoundingBox: null,
  dataBounds: null,
  dataTextureArray: null,
  dataTextureSize: null,
  time: 0
};

export default class WindLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {dataTextureSize, originalBoundingBox} = this.props;

    // FIXME - Layer API for async loading
    const data = {};
    const image = new Image(584, 253);
    image.onload = () => {
      data.img = image;
    };
    image.src = ELEVATION_DATA_IMAGE;

    const model = this.getModel({gl, originalBoundingBox, nx: 80, ny: 30});

    const elevationWidth = 584;
    const elevationHeight = 253;
    const elevationTexture = this.createTexture(gl, {
      width: elevationWidth,
      height: elevationHeight,
      parameters: [
        {name: gl.TEXTURE_MAG_FILTER, value: gl.LINEAR},
        {name: gl.TEXTURE_MIN_FILTER, value: gl.LINEAR},
        {name: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE},
        {name: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE}
      ]
    });

    const {width, height} = dataTextureSize;
    const textureFrom = this.createTexture(gl, {width, height});
    const textureTo = this.createTexture(gl, {width, height});

    this.setState({
      model, data,
      elevationTexture, elevationWidth, elevationHeight,
      textureFrom, textureTo, width, height
    });
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    this.updateTime();
  }

  updateTime() {
    const {time} = this.props;
    const timeInterval = Math.floor(time);
    this.setState({
      timeInterval,
      delta: time - timeInterval
    });
  }

  getNumInstances() {
    return this.state.numInstances;
  }

  /* eslint-disable max-statements */
  draw({uniforms}) {
    const {gl} = this.context;

    const {
      model, data,
      elevationTexture, elevationWidth, elevationHeight,
      textureFrom, textureTo, width, height,
      delta, timeInterval
    } = this.state;

    const {boundingBox, dataBounds, dataTextureArray} = this.props;

    // upload texture (data) before rendering
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFrom);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height,
      0, gl.RGBA, gl.FLOAT,
      dataTextureArray[timeInterval | 0], 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureTo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height,
      0, gl.RGBA, gl.FLOAT,
      dataTextureArray[timeInterval | 0 + 1], 0);

    if (data && data.img) {
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, elevationTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, elevationWidth, elevationHeight,
        0, gl.RGBA, gl.UNSIGNED_BYTE, data.img);
    }

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    model.render(Object.assign({}, uniforms, LIGHT_UNIFORMS, {
      boundingBox: [boundingBox.minLng, boundingBox.maxLng, boundingBox.minLat, boundingBox.maxLat],
      size: [width, height],
      delta,
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      dataFrom: 0,
      dataTo: 1,
      elevationTexture: 2,
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE
    }));

    // onAfterRender
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  /* eslint-enable max-statements */

  getModel({gl, originalBoundingBox, nx, ny}) {
    // This will be a grid of elements
    this.state.numInstances = nx * ny;

    const positions = this.calculatePositions({nx, ny, originalBoundingBox});
    const vertices = new Float32Array([0.3, 0, 250, 0, 0.10, 0, 1, 0, 0, 0, -0.10, 0, 0, 0.10, 0]);
    const normals = new Float32Array([0, 0, 1, 0, 0.10, 0, 1, 0, 0, 0, -0.10, 0, 0, 0.10, 0]);

    const geometry = new Geometry({
      id: this.props.id,
      drawMode: GL.TRIANGLE_FAN,
      isInstanced: true,
      instanceCount: 1,
      attributes: {
        positions: {size: 3, type: gl.FLOAT, value: positions, instanced: 1},
        vertices: {size: 3, type: gl.FLOAT, value: vertices},
        normals: {size: 3, type: gl.FLOAT, value: normals}
      }
    });

    return new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: vertex,
        fs: fragment
      })),
      isIndexed: false,
      isInstanced: true,
      geometry
    });
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

  calculatePositions({nx, ny, originalBoundingBox}) {
    const diffX = originalBoundingBox.maxLng - originalBoundingBox.minLng;
    const diffY = originalBoundingBox.maxLat - originalBoundingBox.minLat;
    const spanX = diffX / (nx - 1);
    const spanY = diffY / (ny - 1);

    const positions = new Float32Array(nx * ny * 3);

    // build lines for the vector field
    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        const index = (i + j * nx) * 3;
        positions[index + 0] = i * spanX + originalBoundingBox.minLng + ((j % 2) ? spanX / 2 : 0);
        positions[index + 1] = j * spanY + originalBoundingBox.minLat;
        positions[index + 2] = 0;
      }
    }

    return positions;
  }
}

WindLayer.layerName = 'WindLayer';
WindLayer.defaultProps = defaultProps;
