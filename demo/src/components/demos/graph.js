import React, {Component} from 'react';
import autobind from 'autobind-decorator';

import Canvas3D from '../canvas3d';
import GraphLayer from './graph-layer/graph-layer';
import DeckGL from 'deck.gl';

export default class GraphDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {
    };
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Graph Explorer</h3>
        <p>Non-geospatial demo.</p>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      lookAt: [0, 0, 0],
      distance: 5,
      rotationX: -30,
      rotationY: 30,
      fov: 50,
      minDistance: 2,
      maxDistance: 20
    };
  }

  componentDidMount() {
    this.refs.canvas.fitBounds([-1, -1, -1], [1, 1, 1]);
  }

  @autobind _onViewportChange(viewport) {
    this.setState(viewport);
  }

  _onInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport: {width, height}, params, data} = this.props;

    const layer = new GraphLayer({
      getY: (x, z) => Math.sin(x * x + z),
      getColor: (x, y, z) => [40, y * 255, 160],
      xRange: [-Math.PI, Math.PI],
      zRange: [-Math.PI, Math.PI],
      resolution: [100, 100],
      axisOffset: 0.5,
      axisColor: [0, 0, 0, 128],
      opacity: 1
    });

    const canvasProps = {
      width,
      height,
      ...this.state
    };
    const perspectiveViewport = Canvas3D.getViewport(canvasProps);

    return (
      <Canvas3D ref="canvas"
        {...canvasProps}
        onViewportChange={this._onViewportChange} >
        <DeckGL
          onWebGLInitialized={this._onInitialized}
          width={width}
          height={height}
          viewport={perspectiveViewport}
          layers={ [layer] } />
      </Canvas3D>
    );
  }
}
