```
import React, {Component} from 'react';
import {DeckGLOverlay, ArcLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';

const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

const outFlowColors = [
  [255,255,178],
  [254,217,118],
  [254,178,76],
  [253,141,60],
  [252,78,42],
  [227,26,28],
  [177,0,38],
];

export default class ArcDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      this._computeQuantile(data);
      console.log('Arc count: ' + data.length);
    }
  }

  _computeQuantile(data) {
    const scale = scaleQuantile()
      .domain(data.map(d => d.weight))
      .range(inFlowColors.map((c, i) => i));
    this.setState({scale});
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, params, data} = this.props;
    const {scale} = this.state;

    if (!data) {
      return null;
    }

    const layer = new ArcLayer({
      id: 'arc',
      ...viewport,
      data: data,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      getSourceColor: d => inFlowColors[scale(d.weight)],
      getTargetColor: d => outFlowColors[scale(d.weight)],
      strokeWidth: params.lineWidth.value,
      isPickable: true
    });

    return (
      <DeckGLOverlay {...viewport} layers={ [layer] }
        onWebGLInitialized={this._initialize} />
    );
  }
}
```
