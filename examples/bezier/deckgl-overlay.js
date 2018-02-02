import React, {Component} from 'react';
import DeckGL, {COORDINATE_SYSTEM, OrthographicViewport, ScatterplotLayer} from 'deck.gl';
import {BezierCurveLayer} from 'deck.gl-layers';

export default class DeckGLOverlay extends Component {
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
      new BezierCurveLayer({
        id: 'curve-layer',
        data: data.edges,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getSourcePosition: e => e.source,
        getTargetPosition: e => e.target,
        getControlPoint: e => e.controlPoint,
        getColor: e => [150, 150, 150, 255],
        strokeWidth: 5,
        // interaction:
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 0, 0, 255]
      }),
      new ScatterplotLayer({
        id: 'node-layer',
        data: data.nodes,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getRadius: d => 5,
        getColor: d => [0, 0, 150, 255],
        // interaction:
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 0, 0, 255]
      })
    ];

    return (
      <div style={{pointerEvents: 'all'}}>
        <DeckGL width={width} height={height} viewport={viewport} layers={layers} />
      </div>
    );
  }
}
