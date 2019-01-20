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

import {Layer} from '@deck.gl/core';
import GL from 'luma.gl/constants';
import {Model, Geometry, hasFeature, FEATURES} from 'luma.gl';

// Polygon geometry generation is managed by the polygon tesselator
import PolygonTesselator from './polygon-tesselator';

import vs from './solid-polygon-layer-vertex.glsl';
import fs from './solid-polygon-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  filled: true,
  // Whether to extrude
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,
  fp64: false,

  // elevation multiplier
  elevationScale: {type: 'number', min: 0, value: 1},

  // Accessor for polygon geometry
  getPolygon: {type: 'accessor', value: f => f.polygon},
  // Accessor for extrusion height
  getElevation: {type: 'accessor', value: 1000},
  // Accessor for colors
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

const ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

export default class SolidPolygonLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'lighting', 'picking']};
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({
      numInstances: 0,
      polygonTesselator: new PolygonTesselator({
        IndexType: !gl || hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? Uint32Array : Uint16Array
      })
    });

    const attributeManager = this.getAttributeManager();
    const noAlloc = true;

    attributeManager.remove(['instancePickingColors']);

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {
        size: 3,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        update: this.calculatePositions,
        noAlloc
      },
      positions64xyLow: {size: 2, update: this.calculatePositionsLow, noAlloc},
      vertexValid: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getElevation',
        update: this.calculateElevations
      },
      fillColors: {
        alias: 'colors',
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        update: this.calculateFillColors,
        defaultValue: DEFAULT_COLOR
      },
      lineColors: {
        alias: 'colors',
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        update: this.calculateLineColors,
        defaultValue: DEFAULT_COLOR
      },
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors}
    });
    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {extruded, filled, wireframe, elevationScale} = this.props;
    const {topModel, sideModel} = this.state;

    const renderUniforms = Object.assign({}, uniforms, {
      extruded: Boolean(extruded),
      elevationScale
    });

    // Note: the order is important
    if (sideModel) {
      sideModel.setUniforms(renderUniforms);
      if (wireframe) {
        sideModel.setDrawMode(GL.LINE_STRIP);
        sideModel.render({isWireframe: true});
      }
      if (filled) {
        sideModel.setDrawMode(GL.TRIANGLE_FAN);
        sideModel.render({isWireframe: false});
      }
    }
    if (topModel) {
      topModel.render(renderUniforms);
    }
  }

  updateState(updateParams) {
    super.updateState(updateParams);

    this.updateGeometry(updateParams);

    const {props, oldProps} = updateParams;
    const attributeManager = this.getAttributeManager();

    const regenerateModels =
      props.fp64 !== oldProps.fp64 ||
      props.filled !== oldProps.filled ||
      props.extruded !== oldProps.extruded;

    if (regenerateModels) {
      if (this.state.models) {
        this.state.models.forEach(model => model.delete());
      }

      this.setState(this._getModels(this.context.gl));
      attributeManager.invalidateAll();
    }
  }

  updateGeometry({props, oldProps, changeFlags}) {
    const geometryConfigChanged =
      changeFlags.dataChanged ||
      props.fp64 !== oldProps.fp64 ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    // When the geometry config  or the data is changed,
    // tessellator needs to be invoked
    if (geometryConfigChanged) {
      const {polygonTesselator} = this.state;
      polygonTesselator.updateGeometry({
        data: props.data,
        getGeometry: props.getPolygon,
        positionFormat: props.positionFormat,
        fp64: this.use64bitPositions()
      });

      this.setState({
        numInstances: polygonTesselator.instanceCount
      });

      this.getAttributeManager().invalidateAll();
    }
  }

  updateAttributes(props) {
    super.updateAttributes(props);
    const attributes = this.getAttributeManager().getChangedAttributes({clearChangedFlags: true});
    const {topModel, sideModel} = this.state;
    const numInstances = this.getNumInstances();

    if (topModel) {
      if (attributes.indices) {
        const vertexCount = attributes.indices.value.length;
        topModel.setVertexCount(vertexCount);
      }
      topModel.setAttributes(attributes);
    }
    if (sideModel) {
      // Remove one to account for the offset
      sideModel.setInstanceCount(numInstances - 1);
      const newAttributes = {};
      for (const attributeName in attributes) {
        const attribute = attributes[attributeName];

        if (attributeName !== 'indices') {
          // Apply layout override to the attribute.
          newAttributes[attributeName] = Object.assign({}, attribute, {
            isInstanced: true,
            buffer: attribute.getBuffer()
          });
        }
      }
      if (newAttributes.positions) {
        newAttributes.nextPositions = Object.assign(
          {},
          newAttributes.positions,
          {id: 'nextPositions', offset: 12} // 1 vertex * 3 floats * 4 bits
        );
      }
      if (newAttributes.positions64xyLow) {
        newAttributes.nextPositions64xyLow = Object.assign(
          {},
          newAttributes.positions64xyLow,
          {id: 'nextPositions64xyLow', offset: 8} // 1 vertex * 2 floats * 4 bits
        );
      }
      sideModel.setAttributes(newAttributes);
    }
  }

  _getModels(gl) {
    const {id, filled, extruded} = this.props;

    let topModel;
    let sideModel;

    if (filled) {
      topModel = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-top`,
          geometry: new Geometry({
            drawMode: GL.TRIANGLES,
            attributes: {
              vertexPositions: {size: 2, constant: true, value: new Float32Array([0, 1])},
              nextPositions: {size: 3, constant: true, value: new Float32Array(3)},
              nextPositions64xyLow: {size: 2, constant: true, value: new Float32Array(2)}
            }
          }),
          uniforms: {
            isWireframe: false,
            isSideVertex: false
          },
          vertexCount: 0,
          isIndexed: true,
          shaderCache: this.context.shaderCache
        })
      );
    }
    if (extruded) {
      sideModel = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-side`,
          geometry: new Geometry({
            drawMode: GL.LINES,
            vertexCount: 4,
            attributes: {
              // top right - top left - bootom left - bottom right
              vertexPositions: {size: 2, value: new Float32Array([1, 1, 0, 1, 0, 0, 1, 0])}
            }
          }),
          uniforms: {
            isSideVertex: true
          },
          isInstanced: 1,
          shaderCache: this.context.shaderCache
        })
      );
    }

    return {
      models: [sideModel, topModel].filter(Boolean),
      topModel,
      sideModel
    };
  }

  calculateIndices(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.indexLayout;
    attribute.value = polygonTesselator.get('indices');
  }

  calculatePositions(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.get('positions');
  }
  calculatePositionsLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    attribute.value = this.state.polygonTesselator.get('positions64xyLow');
  }

  calculateVertexValid(attribute) {
    attribute.value = this.state.polygonTesselator.get('vertexValid');
  }

  calculateElevations(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;

    const {extruded, getElevation} = this.props;
    if (extruded) {
      attribute.constant = false;
      attribute.value = polygonTesselator.get('elevations', attribute.value, getElevation);
    } else {
      attribute.constant = true;
      attribute.value = new Float32Array(1);
    }
  }

  calculateFillColors(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.get('colors', attribute.value, this.props.getFillColor);
  }
  calculateLineColors(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.get('colors', attribute.value, this.props.getLineColor);
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    attribute.value = this.state.polygonTesselator.get(
      'pickingColors',
      attribute.value,
      this.encodePickingColor
    );
  }

  clearPickingColor(color) {
    const pickedPolygonIndex = this.decodePickingColor(color);
    const {bufferLayout} = this.state.polygonTesselator;
    const numVertices = bufferLayout[pickedPolygonIndex];

    let startInstanceIndex = 0;
    for (let polygonIndex = 0; polygonIndex < pickedPolygonIndex; polygonIndex++) {
      startInstanceIndex += bufferLayout[polygonIndex];
    }

    const {pickingColors} = this.getAttributeManager().attributes;

    const {value} = pickingColors;
    const endInstanceIndex = startInstanceIndex + numVertices;
    value.fill(0, startInstanceIndex * 3, endInstanceIndex * 3);
    pickingColors.update({value});
  }
}

SolidPolygonLayer.layerName = 'SolidPolygonLayer';
SolidPolygonLayer.defaultProps = defaultProps;
