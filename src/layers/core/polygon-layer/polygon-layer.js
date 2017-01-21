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
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

// Polygon geometry generation is managed by the polygon tesselator
import {Container, getGeojsonFeatures, featureToPolygons} from '../../../lib/utils';
import {PolygonTesselator} from './polygon-tesselator';
import {PolygonTesselatorExtruded} from './polygon-tesselator-extruded';

// Light settings are used in 3d mode
// const defaultLightSettings = {
//   color: [180, 180, 200],
//   ambientColor: [255, 255, 255],
//   pointlightAmbientCoefficient: 0.1,
//   pointlightLocation: [40.4406, -79.9959, 100],
//   pointlightColor: [255, 255, 255],
//   pointlightAttenuation: 1.0,
//   materialSpecularColor: [255, 255, 255],
//   materialShininess: 1
// };

const defaultProps = {
  extruded: false,
  wireframe: false,
  color: [0, 0, 255, 255],
  getPolygons: feature => featureToPolygons(feature),
  getColor: feature => Container.get(feature, 'properties.color') || Container.get(feature, 'color')
};

export default class PolygonLayer extends Layer {
  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './polygon-layer-vertex.glsl'), 'utf8'),
      // vs: readFileSync(join(__dirname, './polygon-layer-vertex-3d.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './polygon-layer-fragment.glsl'), 'utf8')
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

  updateState({oldProps, props, changeFlags}) {
    const {attributeManager} = this.state;
    const {getPolygons, extruded, wireframe} = props;

    const geometryChanged =
      props.extruded !== oldProps.extruded ||
      props.wireframe !== oldProps.wireframe;

    if (changeFlags.dataChanged || geometryChanged) {
      // Extract polygons from data (each object can have multiple polygons)
      // Also build a matching object array
      const polygons = [];
      const features = [];
      Container.forEach(getGeojsonFeatures(props.data), feature =>
        Container.forEach(getPolygons(feature), (polygon, i) => {
          polygons.push(polygon);
          features.push(feature);
        })
      );

      this.setState({
        features,
        polygonTesselator: extruded ?
          new PolygonTesselatorExtruded({polygons, wireframe}) :
          new PolygonTesselator({polygons})
      });

      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== props.opacity) {
      this.setUniforms({opacity: props.opacity});
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

  calculateColors(attribute) {
    attribute.value = this.state.polygonTesselator.colors({
      getColor: polygonIndex => {
        return this.props.getColor(this.state.features[polygonIndex]);
      }
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    attribute.value = this.state.polygonTesselator.pickingColors();
  }
}

PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
