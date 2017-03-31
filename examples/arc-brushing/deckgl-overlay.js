import React, {Component} from 'react';
import {scaleQuantile} from 'd3-scale';

import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import ArcBrushingLayer from './arc-brushing-layer';

export const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]
];

export const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38]
];

const sourceColor = [144, 12, 63];
const targetColor = [255, 195, 0];
//
// rgb(218, 247, 166)
// rgb(255, 195, 0)
// rgb(255, 87, 51)
// rgb(199, 0, 57)
// rgb(144, 12, 63)
// rgb(88, 24, 69)
export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      longitude: -100,
      latitude: 40.7,
      zoom: 3,
      maxZoom: 15,
      pitch: 0,
      bearing: 0
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      arcs: []
    }
  }
  componentDidMount() {
    this.setState({
      arcs: this._getArcs(this.props)
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        arcs: this._getArcs(nextProps)
      });
    }
  }

  _getArcs({data}) {
    if (!data) {
      return null;
    }
    const arcs = [];
    const points = [];
    const pairs = {};

    data.forEach((county, i) => {

      const {flows, centroid: targetCentroid} = county.properties;
      points.push({
        positions: targetCentroid
      });
      Object.keys(flows).forEach(toId => {
        // eliminate duplicates
        const pairKey = [i, Number(toId)].sort((a, b) =>  a - b).join('-');
        if (pairs[pairKey]) {
          return;
        }

        pairs[pairKey] = true;
        const sourceCentroid = data[toId].properties.centroid;
        const gain = Math.sign(flows[toId]);

        arcs.push({
          source: gain ? sourceCentroid : targetCentroid,
          target: gain ? targetCentroid : sourceCentroid,
          value: flows[toId]
        });
      })
    });

    return arcs;
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    //gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
  }

  render() {
    const {viewport, strokeWidth, opacity, mousePosition} = this.props;
    const {arcs} = this.state;

    if (!arcs) {
      return null;
    }

    const layers = [
      new ArcBrushingLayer({
        id: 'arc',
        data: arcs,
        pickable: true,
        strokeWidth,
        opacity,
        mousePosition,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        // getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
        // getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
        getSourceColor: d => sourceColor,
        getTargetColor: d => targetColor
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize}/>
    );
  }
}
