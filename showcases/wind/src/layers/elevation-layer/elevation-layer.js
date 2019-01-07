import {Layer} from 'deck.gl';
import GL from '@luma.gl/constants';
import {Model, loadTextures} from 'luma.gl';

import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../../defaults';
import GridGeometry from './grid-geometry';

import vertex from './elevation-layer-vertex.glsl';
import fragment from './elevation-layer-fragment.glsl';

const defaultProps = {
  boundingBox: null, // : {minLng, minLat, maxLng, maxLat}, lngResolution, latResolution}
  lngResolution: 100,
  latResolution: 100,
  zScale: 1
};

export default class ElevationLayer extends Layer {
  getShaders() {
    return {
      vs: vertex,
      fs: fragment,
      modules: ['lighting'],
      shaderCache: this.context.shaderCache
    };
  }

  initializeState() {
    const {gl} = this.context;

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
      this.setState({data: textures[0]});
    });

    const model = this.getModel(gl);
    this.setState({model});

    model.setUniforms({
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE
    });
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.propsChanged) {
      const {boundingBox, lngResolution, latResolution} = props;

      const propsChanged =
        boundingBox !== oldProps.boundingBox ||
        lngResolution !== oldProps.lngResolution ||
        latResolution !== oldProps.latResolution;

      if (propsChanged) {
        this.setState({
          vertexCount: lngResolution * latResolution
        });
        this.state.attributeManager.invalidateAll();
      }
    }
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const {zScale} = this.props;
    const {data, model} = this.state;

    if (!data || !model) {
      return;
    }

    const parameters = {
      depthTest: true,
      depthFunc: gl.LEQUAL,
      blend: true,
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
      blendEquation: gl.FUNC_ADD
    };

    uniforms = Object.assign({}, uniforms, {
      elevationTexture: data,
      zScale
    });

    model.draw({uniforms, parameters});
  }

  getModel(gl) {
    const shaders = this.getShaders();
    // 3d surface
    const vsShader = shaders.vs;
    const fsSource = shaders.fs;

    const fsShader = `\
precision highp float;
${fsSource}`;

    const {lngResolution, latResolution, boundingBox} = this.props;

    const geometry = new GridGeometry({
      xResolution: lngResolution,
      yResolution: latResolution,
      boundingBox
    });

    return new Model(gl, {
      id: this.props.id,
      vs: vsShader,
      fs: fsShader,
      geometry,
      // FIXME - isIndexed should be set in "GridGeometry"
      isIndexed: true,
      modules: ['lighting']
    });
  }
}

ElevationLayer.layerName = 'ElevationLayer';
ElevationLayer.defaultProps = defaultProps;
