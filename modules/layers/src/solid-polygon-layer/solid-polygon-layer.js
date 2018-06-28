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
import {PolygonTesselator} from './polygon-tesselator';

import vs from './solid-polygon-layer-vertex.glsl';
import fs from './solid-polygon-layer-fragment.glsl';

const defaultLineColor = [0x0, 0x0, 0x0, 0xff];
const defaultFillColor = [0x0, 0x0, 0x0, 0xff];

const defaultProps = {
  filled: true,
  // Whether to extrude
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,
  fp64: false,

  // elevation multiplier
  elevationScale: 1,

  // Accessor for polygon geometry
  getPolygon: f => f.polygon,
  // Accessor for extrusion height
  getElevation: f => f.elevation || 0,
  // Accessor for colors
  getFillColor: f => f.fillColor || defaultFillColor,
  getLineColor: f => f.lineColor || defaultLineColor,

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

// Side model attributes
const SIDE_FILL_POSITIONS = new Float32Array([
  // top left corner
  0,
  1,
  // bottom left corner
  0,
  0,
  // top right corner
  1,
  1,
  // bottom right corner
  1,
  0
]);
const SIDE_WIRE_POSITIONS = new Float32Array([
  // top right corner
  1,
  1,
  // top left corner
  0,
  1,
  // bottom left corner
  0,
  0,
  // bottom right corner
  1,
  0
]);

// Model types
const ATTRIBUTE_OVERRIDES = {
  TOP: null,
  SIDE: {instanced: 1},
  WIRE: {instanced: 1}
};

const ATTRIBUTE_MAPS = {
  TOP: {
    indices: 'indices',
    positions: 'positions',
    positions64xyLow: 'positions64xyLow',
    elevations: 'elevations',
    colors: 'fillColors',
    pickingColors: 'pickingColors'
  },
  SIDE: {
    positions: 'positions',
    positions64xyLow: 'positions64xyLow',
    nextPositions: 'nextPositions',
    nextPositions64xyLow: 'nextPositions64xyLow',
    elevations: 'elevations',
    colors: 'fillColors',
    pickingColors: 'pickingColors'
  },
  WIRE: {
    positions: 'positions',
    positions64xyLow: 'positions64xyLow',
    nextPositions: 'nextPositions',
    nextPositions64xyLow: 'nextPositions64xyLow',
    elevations: 'elevations',
    colors: 'lineColors',
    pickingColors: 'pickingColors'
  }
};

const ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    if (chunk.length) {
      return chunk.subarray(chunk.length - value.length);
    }
    return value;
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
      IndexType: hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? Uint32Array : Uint16Array
    });

    const attributeManager = this.getAttributeManager();
    const noAlloc = true;
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
      positions64xyLow: {size: 2, update: this.calculatePositionsLow},
      nextPositions: {
        size: 3,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        update: this.calculateNextPositions,
        noAlloc
      },
      nextPositions64xyLow: {size: 2, update: this.calculateNextPositionsLow},
      elevations: {
        size: 1,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getElevation',
        update: this.calculateElevations,
        noAlloc
      },
      fillColors: {
        alias: 'colors',
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        update: this.calculateFillColors,
        defaultValue: defaultFillColor,
        noAlloc
      },
      lineColors: {
        alias: 'colors',
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        update: this.calculateLineColors,
        defaultValue: defaultLineColor,
        noAlloc
      },
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc}
    });
    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {extruded, elevationScale} = this.props;

    const renderUniforms = Object.assign({}, uniforms, {
      extruded: extruded ? 1.0 : 0.0,
      elevationScale
    });

    this.state.models.forEach(model => {
      model.render(renderUniforms);
    });
  }

  updateState(updateParams) {
    super.updateState(updateParams);

    this.updateGeometry(updateParams);

    const {props, oldProps} = updateParams;
    const attributeManager = this.getAttributeManager();

    const regenerateModels =
      props.fp64 !== oldProps.fp64 ||
      props.filled !== oldProps.filled ||
      props.extruded !== oldProps.extruded ||
      props.wireframe !== oldProps.wireframe;

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
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    // When the geometry config  or the data is changed,
    // tessellator needs to be invoked
    if (geometryConfigChanged) {
      // TODO - avoid creating a temporary array here: let the tesselator iterate
      const polygons = props.data.map(props.getPolygon);
      const polygonTesselator = this._getPolygonTesselator(polygons, this.state.IndexType);

      this.setState({
        polygonTesselator,
        numInstances: polygonTesselator.pointCount
      });

      this.getAttributeManager().invalidateAll();
    }

    if (
      geometryConfigChanged ||
      props.extruded !== oldProps.extruded ||
      props.fp64 !== oldProps.fp64
    ) {
      this.state.polygonTesselator.updatePositions({
        fp64: props.fp64,
        extruded: props.extruded
      });
    }
  }

  // "Experimental" method indended to make it easier to support non-nested arrays in subclasses
  _getPolygonTesselator(polygons, IndexType) {
    return new PolygonTesselator({polygons, IndexType: this.state.IndexType});
  }

  updateAttributes(props) {
    super.updateAttributes(props);
    const attributes = this.getAttributeManager().getChangedAttributes({clearChangedFlags: true});
    const {modelsByName} = this.state;

    for (const modelName in modelsByName) {
      const model = modelsByName[modelName];

      if (modelName === 'TOP') {
        model.setVertexCount(this.state.numVertex);
      } else {
        model.setInstanceCount(this.state.numInstances);
      }

      const attributeMap = ATTRIBUTE_MAPS[modelName];
      const attributeOverride = ATTRIBUTE_OVERRIDES[modelName];
      const newAttributes = {};
      for (const attributeName in attributeMap) {
        const attribute = attributes[attributeMap[attributeName]];

        if (attribute) {
          // Apply layout override to the attribute.
          newAttributes[attributeName] = attributeOverride
            ? Object.assign({}, attribute, attributeOverride, {
                buffer: attribute.getBuffer()
              })
            : attribute;
        }
      }
      model.setAttributes(newAttributes);
    }
  }

  _getModels(gl) {
    const {id, filled, extruded, wireframe} = this.props;

    const models = {};

    if (filled) {
      models.TOP = new Model(
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
            isSideVertex: 0
          },
          vertexCount: 0,
          isIndexed: true,
          shaderCache: this.context.shaderCache
        })
      );
    }
    if (filled && extruded) {
      models.SIDE = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-side`,
          geometry: new Geometry({
            drawMode: GL.TRIANGLE_STRIP,
            vertexCount: 4,
            attributes: {
              vertexPositions: {size: 2, value: SIDE_FILL_POSITIONS}
            }
          }),
          uniforms: {
            isSideVertex: 1
          },
          isInstanced: 1,
          shaderCache: this.context.shaderCache
        })
      );
    }
    if (extruded && wireframe) {
      models.WIRE = new Model(
        gl,
        Object.assign({}, this.getShaders(), {
          id: `${id}-wire`,
          geometry: new Geometry({
            drawMode: GL.LINE_STRIP,
            vertexCount: 4,
            attributes: {
              vertexPositions: {size: 2, value: SIDE_WIRE_POSITIONS}
            }
          }),
          uniforms: {
            isSideVertex: 1
          },
          isInstanced: 1,
          shaderCache: this.context.shaderCache
        })
      );
    }

    return {
      models: [models.WIRE, models.SIDE, models.TOP].filter(Boolean),
      modelsByName: models
    };
  }

  calculateIndices(attribute) {
    attribute.value = this.state.polygonTesselator.indices();
    const numVertex = attribute.value.length / attribute.size;
    this.setState({numVertex});
  }

  calculatePositions(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.positions();
  }
  calculatePositionsLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    attribute.value = this.state.polygonTesselator.positions64xyLow();
  }

  calculateNextPositions(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.nextPositions();
  }
  calculateNextPositionsLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    attribute.value = this.state.polygonTesselator.nextPositions64xyLow();
  }

  calculateElevations(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;

    const {extruded, getElevation} = this.props;
    if (extruded && typeof getElevation === 'function') {
      attribute.constant = false;
      attribute.value = polygonTesselator.elevations({
        getElevation: polygonIndex => getElevation(this.props.data[polygonIndex])
      });
    } else {
      const elevation = extruded ? getElevation : 0;
      attribute.constant = true;
      attribute.value = new Float32Array([elevation]);
    }
  }

  calculateFillColors(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.colors({
      key: 'fillColors',
      getColor: polygonIndex => this.props.getFillColor(this.props.data[polygonIndex])
    });
  }
  calculateLineColors(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.colors({
      key: 'lineColors',
      getColor: polygonIndex => this.props.getLineColor(this.props.data[polygonIndex])
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    attribute.value = this.state.polygonTesselator.pickingColors();
  }
}

SolidPolygonLayer.layerName = 'SolidPolygonLayer';
SolidPolygonLayer.defaultProps = defaultProps;
