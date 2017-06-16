import React, {Component} from 'react';
import {setParameters} from 'luma.gl';

import PlotLayer from './plot-layer';
import DeckGL from 'deck.gl';
import OrbitController from './orbit-controller';
import {scaleLinear} from 'd3-scale';

function getScale({min, max}) {
  return scaleLinear().domain([min, max]).range([0, 1]);
}

export default class DeckGLOverlay extends Component {

  _onInitialized(gl) {
    setParameters(gl, {
      depthTest: true,
      depthFunc: gl.LEQUAL
    });
  }

  render() {
    const {viewport, resolution, showAxis, equation} = this.props;

    const layers = equation ? [
      new PlotLayer({
        getPosition: (u, v) => {
          const x = (u - 1 / 2) * Math.PI * 2;
          const y = (v - 1 / 2) * Math.PI * 2;
          return [x, y, equation(x, y)];
        },
        getColor: (x, y, z) => [40, z * 128 + 128, 160],
        getXScale: getScale,
        getYScale: getScale,
        getZScale: getScale,
        uCount: resolution,
        vCount: resolution,
        drawAxes: showAxis,
        axesPadding: 0.25,
        axesColor: [0, 0, 0, 128],
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover,
        updateTriggers: {
          getPosition: equation
        }
      })
    ] : [];

    const perspectiveViewport = OrbitController.getViewport(viewport);

    return (
      <DeckGL
        onWebGLInitialized={this._onInitialized}
        width={viewport.width}
        height={viewport.height}
        viewport={perspectiveViewport}
        layers={ layers } />
    );
  }
}
