// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, fp64LowPart, picking} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/core';

import vs from './bezier-curve-layer-vertex.glsl';
import fs from './bezier-curve-layer-fragment.glsl';

const NUM_SEGMENTS = 40;
const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  strokeWidth: {type: 'number', min: 0, value: 1},
  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getControlPoint: {type: 'accessor', value: x => x.controlPoint},
  getColor: {type: 'accessor', value: DEFAULT_COLOR}
};

export default class BezierCurveLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: [picking]};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        transition: true,
        accessor: 'getTargetPosition'
      },
      instanceControlPoints: {
        size: 3,
        transition: false,
        accessor: 'getControlPoint'
      },
      instanceColors: {
        size: 4,
        type: 'uint8',
        transition: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      }
    });
    /* eslint-enable max-len */
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
    }
  }

  draw({uniforms}) {
    const {strokeWidth} = this.props;

    this.state.model.render(
      Object.assign({}, uniforms, {
        strokeWidth
      })
    );
  }

  _getModel(gl) {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    let positions = [];
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      positions = positions.concat([i, -1, 0, i, 1, 0]);
    }

    const model = new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          topology: 'triangle-strip',
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
    model.setUniforms({numSegments: NUM_SEGMENTS});
    return model;
  }

  calculateInstanceSourceTargetPositions64xyLow(attribute) {
    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = fp64LowPart(sourcePosition[0]);
      value[i + 1] = fp64LowPart(sourcePosition[1]);
      value[i + 2] = fp64LowPart(targetPosition[0]);
      value[i + 3] = fp64LowPart(targetPosition[1]);
      i += size;
    });
  }
}

BezierCurveLayer.layerName = 'BezierCurveLayer';
BezierCurveLayer.defaultProps = defaultProps;
