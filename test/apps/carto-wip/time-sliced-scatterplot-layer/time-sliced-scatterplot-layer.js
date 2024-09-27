// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// eslint-disable-next-line import/named
import {ScatterplotLayer, experimental} from 'deck.gl';

import vertex from './time-sliced-scatterplot-layer-vertex-64.glsl';
import fragment from './time-sliced-scatterplot-layer-fragment.glsl';

export function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

export default class TimeSlicedScatterplotLayer extends ScatterplotLayer {
  initializeState() {
    super.initializeState();

    this.getAttributeManager().addInstanced({
      time: {size: 1, accessor: 'getTime', defaultValue: 0, update: this.calculateTime}
    });
    /* eslint-enable max-len */
  }

  getShaders() {
    // use customized shaders
    return {vs: vertex, fs: fragment, modules: ['fp64', 'project64', 'picking']};
  }

  draw({uniforms}) {
    const {
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      outline,
      strokeWidth,
      currentTime,
      fadeFactor
    } = this.props;
    this.state.model.render(
      Object.assign({}, uniforms, {
        outline: outline ? 1 : 0,
        strokeWidth,
        radiusScale,
        radiusMinPixels,
        radiusMaxPixels,
        currentTime,
        fadeFactor
      })
    );
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = experimental.get(position, 0);
      value[i++] = experimental.get(position, 1);
      value[i++] = experimental.get(position, 2) || 0;
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64ify(experimental.get(position, 0))[1];
      value[i++] = fp64ify(experimental.get(position, 1))[1];
    }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const radius = getRadius(point);
      value[i++] = isNaN(radius) ? 1 : radius;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      value[i++] = experimental.get(color, 0);
      value[i++] = experimental.get(color, 1);
      value[i++] = experimental.get(color, 2);
      value[i++] = isNaN(experimental.get(color, 3)) ? 255 : experimental.get(color, 3);
    }
  }

  calculateInstanceTime(attribute) {
    const {data, getTime} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const time = getTime(point);
      value[i++] = isNaN(time) ? 0 : time;
    }
  }
}
