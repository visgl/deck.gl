```
import React, {Component} from 'react';
import {DeckGLOverlay, ChoroplethLayer} from 'deck.gl';
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

export default class ChoroplethDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      const scale = this._computeQuantile(data, null);
      this.setState({scale});
      console.log('Choropleth count: ' + data[0].features.length);
    }
  }

  _computeQuantile(data, hoveredFeature) {
    if (!data || !data.length) {
      return;
    }

    const values = data[0].features.map((f, i) => {
      const value = hoveredFeature ? -hoveredFeature.properties.flows[i] :
        f.properties.netFlow;
      f.properties.value = value;
      return Math.abs(value);
    });

    const scale = scaleQuantile()
      .domain(values)
      .range(inFlowColors.map((c, i) => i));

    return scale;
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onHoverFeature(evt) {
    const {data} = this.props;
    const {feature} = evt;

    if (this.state.hoveredFeature === feature) {
      return;
    }

    this.setState({
      hoveredFeature: feature,
      scale: this._computeQuantile(data, feature)
    });
  }

  render() {
    const {viewport, params, data} = this.props;
    const {scale, hoveredFeature} = this.state;

    if (!data) {
      return null;
    }

    const layer = new ChoroplethLayer({
      id: 'choropleth',
      ...viewport,
      data: data[0],
      getColor: f => {
        if (f === hoveredFeature) {
          return [255, 255, 255];
        }

        const {value} = f.properties;
        const q = isNaN(value) ? 0 : scale(Math.abs(value));
        return value > 0 ? inFlowColors[q] : outFlowColors[q];
      },
      updateTriggers: {
        colors: hoveredFeature
      },
      onHover: this._onHoverFeature.bind(this),
      isPickable: true
    });

    return (
      <DeckGLOverlay {...viewport} layers={ [layer] }
        onWebGLInitialized={this._initialize} />
    );
  }
}

```
