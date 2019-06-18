var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import { COORDINATE_SYSTEM, Layer, experimental } from '../../core';
var enable64bitSupport = experimental.enable64bitSupport,
    get = experimental.get;

import { GL, Model, Geometry } from 'luma.gl';
import { compareProps } from '../../core/lib/props';

// Polygon geometry generation is managed by the polygon tesselator
import { PolygonTesselator } from './polygon-tesselator';
import { PolygonTesselatorExtruded } from './polygon-tesselator-extruded';

import vs from './solid-polygon-layer-vertex.glsl';
import vs64 from './solid-polygon-layer-vertex-64.glsl';
import fs from './solid-polygon-layer-fragment.glsl';

var defaultProps = {
  // Whether to extrude
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,
  fp64: false,

  // elevation multiplier
  elevationScale: 1,

  // Accessor for polygon geometry
  getPolygon: function getPolygon(f) {
    return get(f, 'polygon') || get(f, 'geometry.coordinates');
  },
  // Accessor for extrusion height
  getElevation: function getElevation(f) {
    return get(f, 'elevation') || get(f, 'properties.height') || 0;
  },
  // Accessor for color
  getColor: function getColor(f) {
    return get(f, 'color') || get(f, 'properties.color');
  },

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

var SolidPolygonLayer = function (_Layer) {
  _inherits(SolidPolygonLayer, _Layer);

  function SolidPolygonLayer() {
    _classCallCheck(this, SolidPolygonLayer);

    return _possibleConstructorReturn(this, (SolidPolygonLayer.__proto__ || Object.getPrototypeOf(SolidPolygonLayer)).apply(this, arguments));
  }

  _createClass(SolidPolygonLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting', 'picking'] } : { vs: vs, fs: fs, modules: ['lighting', 'picking'] }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({
        model: this._getModel(gl),
        numInstances: 0,
        IndexType: gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
      });

      var attributeManager = this.state.attributeManager;

      var noAlloc = true;
      /* eslint-disable max-len */
      attributeManager.add({
        indices: { size: 1, isIndexed: true, update: this.calculateIndices, noAlloc: noAlloc },
        positions: { size: 3, accessor: 'getElevation', update: this.calculatePositions, noAlloc: noAlloc },
        normals: { size: 3, update: this.calculateNormals, noAlloc: noAlloc },
        colors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors, noAlloc: noAlloc },
        pickingColors: { size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc: noAlloc }
      });
      /* eslint-enable max-len */
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.add({
            positions64xyLow: { size: 2, update: this.calculatePositionsLow }
          });
        } else {
          attributeManager.remove(['positions64xyLow']);
        }
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var _props = this.props,
          extruded = _props.extruded,
          lightSettings = _props.lightSettings,
          elevationScale = _props.elevationScale;
      var viewport = this.context.viewport;


      this.state.model.render(Object.assign({}, uniforms, {
        extruded: extruded ? 1.0 : 0.0,
        elevationScale: elevationScale,
        pixelsPerUnit: viewport.getDistanceScales().pixelsPerDegree
      }, lightSettings));
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref3) {
      var props = _ref3.props,
          oldProps = _ref3.oldProps,
          changeFlags = _ref3.changeFlags;

      _get(SolidPolygonLayer.prototype.__proto__ || Object.getPrototypeOf(SolidPolygonLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

      var regenerateModel = this.updateGeometry({ props: props, oldProps: oldProps, changeFlags: changeFlags });

      if (regenerateModel) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
    }
  }, {
    key: 'updateGeometry',
    value: function updateGeometry(_ref4) {
      var _this2 = this;

      var props = _ref4.props,
          oldProps = _ref4.oldProps,
          changeFlags = _ref4.changeFlags;

      var geometryConfigChanged = props.extruded !== oldProps.extruded || props.wireframe !== oldProps.wireframe || props.fp64 !== oldProps.fp64 || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);

      // check if updateTriggers.getElevation has been triggered
      var getElevationTriggered = changeFlags.updateTriggersChanged && compareProps({
        oldProps: oldProps.updateTriggers.getElevation || {},
        newProps: props.updateTriggers.getElevation || {},
        triggerName: 'getElevation'
      });

      // When the geometry config  or the data is changed,
      // tessellator needs to be invoked
      if (changeFlags.dataChanged || geometryConfigChanged || getElevationTriggered) {
        var getPolygon = props.getPolygon,
            extruded = props.extruded,
            wireframe = props.wireframe,
            getElevation = props.getElevation;

        // TODO - avoid creating a temporary array here: let the tesselator iterate

        var polygons = props.data.map(getPolygon);

        this.setState({
          polygonTesselator: !extruded ? new PolygonTesselator({ polygons: polygons, fp64: this.props.fp64 }) : new PolygonTesselatorExtruded({ polygons: polygons, wireframe: wireframe,
            getHeight: function getHeight(polygonIndex) {
              return getElevation(_this2.props.data[polygonIndex]);
            },
            fp64: this.props.fp64
          })
        });

        this.state.attributeManager.invalidateAll();
      }

      return geometryConfigChanged;
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: this.props.wireframe ? GL.LINES : GL.TRIANGLES,
          attributes: {}
        }),
        vertexCount: 0,
        isIndexed: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateIndices',
    value: function calculateIndices(attribute) {
      attribute.value = this.state.polygonTesselator.indices();
      attribute.target = GL.ELEMENT_ARRAY_BUFFER;
      this.state.model.setVertexCount(attribute.value.length / attribute.size);
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      attribute.value = this.state.polygonTesselator.positions().positions;
    }
  }, {
    key: 'calculatePositionsLow',
    value: function calculatePositionsLow(attribute) {
      attribute.value = this.state.polygonTesselator.positions().positions64xyLow;
    }
  }, {
    key: 'calculateNormals',
    value: function calculateNormals(attribute) {
      attribute.value = this.state.polygonTesselator.normals();
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _this3 = this;

      attribute.value = this.state.polygonTesselator.colors({
        getColor: function getColor(polygonIndex) {
          return _this3.props.getColor(_this3.props.data[polygonIndex]);
        }
      });
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      attribute.value = this.state.polygonTesselator.pickingColors();
    }
  }]);

  return SolidPolygonLayer;
}(Layer);

