import {Layer} from 'deck.gl';
import {Model, Geometry, setParameters} from 'luma.gl';

import vertex from './delaunay-cover-layer-vertex.glsl';
import fragment from './delaunay-cover-layer-fragment.glsl';

import fslighting from '../../shaderlib/fs-lighting/fs-lighting';

export default class DelaunayCoverLayer extends Layer {
  // NOTE: commenting out, it is not used anywhere.

  getShaders() {
    return {
      vs: vertex,
      fs: fragment
    };
  }

  initializeState() {
    const {gl} = this.context;
    const {triangulation} = this.props;
    const model = this.getModel(gl, triangulation);
    this.setState({model});
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {}

  getModel(gl, triangulation) {
    const bounds = [Infinity, -Infinity];
    triangulation.forEach(triangle => {
      const minT = Math.min(...triangle.map(d => d.elv));
      const maxT = Math.max(...triangle.map(d => d.elv));
      bounds[0] = bounds[0] > minT ? minT : bounds[0];
      bounds[1] = bounds[1] < maxT ? maxT : bounds[1];
    });

    const positions = [];
    triangulation.forEach(t =>
      positions.push(
        -t[0].long,
        t[0].lat,
        t[0].elv,
        -t[1].long,
        t[1].lat,
        t[1].elv,
        -t[2].long,
        t[2].lat,
        t[2].elv
      )
    );

    const next = [];
    triangulation.forEach(t =>
      next.push(
        -t[1].long,
        t[1].lat,
        t[1].elv,
        -t[2].long,
        t[2].lat,
        t[2].elv,
        -t[0].long,
        t[0].lat,
        t[0].elv
      )
    );

    const next2 = [];
    triangulation.forEach(t =>
      next2.push(
        -t[2].long,
        t[2].lat,
        t[2].elv,
        -t[0].long,
        t[0].lat,
        t[0].elv,
        -t[1].long,
        t[1].lat,
        t[1].elv
      )
    );

    const shaders = this.getShaders();

    const model = new Model(gl, {
      id: 'delaunay',
      // program: new Program(gl, shaders),
      vs: shaders.vs,
      fs: shaders.fs,
      modules: [fslighting],
      geometry: new Geometry({
        drawMode: 'TRIANGLES',
        attributes: {
          positions: new Float32Array(positions),
          next: {
            value: new Float32Array(next),
            type: gl.FLOAT,
            size: 3
          },
          next2: {
            value: new Float32Array(next2),
            type: gl.FLOAT,
            size: 3
          }
        }
      }),
      isIndexed: false,
      // modules: ['project'],
      onBeforeRender: () => {
        model.program.setUniforms({
          bounds
        });
        setParameters(gl, {
          blend: true,
          blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
          blendEquation: gl.FUNC_ADD,
          depthTest: true,
          depthFunc: gl.LEQUAL
        });
      },
      onAfterRender: () => {
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    });

    return model;
  }
}

DelaunayCoverLayer.layerName = 'DelaunayCoverLayer';
