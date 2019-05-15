// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Layer, log, createIterable} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, fp64, PhongMaterial} from '@luma.gl/core';
import {ColumnGeometry, FILL_MODE, WIREFRAME_MODE} from './column-geometry';
const {fp64LowPart} = fp64;
const defaultMaterial = new PhongMaterial();

import vs from './column-layer-vertex.glsl';
import fs from './column-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  diskResolution: {type: 'number', min: 4, value: 20},
  vertices: null,
  radius: {type: 'number', min: 0, value: 1000},
  angle: {type: 'number', value: 0},
  offset: {type: 'array', value: [0, 0]},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  extruded: true,
  fp64: false,
  wireframe: false,
  filled: true,
  getPosition: {type: 'accessor', value: x => x.position},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},
  getElevation: {type: 'accessor', value: 1000},
  material: defaultMaterial,
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

export default class ColumnLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'gouraud-lighting', 'picking']};
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        transition: true,
        accessor: 'getPosition'
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: 'getElevation'
      },
      instancePositions64xyLow: {
        size: 2,
        accessor: 'getPosition',
        update: this.calculateInstancePositions64xyLow
      },
      instanceFillColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceLineColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR
      }
    });
    /* eslint-enable max-len */
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    const regenerateModels =
      props.fp64 !== oldProps.fp64 ||
      props.diskResolution !== oldProps.diskResolution ||
      props.filled !== oldProps.filled ||
      props.wireframe !== oldProps.wireframe;

    if (regenerateModels) {
      const {gl} = this.context;
      if (this.state.models) {
        this.state.models.forEach(model => model.delete());
      }
      this.setState(this._getModels(gl));
      this.getAttributeManager().invalidateAll();
    }

    if (regenerateModels || props.vertices !== oldProps.vertices) {
      this._updateVertices(props.vertices);
    }
  }

  getGeometry(diskResolution, mode = FILL_MODE, vertices) {
    return new ColumnGeometry({
      radius: 1,
      mode,
      drawMode: mode === FILL_MODE ? GL.TRIANGLE_STRIP : GL.LINES,
      height: 2,
      vertices,
      nradial: diskResolution
    });
  }

  _getModels(gl) {
    const {id, filled, wireframe, diskResolution} = this.props;
    let fillModel;
    let wireframeModel;

    if (filled) {
      fillModel = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-${FILL_MODE}`,
          uniforms: {isWireframe: false},
          geometry: this.getGeometry(diskResolution, FILL_MODE),
          isInstanced: true,
          shaderCache: this.context.shaderCache
        })
      );
    }
    if (wireframe) {
      wireframeModel = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-${WIREFRAME_MODE}`,
          uniforms: {isWireframe: true},
          geometry: this.getGeometry(diskResolution, WIREFRAME_MODE),
          isInstanced: true,
          shaderCache: this.context.shaderCache
        })
      );
    }

    return {
      models: [fillModel, wireframeModel].filter(Boolean),
      fillModel,
      wireframeModel
    };
  }

  _updateVertices(vertices) {
    if (!vertices) {
      return;
    }
    const {diskResolution} = this.props;
    log.assert(vertices.length >= diskResolution);
    const {fillModel, wireframeModel} = this.state;

    if (fillModel) {
      const fillGeometry = this.getGeometry(diskResolution, FILL_MODE, vertices);
      fillModel.setProps({geometry: fillGeometry});
    }

    if (wireframeModel) {
      const wireframeGeometry = this.getGeometry(diskResolution, WIREFRAME_MODE, vertices);
      wireframeModel.setProps({geometry: wireframeGeometry});
    }
  }

  draw({uniforms}) {
    const {elevationScale, extruded, offset, coverage, radius, angle} = this.props;
    const {models} = this.state;
    const renderUniforms = Object.assign({}, uniforms, {
      radius,
      angle: (angle / 180) * Math.PI,
      offset,
      extruded,
      coverage,
      elevationScale
    });
    const numInstances = this.getNumInstances();

    for (const model of models) {
      model.setInstanceCount(numInstances);
      model.setUniforms(renderUniforms);
      model.draw();
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    const {iterable, objectInfo} = createIterable(data);
    for (const object of iterable) {
      objectInfo.index++;
      const position = getPosition(object, objectInfo);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }
}

ColumnLayer.layerName = 'ColumnLayer';
ColumnLayer.defaultProps = defaultProps;