export default SolidPolygonLayer;


SolidPolygonLayer.layerName = 'SolidPolygonLayer';
SolidPolygonLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zb2xpZC1wb2x5Z29uLWxheWVyL3NvbGlkLXBvbHlnb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiQ09PUkRJTkFURV9TWVNURU0iLCJMYXllciIsImV4cGVyaW1lbnRhbCIsImVuYWJsZTY0Yml0U3VwcG9ydCIsImdldCIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsImNvbXBhcmVQcm9wcyIsIlBvbHlnb25UZXNzZWxhdG9yIiwiUG9seWdvblRlc3NlbGF0b3JFeHRydWRlZCIsInZzIiwidnM2NCIsImZzIiwiZGVmYXVsdFByb3BzIiwiZXh0cnVkZWQiLCJ3aXJlZnJhbWUiLCJmcDY0IiwiZWxldmF0aW9uU2NhbGUiLCJnZXRQb2x5Z29uIiwiZiIsImdldEVsZXZhdGlvbiIsImdldENvbG9yIiwibGlnaHRTZXR0aW5ncyIsImxpZ2h0c1Bvc2l0aW9uIiwiYW1iaWVudFJhdGlvIiwiZGlmZnVzZVJhdGlvIiwic3BlY3VsYXJSYXRpbyIsImxpZ2h0c1N0cmVuZ3RoIiwibnVtYmVyT2ZMaWdodHMiLCJTb2xpZFBvbHlnb25MYXllciIsInByb3BzIiwibW9kdWxlcyIsImdsIiwiY29udGV4dCIsInNldFN0YXRlIiwibW9kZWwiLCJfZ2V0TW9kZWwiLCJudW1JbnN0YW5jZXMiLCJJbmRleFR5cGUiLCJnZXRFeHRlbnNpb24iLCJVaW50MzJBcnJheSIsIlVpbnQxNkFycmF5IiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwibm9BbGxvYyIsImFkZCIsImluZGljZXMiLCJzaXplIiwiaXNJbmRleGVkIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5kaWNlcyIsInBvc2l0aW9ucyIsImFjY2Vzc29yIiwiY2FsY3VsYXRlUG9zaXRpb25zIiwibm9ybWFscyIsImNhbGN1bGF0ZU5vcm1hbHMiLCJjb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUNvbG9ycyIsInBpY2tpbmdDb2xvcnMiLCJjYWxjdWxhdGVQaWNraW5nQ29sb3JzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImludmFsaWRhdGVBbGwiLCJjb29yZGluYXRlU3lzdGVtIiwiTE5HTEFUIiwicG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZVBvc2l0aW9uc0xvdyIsInJlbW92ZSIsInVuaWZvcm1zIiwidmlld3BvcnQiLCJyZW5kZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJwaXhlbHNQZXJVbml0IiwiZ2V0RGlzdGFuY2VTY2FsZXMiLCJwaXhlbHNQZXJEZWdyZWUiLCJyZWdlbmVyYXRlTW9kZWwiLCJ1cGRhdGVHZW9tZXRyeSIsInVwZGF0ZUF0dHJpYnV0ZSIsImdlb21ldHJ5Q29uZmlnQ2hhbmdlZCIsInVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCIsImFsbCIsImdldEVsZXZhdGlvblRyaWdnZXJlZCIsInVwZGF0ZVRyaWdnZXJzIiwibmV3UHJvcHMiLCJ0cmlnZ2VyTmFtZSIsImRhdGFDaGFuZ2VkIiwicG9seWdvbnMiLCJkYXRhIiwibWFwIiwicG9seWdvblRlc3NlbGF0b3IiLCJnZXRIZWlnaHQiLCJwb2x5Z29uSW5kZXgiLCJnZXRTaGFkZXJzIiwiaWQiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiTElORVMiLCJUUklBTkdMRVMiLCJhdHRyaWJ1dGVzIiwidmVydGV4Q291bnQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsInZhbHVlIiwidGFyZ2V0IiwiRUxFTUVOVF9BUlJBWV9CVUZGRVIiLCJzZXRWZXJ0ZXhDb3VudCIsImxlbmd0aCIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGlCQUFSLEVBQTJCQyxLQUEzQixFQUFrQ0MsWUFBbEMsUUFBcUQsWUFBckQ7SUFDT0Msa0IsR0FBMkJELFksQ0FBM0JDLGtCO0lBQW9CQyxHLEdB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Ozs7b0NBRWVrRCxTLEVBQVc7QUFBQTs7QUFDekJBLGdCQUFVQyxLQUFWLEdBQWtCLEtBQUs5RCxLQUFMLENBQVdpRCxpQkFBWCxDQUE2QnBDLE1BQTdCLENBQW9DO0FBQ3BEbkMsa0JBQVU7QUFBQSxpQkFBZ0IsT0FBS1MsS0FBTCxDQUFXVCxRQUFYLENBQW9CLE9BQUtTLEtBQUwsQ0FBVzRELElBQVgsQ0FBZ0JJLFlBQWhCLENBQXBCLENBQWhCO0FBQUE7QUFEMEMsT0FBcEMsQ0FBbEI7QUFHRDs7QUFFRDs7OzsyQ0FDdUJVLFMsRUFBVztBQUNoQ0EsZ0JBQVVDLEtBQVYsR0FBa0IsS0FBSzlELEtBQUwsQ0FBV2lELGlCQUFYLENBQTZCaEMsYUFBN0IsRUFBbEI7QUFDRDs7OztFQWpKNEM1RCxLOztlQUExQjZCLGlCOzs7QUFvSnJCQSxrQkFBa0JpRixTQUFsQixHQUE4QixtQkFBOUI7QUFDQWpGLGtCQUFrQmhCLFlBQWxCLEdBQWlDQSxZQUFqQyIsImZpbGUiOiJzb2xpZC1wb2x5Z29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Q09PUkRJTkFURV9TWVNURU0sIExheWVyLCBleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2VuYWJsZTY0Yml0U3VwcG9ydCwgZ2V0fSA9IGV4cGVyaW1lbnRhbDtcbmltcG9ydCB7R0wsIE1vZGVsLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQge2NvbXBhcmVQcm9wc30gZnJvbSAnLi4vLi4vY29yZS9saWIvcHJvcHMnO1xuXG4vLyBQb2x5Z29uIGdlb21ldHJ5IGdlbmVyYXRpb24gaXMgbWFuYWdlZCBieSB0aGUgcG9seWdvbiB0ZXNzZWxhdG9yXG5pbXBvcnQge1BvbHlnb25UZXNzZWxhdG9yfSBmcm9tICcuL3BvbHlnb24tdGVzc2VsYXRvcic7XG5pbXBvcnQge1BvbHlnb25UZXNzZWxhdG9yRXh0cnVkZWR9IGZyb20gJy4vcG9seWdvbi10ZXNzZWxhdG9yLWV4dHJ1ZGVkJztcblxuaW1wb3J0IHZzIGZyb20gJy4vc29saWQtcG9seWdvbi1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3NvbGlkLXBvbHlnb24tbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vc29saWQtcG9seWdvbi1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAvLyBXaGV0aGVyIHRvIGV4dHJ1ZGVcbiAgZXh0cnVkZWQ6IGZhbHNlLFxuICAvLyBXaGV0aGVyIHRvIGRyYXcgYSBHTC5MSU5FUyB3aXJlZnJhbWUgb2YgdGhlIHBvbHlnb25cbiAgd2lyZWZyYW1lOiBmYWxzZSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgLy8gZWxldmF0aW9uIG11bHRpcGxpZXJcbiAgZWxldmF0aW9uU2NhbGU6IDEsXG5cbiAgLy8gQWNjZXNzb3IgZm9yIHBvbHlnb24gZ2VvbWV0cnlcbiAgZ2V0UG9seWdvbjogZiA9PiBnZXQoZiwgJ3BvbHlnb24nKSB8fCBnZXQoZiwgJ2dlb21ldHJ5LmNvb3JkaW5hdGVzJyksXG4gIC8vIEFjY2Vzc29yIGZvciBleHRydXNpb24gaGVpZ2h0XG4gIGdldEVsZXZhdGlvbjogZiA9PiBnZXQoZiwgJ2VsZXZhdGlvbicpIHx8IGdldChmLCAncHJvcGVydGllcy5oZWlnaHQnKSB8fCAwLFxuICAvLyBBY2Nlc3NvciBmb3IgY29sb3JcbiAgZ2V0Q29sb3I6IGYgPT4gZ2V0KGYsICdjb2xvcicpIHx8IGdldChmLCAncHJvcGVydGllcy5jb2xvcicpLFxuXG4gIC8vIE9wdGlvbmFsIHNldHRpbmdzIGZvciAnbGlnaHRpbmcnIHNoYWRlciBtb2R1bGVcbiAgbGlnaHRTZXR0aW5nczoge1xuICAgIGxpZ2h0c1Bvc2l0aW9uOiBbLTEyMi40NSwgMzcuNzUsIDgwMDAsIC0xMjIuMCwgMzguMDAsIDUwMDBdLFxuICAgIGFtYmllbnRSYXRpbzogMC4wNSxcbiAgICBkaWZmdXNlUmF0aW86IDAuNixcbiAgICBzcGVjdWxhclJhdGlvOiAwLjgsXG4gICAgbGlnaHRzU3RyZW5ndGg6IFsyLjAsIDAuMCwgMC4wLCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAyXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbGlkUG9seWdvbkxheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnLCAnbGlnaHRpbmcnLCAncGlja2luZyddfSA6XG4gICAgICB7dnMsIGZzLCBtb2R1bGVzOiBbJ2xpZ2h0aW5nJywgJ3BpY2tpbmcnXX07IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKSxcbiAgICAgIG51bUluc3RhbmNlczogMCxcbiAgICAgIEluZGV4VHlwZTogZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfZWxlbWVudF9pbmRleF91aW50JykgPyBVaW50MzJBcnJheSA6IFVpbnQxNkFycmF5XG4gICAgfSk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IG5vQWxsb2MgPSB0cnVlO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZCh7XG4gICAgICBpbmRpY2VzOiB7c2l6ZTogMSwgaXNJbmRleGVkOiB0cnVlLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5kaWNlcywgbm9BbGxvY30sXG4gICAgICBwb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldEVsZXZhdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnMsIG5vQWxsb2N9LFxuICAgICAgbm9ybWFsczoge3NpemU6IDMsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVOb3JtYWxzLCBub0FsbG9jfSxcbiAgICAgIGNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzLCBub0FsbG9jfSxcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCB0eXBlOiBHTC5VTlNJR05FRF9CWVRFLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgbm9BbGxvY31cbiAgICB9KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuXG4gICAgICBpZiAocHJvcHMuZnA2NCAmJiBwcm9wcy5jb29yZGluYXRlU3lzdGVtID09PSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGQoe1xuICAgICAgICAgIHBvc2l0aW9uczY0eHlMb3c6IHtzaXplOiAyLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zTG93fVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAncG9zaXRpb25zNjR4eUxvdydcbiAgICAgICAgXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge2V4dHJ1ZGVkLCBsaWdodFNldHRpbmdzLCBlbGV2YXRpb25TY2FsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICB0aGlzLnN0YXRlLm1vZGVsLnJlbmRlcihPYmplY3QuYXNzaWduKHt9LCB1bmlmb3Jtcywge1xuICAgICAgZXh0cnVkZWQ6IGV4dHJ1ZGVkID8gMS4wIDogMC4wLFxuICAgICAgZWxldmF0aW9uU2NhbGUsXG4gICAgICBwaXhlbHNQZXJVbml0OiB2aWV3cG9ydC5nZXREaXN0YW5jZVNjYWxlcygpLnBpeGVsc1BlckRlZ3JlZVxuICAgIH0sXG4gICAgbGlnaHRTZXR0aW5ncykpO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcblxuICAgIGNvbnN0IHJlZ2VuZXJhdGVNb2RlbCA9IHRoaXMudXBkYXRlR2VvbWV0cnkoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcblxuICAgIGlmIChyZWdlbmVyYXRlTW9kZWwpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICB1cGRhdGVHZW9tZXRyeSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBjb25zdCBnZW9tZXRyeUNvbmZpZ0NoYW5nZWQgPSBwcm9wcy5leHRydWRlZCAhPT0gb2xkUHJvcHMuZXh0cnVkZWQgfHxcbiAgICAgIHByb3BzLndpcmVmcmFtZSAhPT0gb2xkUHJvcHMud2lyZWZyYW1lIHx8IHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQgfHxcbiAgICAgIChjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQgJiYgKFxuICAgICAgICBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQuYWxsIHx8XG4gICAgICAgIGNoYW5nZUZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZC5nZXRQb2x5Z29uKSk7XG5cbiAgICAvLyBjaGVjayBpZiB1cGRhdGVUcmlnZ2Vycy5nZXRFbGV2YXRpb24gaGFzIGJlZW4gdHJpZ2dlcmVkXG4gICAgY29uc3QgZ2V0RWxldmF0aW9uVHJpZ2dlcmVkID0gY2hhbmdlRmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkICYmXG4gICAgICBjb21wYXJlUHJvcHMoe1xuICAgICAgICBvbGRQcm9wczogb2xkUHJvcHMudXBkYXRlVHJpZ2dlcnMuZ2V0RWxldmF0aW9uIHx8IHt9LFxuICAgICAgICBuZXdQcm9wczogcHJvcHMudXBkYXRlVHJpZ2dlcnMuZ2V0RWxldmF0aW9uIHx8IHt9LFxuICAgICAgICB0cmlnZ2VyTmFtZTogJ2dldEVsZXZhdGlvbidcbiAgICAgIH0pO1xuXG4gICAgLy8gV2hlbiB0aGUgZ2VvbWV0cnkgY29uZmlnICBvciB0aGUgZGF0YSBpcyBjaGFuZ2VkLFxuICAgIC8vIHRlc3NlbGxhdG9yIG5lZWRzIHRvIGJlIGludm9rZWRcbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHwgZ2VvbWV0cnlDb25maWdDaGFuZ2VkIHx8IGdldEVsZXZhdGlvblRyaWdnZXJlZCkge1xuICAgICAgY29uc3Qge2dldFBvbHlnb24sIGV4dHJ1ZGVkLCB3aXJlZnJhbWUsIGdldEVsZXZhdGlvbn0gPSBwcm9wcztcblxuICAgICAgLy8gVE9ETyAtIGF2b2lkIGNyZWF0aW5nIGEgdGVtcG9yYXJ5IGFycmF5IGhlcmU6IGxldCB0aGUgdGVzc2VsYXRvciBpdGVyYXRlXG4gICAgICBjb25zdCBwb2x5Z29ucyA9IHByb3BzLmRhdGEubWFwKGdldFBvbHlnb24pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcG9seWdvblRlc3NlbGF0b3I6ICFleHRydWRlZCA/XG4gICAgICAgICAgbmV3IFBvbHlnb25UZXNzZWxhdG9yKHtwb2x5Z29ucywgZnA2NDogdGhpcy5wcm9wcy5mcDY0fSkgOlxuICAgICAgICAgIG5ldyBQb2x5Z29uVGVzc2VsYXRvckV4dHJ1ZGVkKHtwb2x5Z29ucywgd2lyZWZyYW1lLFxuICAgICAgICAgICAgZ2V0SGVpZ2h0OiBwb2x5Z29uSW5kZXggPT4gZ2V0RWxldmF0aW9uKHRoaXMucHJvcHMuZGF0YVtwb2x5Z29uSW5kZXhdKSxcbiAgICAgICAgICAgIGZwNjQ6IHRoaXMucHJvcHMuZnA2NFxuICAgICAgICAgIH0pXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdGF0ZS5hdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VvbWV0cnlDb25maWdDaGFuZ2VkO1xuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiB0aGlzLnByb3BzLndpcmVmcmFtZSA/IEdMLkxJTkVTIDogR0wuVFJJQU5HTEVTLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7fVxuICAgICAgfSksXG4gICAgICB2ZXJ0ZXhDb3VudDogMCxcbiAgICAgIGlzSW5kZXhlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbmRpY2VzKGF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IHRoaXMuc3RhdGUucG9seWdvblRlc3NlbGF0b3IuaW5kaWNlcygpO1xuICAgIGF0dHJpYnV0ZS50YXJnZXQgPSBHTC5FTEVNRU5UX0FSUkFZX0JVRkZFUjtcbiAgICB0aGlzLnN0YXRlLm1vZGVsLnNldFZlcnRleENvdW50KGF0dHJpYnV0ZS52YWx1ZS5sZW5ndGggLyBhdHRyaWJ1dGUuc2l6ZSk7XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gdGhpcy5zdGF0ZS5wb2x5Z29uVGVzc2VsYXRvci5wb3NpdGlvbnMoKS5wb3NpdGlvbnM7XG4gIH1cbiAgY2FsY3VsYXRlUG9zaXRpb25zTG93KGF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IHRoaXMuc3RhdGUucG9seWdvblRlc3NlbGF0b3IucG9zaXRpb25zKCkucG9zaXRpb25zNjR4eUxvdztcbiAgfVxuICBjYWxjdWxhdGVOb3JtYWxzKGF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IHRoaXMuc3RhdGUucG9seWdvblRlc3NlbGF0b3Iubm9ybWFscygpO1xuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IHRoaXMuc3RhdGUucG9seWdvblRlc3NlbGF0b3IuY29sb3JzKHtcbiAgICAgIGdldENvbG9yOiBwb2x5Z29uSW5kZXggPT4gdGhpcy5wcm9wcy5nZXRDb2xvcih0aGlzLnByb3BzLmRhdGFbcG9seWdvbkluZGV4XSlcbiAgICB9KTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHBpY2tpbmcgY29sb3JzIGNhbGN1bGF0aW9uXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gdGhpcy5zdGF0ZS5wb2x5Z29uVGVzc2VsYXRvci5waWNraW5nQ29sb3JzKCk7XG4gIH1cbn1cblxuU29saWRQb2x5Z29uTGF5ZXIubGF5ZXJOYW1lID0gJ1NvbGlkUG9seWdvbkxheWVyJztcblNvbGlkUG9seWdvbkxheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==