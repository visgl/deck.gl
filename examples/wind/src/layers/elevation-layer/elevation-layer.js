import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, loadTextures} from 'luma.gl';

import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../../defaults';
import GridGeometry from './grid-geometry';

import vertex from './elevation-layer-vertex.glsl';
import fragment from './elevation-layer-fragment.glsl';

const LIGHT_UNIFORMS = {
  lightsPosition: [-60, 25, 15000, -140, 0, 400000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [1.0, 2.0],
  numberOfLights: 2
};

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
      fs: fragment
    };
  }

  initializeState() {
    const {gl} = this.context;

    const data = {};
    loadTextures(gl, {
      urls: [ELEVATION_DATA_IMAGE],
      parameters: {
        magFilter: GL.LINEAR
      }
    })
    .then(([texture]) => {
      data.texture = texture;
    });

    this.setState({
      model: this.getModel(gl),
      data
    });

    this.setUniforms({
      ...LIGHT_UNIFORMS,
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
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);

    const {data, model} = this.state;

    if (data.texture) {
      model.render(Object.assign({}, uniforms, {
        elevationTexture: data.texture,
        zScale: this.props.zScale || 1
      })
      /* FIXME - Use the coming settings feature in luma.gl
      settings: {
        depthFunc: GL.LEQUAL,
        blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA)],
        blendEquation: GL.FUNC_ADD
      }
      */
      );
    }

    gl.disable(gl.DEPTH_TEST);
  }

  getModel(gl) {
    const shaders = this.getShaders();
    // 3d surface
    const vsShader = assembleShaders(gl, {vs: shaders.vs, fs: ''}).vs;

    // FIXME - assembleShaders doesn't support fragment shaders
    const fsSource = assembleShaders(gl, {
      vs: shaders.fs,
      fs: '',
      modules: ['lighting']
    }).vs;

    const fsShader = `\
#ifdef GL_ES
precision highp float;
#endif
${fsSource}`;

    const {lngResolution, latResolution, boundingBox} = this.props;

    const geometry = new GridGeometry({
      xResolution: lngResolution,
      yResolution: latResolution,
      boundingBox
    });

    return new Model({
      gl,
      id: this.props.id,
      vs: vsShader,
      fs: fsShader,
      geometry,
      // FIXME - isIndexed should be set in "GridGeometry"
      isIndexed: true
    });
  }
}

ElevationLayer.layerName = 'ElevationLayer';
ElevationLayer.defaultProps = defaultProps;
