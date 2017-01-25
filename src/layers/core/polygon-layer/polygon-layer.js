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
import {assembleShaders, lighting} from '../../../shader-utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

// Polygon geometry generation is managed by the polygon tesselator
import {Container} from '../../../lib/utils';
import {PolygonTesselator} from './polygon-tesselator';
import {PolygonTesselatorExtruded} from './polygon-tesselator-extruded';

// const defaultColor = [0, 0, 0, 255];

const defaultProps = {
  // Whether to extrude in 2.5D
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  // TODO - not clear that this should be part of the main layer
  wireframe: false,
  // Accessor for polygon geometry
  getPolygon: f => Container.get(f, 'polygon') || Container.get(f, 'geometry.coordinates'),
  // Accessor for extrusion height
  getHeight: f => Container.get(f, 'height') || Container.get(f, 'properties.height') || 0,
  // Accessor for color
  getColor: f => Container.get(f, 'color') || Container.get(f, 'properties.color'),
  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

export default class PolygonLayer extends Layer {
  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './polygon-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './polygon-layer-fragment.glsl'), 'utf8'),
      modules: ['lighting']
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({
      model: this.getModel(gl),
      numInstances: 0,
      IndexType: gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    });

    const {attributeManager} = this.state;
    const noAlloc = true;
    attributeManager.addDynamic({
      indices: {size: 1, update: this.calculateIndices, isIndexed: true, noAlloc},
      positions: {size: 3, update: this.calculatePositions, noAlloc},
      normals: {size: 3, update: this.calculateNormals, noAlloc},
      colors: {
        type: GL.UNSIGNED_BYTE,
        size: 4,
        update: this.calculateColors,
        noAlloc
      },
      pickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        update: this.calculatePickingColors,
        noAlloc
      }
    });
  }

  updateState({props, oldProps, changeFlags}) {
    this.updateGeometry({props, oldProps, changeFlags});

    if (props.extruded) {
      this.setUniforms(lighting.updateSettings({
        settings: props.lightSettings,
        prevSettings: oldProps.lightSettings
      }));
    } else {
      this.setUniforms(lighting.updateSettings({settings: {enabled: false}}));
    }
  }

  updateGeometry({props, oldProps, changeFlags}) {
    const geometryChanged =
      props.extruded !== oldProps.extruded ||
      props.wireframe !== oldProps.wireframe;

    if (changeFlags.dataChanged || geometryChanged) {
      const {getPolygon, extruded, wireframe, getHeight} = props;

      // TODO - avoid creating a temporary array here: let the tesselator iterate
      const polygons = [];
      Container.forEach(props.data, feature => polygons.push(getPolygon(feature) || []));

      this.setState({
        polygonTesselator: !extruded ?
          new PolygonTesselator({polygons}) :
          new PolygonTesselatorExtruded({polygons, wireframe,
            getHeight: polygonIndex => getHeight(this.props.data[polygonIndex])
          })
      });

      this.state.attributeManager.invalidateAll();
    }
  }

  pick(opts) {
    super.pick(opts);
    const {info} = opts;
    if (!info) {
      return;
    }
    const index = info.index;
    const feature = index >= 0 ? this.props.data[index] : null;
    info.feature = feature;
    info.object = feature;
  }

  getModel(gl) {
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
    attribute.value = this.state.polygonTesselator.positions();
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
