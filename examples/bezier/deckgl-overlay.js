import React, {Component} from 'react';
import DeckGL, {COORDINATE_SYSTEM, OrthographicViewport, ScatterplotLayer} from 'deck.gl';

import BezierCurveLayer from './bezier-curve-layer';

export default class DeckGLOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = this._processData(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(this._processData(nextProps));
    }
  }

  _processData({data}) {
    return {};
  }

  render() {
    const {width, height, data} = this.props;

    const viewport = new OrthographicViewport({
      width,
      height,
      left: -width / 2,
      top: -height / 2,
      right: width / 2,
      bottom: height / 2
    });

    const layers = [
      new ScatterplotLayer({
        id: 'node-layer',
        data: data.nodes,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getRadius: d => 10,
        getColor: d => [255, 0, 0, 255]
      }),
      new BezierCurveLayer({
        id: 'curve-layer',
        data: data.edges,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getSourcePosition: e => e.source,
        getTargetPosition: e => e.target,
        getControlPoint: e => e.controlPoint,
        getColor: e => [255, 0, 0, 255],
        strokeWidth: 5
      })
    ];

    return <DeckGL width={width} height={height} viewport={viewport} layers={layers} />;
  }
}
