// Copyright (c) 2016 Uber Technologies, Inc.
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

import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {get} from '../../../lib/utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';
import {enable64bitSupport} from '../../../lib/utils/fp64';
import {COORDINATE_SYSTEM} from '../../../lib';

// Polygon geometry generation is managed by the polygon tesselator
import {PolygonTesselator} from './polygon-tesselator';
import {PolygonTesselatorExtruded} from './polygon-tesselator-extruded';

// const defaultColor = [0, 0, 0, 255];

const defaultProps = {
  // Whether to extrude in 2.5D
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,
  fp64: false,

  // Accessor for polygon geometry
  getPolygon: f => get(f, 'polygon') || get(f, 'geometry.coordinates'),
  // Accessor for extrusion height
  getElevation: f => get(f, 'elevation') || get(f, 'properties.height') || 0,
  // Accessor for color
  getColor: f => get(f, 'color') || get(f, 'properties.color'),

  // Optional settings for 'lighting' shader module
  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
  }
};

export default class PolygonLayer extends Layer {
  getShaders() {
    const vs64 = readFileSync(join(__dirname, './solid-polygon-layer-vertex-64.glsl'), 'utf8');
    const vs32 = readFileSync(join(__dirname, './solid-polygon-layer-vertex.glsl'), 'utf8');
    const fs = readFileSync(join(__dirname, './solid-polygon-layer-fragment.glsl'), 'utf8');
    return enable64bitSupport(this.props) ? {
      vs: vs64, fs, modules: ['fp64', 'project64', 'lighting']
    } : {
      vs: vs32, fs, modules: ['lighting']
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({
      model: this._getModel(gl),
      numInstances: 0,
      IndexType: gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    });

    const {attributeManager} = this.state;
    const noAlloc = true;
    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {size: 3, accessor: 'getElevation', update: this.calculatePositions, noAlloc},
      normals: {size: 3, update: this.calculateNormals, noAlloc},
      colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors, noAlloc},
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc}
    });
    /* eslint-enable max-len */
  }

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.invalidateAll();

      if (props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNG_LAT) {
        attributeManager.add({
          positions64xyLow: {size: 2, update: this.calculatePositionsLow}
        });
      } else {
        attributeManager.remove([
          'positions64xyLow'
        ]);
      }
    }
  }

  draw({uniforms}) {
    const {extruded, lightSettings} = this.props;

    this.state.model.render(Object.assign({}, uniforms, {
      extruded: extruded ? 1.0 : 0.0
    },
    lightSettings));
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    const geometryChanged = this.updateGeometry({props, oldProps, changeFlags});

    // Re-generate model if geometry changed
    if (geometryChanged) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
  }

  updateGeometry({props, oldProps, changeFlags}) {
    const regenerateModel = changeFlags.dataChanged ||
      props.extruded !== oldProps.extruded ||
      props.wireframe !== oldProps.wireframe || props.fp64 !== oldProps.fp64;

    if (regenerateModel) {
      const {getPolygon, extruded, wireframe, getElevation} = props;

      // TODO - avoid creating a temporary array here: let the tesselator iterate
      const polygons = props.data.map(getPolygon);

      this.setState({
        polygonTesselator: !extruded ?
          new PolygonTesselator({polygons, fp64: this.props.fp64}) :
          new PolygonTesselatorExtruded({polygons, wireframe,
            getHeight: polygonIndex => getElevation(this.props.data[polygonIndex]),
            fp64: this.props.fp64
          })
      });

      this.state.attributeManager.invalidateAll();
    }

    return regenerateModel;
  }

  _getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());
    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: this.props.wireframe ? GL.LINES : GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  calculateIndices(attribute) {
    attribute.value = this.state.polygonTesselator.indices();
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculatePositions(attribute) {
    attribute.value = this.state.polygonTesselator.positions().positions;
  }
  calculatePositionsLow(attribute) {
    attribute.value = this.state.polygonTesselator.positions().positions64xyLow;
  }
  calculateNormals(attribute) {
    attribute.value = this.state.polygonTesselator.normals();
  }

  calculateColors(attribute) {
    attribute.value = this.state.polygonTesselator.colors({
      getColor: polygonIndex => this.props.getColor(this.props.data[polygonIndex])
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    attribute.value = this.state.polygonTesselator.pickingColors();
  }
}

PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
