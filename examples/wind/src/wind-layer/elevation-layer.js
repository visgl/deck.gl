import {Layer, assembleShaders} from 'deck.gl';

import {GL, Model, Geometry, Texture2D, loadTextures} from 'luma.gl';
import vertex from './elevation-vertex';
import fragment from './elevation-fragment';

import {ELEVATION_DATA_IMAGE, ELEVATION_DATA_BOUNDS, ELEVATION_RANGE} from '../defaults';

export default class ElevationLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;
    const noAlloc = true;

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {size: 2, update: this.calculatePositions, noAlloc}
    });
    /* eslint-enable max-len */

    gl.getExtension('OES_element_index_uint');
    const data = {};
    this.setState({
      model: this.getModel(gl),
      data
    });

    loadTextures(gl, {
      urls: [ELEVATION_DATA_IMAGE],
      parameters: {
        magFilter: GL.LINEAR
      }
    })
    .then(([texture]) => {
      data.texture = texture;
    });

    this.setUniforms({
      lightsPosition: [-60, 25, 15000, -140, 0, 400000],
      ambientRatio: 0.4,
      diffuseRatio: 0.6,
      specularRatio: 0.2,
      lightsStrength: [1.0, 2.0],
      numberOfLights: 2,
      elevationBounds: ELEVATION_DATA_BOUNDS,
      elevationRange: ELEVATION_RANGE,
    });
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.propsChanged) {
      const {bbox, lngResolution, latResolution} = props;

      if (oldProps.bbox !== bbox ||
        oldProps.lngResolution !== lngResolution ||
        oldProps.latResolution !== latResolution) {
        this.setState({
          vertexCount: lngResolution * latResolution
        });
        this.state.attributeManager.invalidateAll();
      }

    }
  }

  getModel(gl) {
    // 3d surface
    const vsShader = assembleShaders(gl, {
      vs: vertex,
      fs: ''
    }).vs;
    const fsShader = `
      #ifdef GL_ES
      precision highp float;
      #endif\n`
    + assembleShaders(gl, {
      vs: fragment,
      fs: '',
      modules: ['lighting']
    }).vs;

    return new Model({
      gl,
      id: this.props.id,
      vs: vsShader,
      fs: fsShader,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES
        // drawMode: GL.LINE_STRIP
      }),
      vertexCount: 0,
      isIndexed: true,
      onBeforeRender: () => {

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.FUNC_ADD);
      },
      onAfterRender: () => {
        gl.disable(gl.DEPTH_TEST);
      }
    })

  }

  draw({uniforms}) {
    const {data, model} = this.state;

    if (data.texture) {
      model.render(Object.assign({}, uniforms, {
        elevationTexture: data.texture,
        zScale: this.props.zScale || 1
      }));
    }
  }

  calculateIndices(attribute) {
    const {lngResolution, latResolution} = this.props;
    // # of squares = (nx - 1) * (ny - 1)
    // # of triangles = squares * 2
    // # of indices = triangles * 3
    const indicesCount = (lngResolution - 1) * (latResolution - 1) * 2 * 3;
    const indices = new Uint32Array(indicesCount);

    let i = 0;
    for (let lngIndex = 0; lngIndex < lngResolution - 1; lngIndex++) {
      for (let latIndex = 0; latIndex < latResolution - 1; latIndex++) {
        /*
         *   i0   i1
         *    +--.+---
         *    | / |
         *    +'--+---
         *    |   |
         *   i2   i3
         */
        const i0 = latIndex * lngResolution + lngIndex;
        const i1 = i0 + 1;
        const i2 = i0 + lngResolution;
        const i3 = i2 + 1;

        indices[i++] = i0;
        indices[i++] = i2;
        indices[i++] = i1;
        indices[i++] = i1;
        indices[i++] = i2;
        indices[i++] = i3;
      }
    }

    attribute.value = indices;
    this.state.model.setVertexCount(indicesCount);
  }

  // the fourth component is a flag for invalid z (NaN or Infinity)
  calculatePositions(attribute) {
    const {vertexCount} = this.state;
    const {bbox: {minLng, minLat, maxLng, maxLat}, lngResolution, latResolution} = this.props;

    // step between samples
    const deltaLng = (maxLng - minLng) / (lngResolution - 1);
    const deltaLat = (maxLat - minLat) / (latResolution - 1);

    const value = new Float32Array(vertexCount * attribute.size);

    let i = 0;
    for (let latIndex = 0; latIndex < latResolution; latIndex++) {
      for (let lngIndex = 0; lngIndex < lngResolution; lngIndex++) {
        value[i++] = lngIndex * deltaLng + minLng;
        value[i++] = latIndex * deltaLat + minLat;
      }
    }

    attribute.value = value;
  }

}

ElevationLayer.layerName = 'ElevationLayer';
