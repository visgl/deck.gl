import React, {Component} from 'react';

import PlotLayer from './plot-layer';
import DeckGL from 'deck.gl';
import OrbitController from './orbit-controller';

export default class DeckGLOverlay extends Component {

  _onInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, resolution, showAxis, equation} = this.props;

    const layers = equation ? [
      new PlotLayer({
        getZ: equation,
        getColor: (x, y, z) => [40, z * 128 + 128, 160],
        xMin: -Math.PI,
        xMax: Math.PI,
        yMin: -Math.PI,
        yMax: Math.PI,
        xResolution: resolution,
        yResolution: resolution,
        drawAxes: showAxis,
        axesOffset: 0.25,
        axesColor: [0, 0, 0, 128],
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover,
        updateTriggers: {
          getZ: equation
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
