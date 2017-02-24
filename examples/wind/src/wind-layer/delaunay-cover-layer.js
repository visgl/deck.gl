import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Program} from 'luma.gl';
import {join} from 'path';
import vertex from './delaunay-cover-vertex.js';
import fragment from './delaunay-cover-fragment.js';

export default class DelaunayCoverLayer extends Layer {

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


  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;
    const {triangulation} = this.props;
    const model = this.getModel(gl, triangulation);
    this.setState({model});
  }

  getShaders() {
    return {
      vs: vertex,
      fs: fragment
    };
  }

  getModel(gl, triangulation) {
    const bounds = [Infinity, -Infinity];
    triangulation.forEach(t => {
      const minT = Math.min.apply(Math, t.map(t => t.elv));
      const maxT = Math.max.apply(Math, t.map(t => t.elv));
      bounds[0] = bounds[0] > minT ? minT : bounds[0];
      bounds[1] = bounds[1] < maxT ? maxT : bounds[1];
    });

    const positions = [];
    triangulation.forEach(t => positions.push(
      -t[0].long, t[0].lat, t[0].elv,
      -t[1].long, t[1].lat, t[1].elv,
      -t[2].long, t[2].lat, t[2].elv)
    );

    const next = [];
    triangulation.forEach(t => next.push(
      -t[1].long, t[1].lat, t[1].elv,
      -t[2].long, t[2].lat, t[2].elv,
      -t[0].long, t[0].lat, t[0].elv)
    );
    
    const next2 = [];
    triangulation.forEach(t => next2.push(
      -t[2].long, t[2].lat, t[2].elv,
      -t[0].long, t[0].lat, t[0].elv,
      -t[1].long, t[1].lat, t[1].elv)
    );

    /* eslint-disable */
    const shaders = assembleShaders(gl, this.getShaders());
    // let now = Date.now();
    let model = new Model({
      gl,
      id: 'delaunay',
      program: new Program(gl, shaders),
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
      onBeforeRender: () => {
        model.program.setUniforms({
          lightsPosition: [-100, 25, 15000],
          ambientRatio: 0.2,
          diffuseRatio: 0.9,
          specularRatio: 0.2,
          lightsStrength: [1.0, 0.0],
          numberOfLights: 2,
          bounds
        });
        // gl.disable(gl.BLEND);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.FUNC_ADD);
      },
      onAfterRender: () => {
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    });

    return model;
  }

  countVertices(data) {

  }

  updateUniforms() {
    // const {opacity, trailLength, currentTime} = this.props;
  }

  calculateIndices(attribute) {

  }

  calculatePositions(attribute) {

  }

  calculateColors(attribute) {

  }
}