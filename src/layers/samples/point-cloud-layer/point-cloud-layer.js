import {Layer} from '../../../lib';
import {GL, Model, Program, Geometry} from 'luma.gl';

import VERTEX_SHADER from './point-cloud-layer-vertex';
import FRAGMENT_SHADER from './point-cloud-layer-fragment';

export default class PointCloudLayer extends Layer {
  /*
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor(props) {
    super(props);
  }

  initializeState() {
    const {gl} = this.state;
    const {attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.add({
      pointPositions: {size: 3, 0: 'x', 1: 'y', 2: 'z'},
      pointColors: {size: 3, 0: 'red', 1: 'green', 2: 'blue'}
    }, {
      pointPositions: {update: this.calculatePointPositions},
      pointColors: {update: this.calculatePointColors}
    });
  }

  didMount() {
    this.updateUniforms();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);
    this.updateUniforms();
  }

  getModel(gl) {
    const model = new Model({
      program: new Program(gl, {
        vs: VERTEX_SHADER,
        fs: FRAGMENT_SHADER,
        id: 'scatterplot'
      }),
      geometry: new Geometry({
        drawMode: 'POINTS'
      })
      // vertexCount: 0,
    });
    model.geometry.drawMode = GL.POINTS;
    return model;
  }

  updateUniforms() {
    this.calculateUniforms();
    const {radius, pixelPerMeter} = this.state;
    const {width, height, pointSize = 10} = this.props;
    this.setUniforms({
      radius: [radius / width * 2, radius / height * 2],
      pixelPerMeter,
      pointSize
    });
  }

  calculatePointPositions(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const pt of data) {
      value[i] = pt[0];
      value[i + 1] = pt[1];
      value[i + 2] = pt[2];
      i += size;
    }
    // TODO - this is inefficient - should be autodeduced
    this.state.model.setVertexCount(i / size);
  }

  calculatePointColors(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const pt of data) {
      value[i] = pt[3];
      value[i + 1] = pt[4];
      value[i + 2] = pt[5];
      i += size;
    }
  }

  calculateUniforms() {
    const SIZE_IN_METER = 0.1;
    const DISTANCE_IN_METER = 37.0409;
    const pixel0 = this.project({lon: -122, lat: 37.5});
    const pixel1 = this.project({lon: -122, lat: 37.5002});

    const dx = pixel0.x - pixel1.x;
    const dy = pixel0.y - pixel1.y;
    const scale = Math.sqrt(dx * dx + dy * dy) / DISTANCE_IN_METER;

    this.state.radius = Math.max(scale * SIZE_IN_METER, 1.0);
    this.state.pixelPerMeter = scale;
  }
}
