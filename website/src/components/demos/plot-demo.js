import React, {Component} from 'react';
import {Parser} from 'expr-eval';
import autobind from 'autobind-decorator';
import {experimental} from 'deck.gl';
const {OrbitController} = experimental;
import PlotOverlay from '../../../../examples/plot/deckgl-overlay';

export default class PlotDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {
      equation: {displayName: 'Z = f(x, y)', type: 'text', value: 'sin(x ^ 2 + y ^ 2) * x / 3.14'},
      resolution: {displayName: 'Resolution', type: 'number',
        value: 200, step: 10, min: 10, max: 1000},
      showAxis: {displayName: 'Grid', type: 'checkbox', value: true}
    };
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>3D Surface Explorer</h3>
        <p>Surface plot from a mathematical equation</p>
        <p>Hover on the plot to see the values</p>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        lookAt: [0, 0, 0],
        distance: 3,
        rotationX: -30,
        rotationOrbit: 30,
        orbitAxis: 'Y',
        fov: 50,
        minDistance: 1,
        maxDistance: 20
      },
      equation: {},
      hoverInfo: null
    };
  }

  componentDidMount() {
    const {viewport: {width, height}} = this.props;
    const {viewport} = this.state;

    const canvasProps = {...viewport, width, height};
    this._onViewportChange(OrbitController.getViewport(canvasProps)
      .fitBounds([3, 3, 3]));
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

  render() {
    const {
      viewport: {width, height},
      params: {resolution, showAxis}
    } = this.props;
    const {viewport, equation, hoverInfo} = this.state;

    const canvasProps = {
      ...viewport,
      width,
      height
    };
    const orbitViewport = OrbitController.getViewport(canvasProps);

    return (
      <OrbitController
        {...canvasProps}
        onViewportChange={this._onViewportChange} >
        {resolution && <PlotOverlay
          viewport={orbitViewport}
          equation={equation.valid ? equation.func : null}
          resolution={resolution.value}
          showAxis={showAxis.value}
          onHover={this._onHover} />}

        {hoverInfo && <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}} >
          { hoverInfo.sample.map(x => x.toFixed(3)).join(', ') }
          </div>}

      </OrbitController>
    );
  }
}
