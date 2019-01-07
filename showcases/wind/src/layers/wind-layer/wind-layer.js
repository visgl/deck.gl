import {Layer} from 'deck.gl';
import GL from '@luma.gl/constants';
import {Model, Geometry, loadTextures, Texture2D} from 'luma.gl';

import {
  ELEVATION_DATA_IMAGE,
  ELEVATION_DATA_BOUNDS,
  ELEVATION_RANGE,
  LIGHT_UNIFORMS
} from '../../defaults';

import vertex from './wind-layer-vertex';
import fragment from './wind-layer-fragment';

import fslighting from '../../shaderlib/fs-lighting/fs-lighting';

const defaultProps = {
  bbox: null,
  dataBounds: null,
  dataTextureArray: null,
  dataTextureSize: null,
  time: 0
};

export default class WindLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    const {dataTextureSize, bbox} = this.props;

    loadTextures(gl, {
      urls: [ELEVATION_DATA_IMAGE],
      // TODO open bug for this, refine the loadTextures interface
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

    const model = this.getModel({gl, bbox, nx: 100, ny: 30});

    const {width, height} = dataTextureSize;
    const textureFrom = this.createTexture(gl, {});
    const textureTo = this.createTexture(gl, {});

    this.setState({
      model,
      textureFrom,
      textureTo,
      width,
      height
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
    // Return early if elevationTexture is not loaded.
    if (!this.state.elevationTexture) {
      return;
    }

    const {gl} = this.context;

    const {
      model,
      elevationTexture,
      textureFrom,
      textureTo,
      width,
      height,
      delta,
      timeInterval
    } = this.state;

    const {bbox, dataBounds, dataTextureArray} = this.props;
    const pixelStoreParameters = {
      [GL.UNPACK_FLIP_Y_WEBGL]: true
    };

    textureFrom.setImageData({
      pixels: dataTextureArray[timeInterval | 0],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    textureTo.setImageData({
      pixels: dataTextureArray[timeInterval | (0 + 1)],
      width,
      height,
      format: gl.RGBA32F,
      type: gl.FLOAT,
      dataFormat: gl.RGBA,
      parameters: pixelStoreParameters
    });

    const parameters = {
      clearDepth: 1.0,
      depthTest: true,
      depthFunc: gl.LEQUAL
    };

    uniforms = Object.assign({}, uniforms, LIGHT_UNIFORMS, {
      bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
      size: [width, height],
      delta,
      bounds0: [dataBounds[0].min, dataBounds[0].max],
      bounds1: [dataBounds[1].min, dataBounds[1].max],
      bounds2: [dataBounds[2].min, dataBounds[2].max],
      dataFrom: textureFrom,
      dataTo: textureTo,
      elevationTexture,
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE
    });

    model.draw({uniforms, parameters});

    // onAfterRender
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  /* eslint-enable max-statements */

  getModel({gl, bbox, nx, ny}) {
    // This will be a grid of elements
    this.state.numInstances = nx * ny;

    const positions = this.calculatePositions({nx, ny, bbox});
    const vertices = new Float32Array([0.3, 0, 250, 0, 0.1, 0, 1, 0, 0, 0, -0.1, 0, 0, 0.1, 0]);
    const normals = new Float32Array([0, 0, 1, 0, 0.1, 0, 1, 0, 0, 0, -0.1, 0, 0, 0.1, 0]);

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

    return new Model(gl, {
      vs: vertex,
      fs: fragment,
      modules: [fslighting],
      isIndexed: false,
      isInstanced: true,
      geometry
    });
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

  calculatePositions({nx, ny, bbox}) {
    const diffX = bbox.maxLng - bbox.minLng;
    const diffY = bbox.maxLat - bbox.minLat;
    const spanX = diffX / (nx - 1);
    const spanY = diffY / (ny - 1);

    const positions = new Float32Array(nx * ny * 3);

    // build lines for the vector field
    for (let i = 0; i < nx; ++i) {
      for (let j = 0; j < ny; ++j) {
        const index = (i + j * nx) * 3;
        positions[index + 0] = i * spanX + bbox.minLng + (j % 2 ? spanX / 2 : 0);
        positions[index + 1] = j * spanY + bbox.minLat;
        positions[index + 2] = 0;
      }
    }

    return positions;
  }
}

WindLayer.layerName = 'WindLayer';
WindLayer.defaultProps = defaultProps;
