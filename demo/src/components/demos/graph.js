import React, {Component} from 'react';
import autobind from 'autobind-decorator';
import {Parser} from 'expr-eval';

import Canvas3D from '../canvas3d';
import GraphLayer from './graph-layer/graph-layer';
import DeckGL from 'deck.gl';

export default class GraphDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {
      equation: {displayName: 'Equation', type: 'text', value: 'sin(x ^ 2 + y ^ 2)'},
      resolution: {displayName: 'Resolution', type: 'number',
        value: 200, step: 10, min: 10, max: 1000},
      showAxis: {displayName: 'Show Axis', type: 'checkbox', value: true}
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
      viewport: {
        lookAt: [0, 0, 0],
        distance: 5,
        rotationX: -30,
        rotationY: 30,
        fov: 50,
        minDistance: 2,
        maxDistance: 20
      },
      equation: {},
      hoverInfo: null
    };
  }

  componentDidMount() {
    this.refs.canvas.fitBounds([-1, -1, -1], [1, 1, 1]);
  }

  componentWillReceiveProps(nextProps) {
    const {equation} = nextProps.params;
    if (equation && equation !== this.props.params.equation) {
      const expression = equation.value;
      try {
        const p = Parser.parse(expression);
        this.setState({
          equation: {
            valid: true,
            func: (x, y) => p.evaluate({x, y}),
            text: p.toString()
          }
        });
      } catch (err) {
        this.setState({
          equation: {valid: false}
        });
      }
    }
  }

  @autobind _onHover(info) {
    const hoverInfo = info.sample ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  @autobind _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {
      viewport: {width, height},
      params: {resolution, showAxis}
    } = this.props;
    const {viewport, equation, hoverInfo} = this.state;

    const layers = equation.valid ? [new GraphLayer({
      getZ: equation.func,
      getColor: (x, y, z) => [40, z * 255, 160],
      xRange: [-Math.PI, Math.PI],
      yRange: [-Math.PI, Math.PI],
      resolution: [resolution.value, resolution.value],
      axisOffset: 0.5,
      axisColor: showAxis.value ? [0, 0, 0, 128] : [0, 0, 0, 0],
      opacity: 1,
      pickable: true,
      onHover: this._onHover,
      updateTriggers: {
        getZ: equation.text
      }
    })] : [];

    const canvasProps = {
      width,
      height,
      ...viewport
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
          layers={ layers } />

        {hoverInfo && <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}} >
          { hoverInfo.sample.map(x => x.toFixed(3)).join(', ') }
          </div>}

      </Canvas3D>
    );
  }
}
