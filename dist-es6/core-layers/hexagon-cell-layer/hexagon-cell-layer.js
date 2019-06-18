var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
var log = experimental.log,
    fp64ify = experimental.fp64ify,
    enable64bitSupport = experimental.enable64bitSupport;

import { GL, Model, CylinderGeometry } from 'luma.gl';

import vs from './hexagon-cell-layer-vertex.glsl';
import vs64 from './hexagon-cell-layer-vertex-64.glsl';
import fs from './hexagon-cell-layer-fragment.glsl';

var DEFAULT_COLOR = [255, 0, 255, 255];

var defaultProps = {
  hexagonVertices: null,
  radius: null,
  angle: null,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getCentroid: function getCentroid(x) {
    return x.centroid;
  },
  getColor: function getColor(x) {
    return x.color;
  },
  getElevation: function getElevation(x) {
    return x.elevation;
  },

  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.2, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

var HexagonCellLayer = function (_Layer) {
  _inherits(HexagonCellLayer, _Layer);

  function HexagonCellLayer(props) {
    _classCallCheck(this, HexagonCellLayer);

    var missingProps = false;
    if (!props.hexagonVertices && (!props.radius || !Number.isFinite(props.angle))) {
      log.once(0, 'HexagonCellLayer: Either hexagonVertices or radius and angle are ' + 'needed to calculate primitive hexagon.');
      missingProps = true;
    } else if (props.hexagonVertices && (!Array.isArray(props.hexagonVertices) || props.hexagonVertices.length < 6)) {
      log.once(0, 'HexagonCellLayer: hexagonVertices needs to be an array of 6 points');

      missingProps = true;
    }

    if (missingProps) {
      log.once(0, 'Now using 1000 meter as default radius, 0 as default angle');
      props.radius = 1000;
      props.angle = 0;
    }

    return _possibleConstructorReturn(this, (HexagonCellLayer.__proto__ || Object.getPrototypeOf(HexagonCellLayer)).call(this, props));
  }

  _createClass(HexagonCellLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting', 'picking'] } : { vs: vs, fs: fs, modules: ['lighting', 'picking'] }; // 'project' module added by default.
    }

    /**
     * DeckGL calls initializeState when GL context is available
     * Essentially a deferred constructor
     */

  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });
      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: ['getCentroid', 'getElevation'],
          update: this.calculateInstancePositions },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor',
          update: this.calculateInstanceColors }
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
          attributeManager.addInstanced({
            instancePositions64xyLow: {
              size: 2,
              accessor: 'getCentroid',
              update: this.calculateInstancePositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instancePositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(HexagonCellLayer.prototype.__proto__ || Object.getPrototypeOf(HexagonCellLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });

      this.updateUniforms();
    }
  }, {
    key: 'updateRadiusAngle',
    value: function updateRadiusAngle() {
      var angle = void 0;
      var radius = void 0;
      var hexagonVertices = this.props.hexagonVertices;


      if (Array.isArray(hexagonVertices) && hexagonVertices.length >= 6) {

        // calculate angle and vertices from hexagonVertices if provided
        var vertices = this.props.hexagonVertices;

        var vertex0 = vertices[0];
        var vertex3 = vertices[3];

        // transform to space coordinates
        var spaceCoord0 = this.projectFlat(vertex0);
        var spaceCoord3 = this.projectFlat(vertex3);

        // distance between two close centroids
        var dx = spaceCoord0[0] - spaceCoord3[0];
        var dy = spaceCoord0[1] - spaceCoord3[1];
        var dxy = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle that the perpendicular hexagon vertex axis is tilted
        angle = Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2;
        radius = dxy / 2;
      } else if (this.props.radius && Number.isFinite(this.props.angle)) {

        // if no hexagonVertices provided, try use radius & angle
        var viewport = this.context.viewport;
        // TODO - this should be a standard uniform in project package

        var _viewport$getDistance = viewport.getDistanceScales(),
            pixelsPerMeter = _viewport$getDistance.pixelsPerMeter;

        angle = this.props.angle;
        radius = this.props.radius * pixelsPerMeter[0];
      }

      return { angle: angle, radius: radius };
    }
  }, {
    key: 'getCylinderGeometry',
    value: function getCylinderGeometry(radius) {
      return new CylinderGeometry({
        radius: radius,
        topRadius: radius,
        bottomRadius: radius,
        topCap: true,
        bottomCap: true,
        height: 1,
        nradial: 6,
        nvertical: 1
      });
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      var _props = this.props,
          opacity = _props.opacity,
          elevationScale = _props.elevationScale,
          extruded = _props.extruded,
          coverage = _props.coverage,
          lightSettings = _props.lightSettings;
      var model = this.state.model;


      model.setUniforms(Object.assign({}, {
        extruded: extruded,
        opacity: opacity,
        coverage: coverage,
        elevationScale: elevationScale
      }, lightSettings));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.getCylinderGeometry(1),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;

      _get(HexagonCellLayer.prototype.__proto__ || Object.getPrototypeOf(HexagonCellLayer.prototype), 'draw', this).call(this, { uniforms: Object.assign(this.updateRadiusAngle(), uniforms) });
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getCentroid = _props2.getCentroid,
          getElevation = _props2.getElevation;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var _getCentroid = getCentroid(object),
              _getCentroid2 = _slicedToArray(_getCentroid, 2),
              lon = _getCentroid2[0],
              lat = _getCentroid2[1];

          var elevation = getElevation(object);
          value[i + 0] = lon;
          value[i + 1] = lat;
          value[i + 2] = elevation || 0;
          i += size;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'calculateInstancePositions64xyLow',
    value: function calculateInstancePositions64xyLow(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getCentroid = _props3.getCentroid;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          var position = getCentroid(object);
          value[i++] = fp64ify(position[0])[1];
          value[i++] = fp64ify(position[1])[1];
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var color = getColor(object) || DEFAULT_COLOR;

          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = Number.isFinite(color[3]) ? color[3] : DEFAULT_COLOR[3];
          i += size;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }]);

  return HexagonCellLayer;
}(Layer);

export default HexagonCellLayer;


HexagonCellLayer.layerName = 'HexagonCellLayer';
HexagonCellLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9oZXhhZ29uLWNlbGwtbGF5ZXIvaGV4YWdvbi1jZWxsLWxheWVyLmpzIl0sIm5hbWVzIjpbIkNPT1JESU5BVEVfU1lTVEVNIiwiTGF5ZXIiLCJleHBlcmltZW50YWwiLCJsb2ciLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiR0wiLCJNb2RlbCIsIkN5bGluZGVyR2VvbWV0cnkiLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJoZXhhZ29uVmVydGljZXMiLCJyYWRpdXMiLCJhbmdsZSIsImNvdmVyYWdlIiwiZWxldmF0aW9uU2NhbGUiLCJleHRydWRlZCIsImZwNjQiLCJnZXRDZW50cm9pZCIsIngiLCJjZW50cm9pZCIsImdldENvbG9yIiwiY29sb3IiLCJnZXRFbGV2YXRpb24iLCJlbGV2YXRpb24iLCJsaWdodFNldHRpbmdzIiwibGlnaHRzUG9zaXRpb24iLCJhbWJpZW50UmF0aW8iLCJkaWZmdXNlUmF0aW8iLCJzcGVjdWxhclJhdGlvIiwibGlnaHRzU3RyZW5ndGgiLCJudW1iZXJPZkxpZ2h0cyIsIkhleGFnb25DZWxsTGF5ZXIiLCJwcm9wcyIsIm1pc3NpbmdQcm9wcyIsIk51bWJlciIsImlzRmluaXRlIiwib25jZSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm1vZHVsZXMiLCJnbCIsImNvbnRleHQiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwiY29vcmRpbmF0ZVN5c3RlbSIsIkxOR0xBVCIsImluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsInVwZGF0ZVVuaWZvcm1zIiwidmVydGljZXMiLCJ2ZXJ0ZXgwIiwidmVydGV4MyIsInNwYWNlQ29vcmQwIiwicHJvamVjdEZsYXQiLCJzcGFjZUNvb3JkMyIsImR4IiwiZHkiLCJkeHkiLCJNYXRoIiwic3FydCIsImFjb3MiLCJzaWduIiwiUEkiLCJ2aWV3cG9ydCIsImdldERpc3RhbmNlU2NhbGVzIiwicGl4ZWxzUGVyTWV0ZXIiLCJ0b3BSYWRpdXMiLCJib3R0b21SYWRpdXMiLCJ0b3BDYXAiLCJib3R0b21DYXAiLCJoZWlnaHQiLCJucmFkaWFsIiwibnZlcnRpY2FsIiwib3BhY2l0eSIsInNldFVuaWZvcm1zIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJnZXRDeWxpbmRlckdlb21ldHJ5IiwiaXNJbnN0YW5jZWQiLCJzaGFkZXJDYWNoZSIsInVuaWZvcm1zIiwidXBkYXRlUmFkaXVzQW5nbGUiLCJhdHRyaWJ1dGUiLCJkYXRhIiwidmFsdWUiLCJpIiwib2JqZWN0IiwibG9uIiwibGF0IiwicG9zaXRpb24iLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGlCQUFSLEVBQTJCQyxLQUEzQixFQUFrQ0MsWUFBbEMsUUFBcUQsWUFBckQ7SUFDT0MsRyxHQUFvQ0QsWSxDQUFwQ0MsRztJQUFLQyxPLEdBQStCRixZLENBQS9CRSxPO0lBQVNDLGtCLEdBQXNCSCxZLENBQXRCRyxrQjs7QUFDckIsU0FBUUMsRUFBUixFQUFZQyxL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aEJHLE1BQWdCOztBQUN6QixjQUFNdkYsUUFBUUQsU0FBU3dGLE1BQVQsS0FBb0JwRyxhQUFsQzs7QUFFQWtHLGdCQUFNQyxJQUFJLENBQVYsSUFBZXRGLE1BQU0sQ0FBTixDQUFmO0FBQ0FxRixnQkFBTUMsSUFBSSxDQUFWLElBQWV0RixNQUFNLENBQU4sQ0FBZjtBQUNBcUYsZ0JBQU1DLElBQUksQ0FBVixJQUFldEYsTUFBTSxDQUFOLENBQWY7QUFDQXFGLGdCQUFNQyxJQUFJLENBQVYsSUFBZXpFLE9BQU9DLFFBQVAsQ0FBZ0JkLE1BQU0sQ0FBTixDQUFoQixJQUE0QkEsTUFBTSxDQUFOLENBQTVCLEdBQXVDYixjQUFjLENBQWQsQ0FBdEQ7QUFDQW1HLGVBQUt6RCxJQUFMO0FBQ0Q7QUFaZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFsQzs7OztFQXZNMkNyRCxLOztlQUF6QmtDLGdCOzs7QUEwTXJCQSxpQkFBaUJpRixTQUFqQixHQUE2QixrQkFBN0I7QUFDQWpGLGlCQUFpQnRCLFlBQWpCLEdBQWdDQSxZQUFoQyIsImZpbGUiOiJoZXhhZ29uLWNlbGwtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTSwgTGF5ZXIsIGV4cGVyaW1lbnRhbH0gZnJvbSAnLi4vLi4vY29yZSc7XG5jb25zdCB7bG9nLCBmcDY0aWZ5LCBlbmFibGU2NGJpdFN1cHBvcnR9ID0gZXhwZXJpbWVudGFsO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEN5bGluZGVyR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9oZXhhZ29uLWNlbGwtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9oZXhhZ29uLWNlbGwtbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vaGV4YWdvbi1jZWxsLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzI1NSwgMCwgMjU1LCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGhleGFnb25WZXJ0aWNlczogbnVsbCxcbiAgcmFkaXVzOiBudWxsLFxuICBhbmdsZTogbnVsbCxcbiAgY292ZXJhZ2U6IDEsXG4gIGVsZXZhdGlvblNjYWxlOiAxLFxuICBleHRydWRlZDogdHJ1ZSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgZ2V0Q2VudHJvaWQ6IHggPT4geC5jZW50cm9pZCxcbiAgZ2V0Q29sb3I6IHggPT4geC5jb2xvcixcbiAgZ2V0RWxldmF0aW9uOiB4ID0+IHguZWxldmF0aW9uLFxuXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWy0xMjIuNDUsIDM3Ljc1LCA4MDAwLCAtMTIyLjAsIDM4LjAwLCA1MDAwXSxcbiAgICBhbWJpZW50UmF0aW86IDAuNCxcbiAgICBkaWZmdXNlUmF0aW86IDAuNixcbiAgICBzcGVjdWxhclJhdGlvOiAwLjgsXG4gICAgbGlnaHRzU3RyZW5ndGg6IFsxLjIsIDAuMCwgMC44LCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAyXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhleGFnb25DZWxsTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBsZXQgbWlzc2luZ1Byb3BzID0gZmFsc2U7XG4gICAgaWYgKCFwcm9wcy5oZXhhZ29uVmVydGljZXMgJiYgKCFwcm9wcy5yYWRpdXMgfHwgIU51bWJlci5pc0Zpbml0ZShwcm9wcy5hbmdsZSkpKSB7XG4gICAgICBsb2cub25jZSgwLCAnSGV4YWdvbkNlbGxMYXllcjogRWl0aGVyIGhleGFnb25WZXJ0aWNlcyBvciByYWRpdXMgYW5kIGFuZ2xlIGFyZSAnICtcbiAgICAgICAgJ25lZWRlZCB0byBjYWxjdWxhdGUgcHJpbWl0aXZlIGhleGFnb24uJyk7XG4gICAgICBtaXNzaW5nUHJvcHMgPSB0cnVlO1xuXG4gICAgfSBlbHNlIGlmIChwcm9wcy5oZXhhZ29uVmVydGljZXMgJiYgKCFBcnJheS5pc0FycmF5KHByb3BzLmhleGFnb25WZXJ0aWNlcykgfHxcbiAgICAgIHByb3BzLmhleGFnb25WZXJ0aWNlcy5sZW5ndGggPCA2KSkge1xuICAgICAgbG9nLm9uY2UoMCwgJ0hleGFnb25DZWxsTGF5ZXI6IGhleGFnb25WZXJ0aWNlcyBuZWVkcyB0byBiZSBhbiBhcnJheSBvZiA2IHBvaW50cycpO1xuXG4gICAgICBtaXNzaW5nUHJvcHMgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChtaXNzaW5nUHJvcHMpIHtcbiAgICAgIGxvZy5vbmNlKDAsICdOb3cgdXNpbmcgMTAwMCBtZXRlciBhcyBkZWZhdWx0IHJhZGl1cywgMCBhcyBkZWZhdWx0IGFuZ2xlJyk7XG4gICAgICBwcm9wcy5yYWRpdXMgPSAxMDAwO1xuICAgICAgcHJvcHMuYW5nbGUgPSAwO1xuICAgIH1cblxuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIGdldFNoYWRlcnMoKSB7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCcsICdsaWdodGluZycsICdwaWNraW5nJ119IDpcbiAgICAgIHt2cywgZnMsIG1vZHVsZXM6IFsnbGlnaHRpbmcnLCAncGlja2luZyddfTsgLy8gJ3Byb2plY3QnIG1vZHVsZSBhZGRlZCBieSBkZWZhdWx0LlxuICB9XG5cbiAgLyoqXG4gICAqIERlY2tHTCBjYWxscyBpbml0aWFsaXplU3RhdGUgd2hlbiBHTCBjb250ZXh0IGlzIGF2YWlsYWJsZVxuICAgKiBFc3NlbnRpYWxseSBhIGRlZmVycmVkIGNvbnN0cnVjdG9yXG4gICAqL1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VQb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogWydnZXRDZW50cm9pZCcsICdnZXRFbGV2YXRpb24nXSxcbiAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlQ29sb3JzOiB7c2l6ZTogNCwgdHlwZTogR0wuVU5TSUdORURfQllURSwgYWNjZXNzb3I6ICdnZXRDb2xvcicsXG4gICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZUNvbG9yc31cbiAgICB9KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuXG4gICAgICBpZiAocHJvcHMuZnA2NCAmJiBwcm9wcy5jb29yZGluYXRlU3lzdGVtID09PSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgICAgIGluc3RhbmNlUG9zaXRpb25zNjR4eUxvdzoge1xuICAgICAgICAgICAgc2l6ZTogMixcbiAgICAgICAgICAgIGFjY2Vzc29yOiAnZ2V0Q2VudHJvaWQnLFxuICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbXG4gICAgICAgICAgJ2luc3RhbmNlUG9zaXRpb25zNjR4eUxvdydcbiAgICAgICAgXSk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBzdXBlci51cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuXG4gICAgdGhpcy51cGRhdGVVbmlmb3JtcygpO1xuICB9XG5cbiAgdXBkYXRlUmFkaXVzQW5nbGUoKSB7XG4gICAgbGV0IGFuZ2xlO1xuICAgIGxldCByYWRpdXM7XG4gICAgY29uc3Qge2hleGFnb25WZXJ0aWNlc30gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaGV4YWdvblZlcnRpY2VzKSAmJiBoZXhhZ29uVmVydGljZXMubGVuZ3RoID49IDYpIHtcblxuICAgICAgLy8gY2FsY3VsYXRlIGFuZ2xlIGFuZCB2ZXJ0aWNlcyBmcm9tIGhleGFnb25WZXJ0aWNlcyBpZiBwcm92aWRlZFxuICAgICAgY29uc3QgdmVydGljZXMgPSB0aGlzLnByb3BzLmhleGFnb25WZXJ0aWNlcztcblxuICAgICAgY29uc3QgdmVydGV4MCA9IHZlcnRpY2VzWzBdO1xuICAgICAgY29uc3QgdmVydGV4MyA9IHZlcnRpY2VzWzNdO1xuXG4gICAgICAvLyB0cmFuc2Zvcm0gdG8gc3BhY2UgY29vcmRpbmF0ZXNcbiAgICAgIGNvbnN0IHNwYWNlQ29vcmQwID0gdGhpcy5wcm9qZWN0RmxhdCh2ZXJ0ZXgwKTtcbiAgICAgIGNvbnN0IHNwYWNlQ29vcmQzID0gdGhpcy5wcm9qZWN0RmxhdCh2ZXJ0ZXgzKTtcblxuICAgICAgLy8gZGlzdGFuY2UgYmV0d2VlbiB0d28gY2xvc2UgY2VudHJvaWRzXG4gICAgICBjb25zdCBkeCA9IHNwYWNlQ29vcmQwWzBdIC0gc3BhY2VDb29yZDNbMF07XG4gICAgICBjb25zdCBkeSA9IHNwYWNlQ29vcmQwWzFdIC0gc3BhY2VDb29yZDNbMV07XG4gICAgICBjb25zdCBkeHkgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gICAgICAvLyBDYWxjdWxhdGUgYW5nbGUgdGhhdCB0aGUgcGVycGVuZGljdWxhciBoZXhhZ29uIHZlcnRleCBheGlzIGlzIHRpbHRlZFxuICAgICAgYW5nbGUgPSBNYXRoLmFjb3MoZHggLyBkeHkpICogLU1hdGguc2lnbihkeSkgKyBNYXRoLlBJIC8gMjtcbiAgICAgIHJhZGl1cyA9IGR4eSAvIDI7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucmFkaXVzICYmIE51bWJlci5pc0Zpbml0ZSh0aGlzLnByb3BzLmFuZ2xlKSkge1xuXG4gICAgICAvLyBpZiBubyBoZXhhZ29uVmVydGljZXMgcHJvdmlkZWQsIHRyeSB1c2UgcmFkaXVzICYgYW5nbGVcbiAgICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICAvLyBUT0RPIC0gdGhpcyBzaG91bGQgYmUgYSBzdGFuZGFyZCB1bmlmb3JtIGluIHByb2plY3QgcGFja2FnZVxuICAgICAgY29uc3Qge3BpeGVsc1Blck1ldGVyfSA9IHZpZXdwb3J0LmdldERpc3RhbmNlU2NhbGVzKCk7XG5cbiAgICAgIGFuZ2xlID0gdGhpcy5wcm9wcy5hbmdsZTtcbiAgICAgIHJhZGl1cyA9IHRoaXMucHJvcHMucmFkaXVzICogcGl4ZWxzUGVyTWV0ZXJbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHthbmdsZSwgcmFkaXVzfTtcbiAgfVxuXG4gIGdldEN5bGluZGVyR2VvbWV0cnkocmFkaXVzKSB7XG4gICAgcmV0dXJuIG5ldyBDeWxpbmRlckdlb21ldHJ5KHtcbiAgICAgIHJhZGl1cyxcbiAgICAgIHRvcFJhZGl1czogcmFkaXVzLFxuICAgICAgYm90dG9tUmFkaXVzOiByYWRpdXMsXG4gICAgICB0b3BDYXA6IHRydWUsXG4gICAgICBib3R0b21DYXA6IHRydWUsXG4gICAgICBoZWlnaHQ6IDEsXG4gICAgICBucmFkaWFsOiA2LFxuICAgICAgbnZlcnRpY2FsOiAxXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVVbmlmb3JtcygpIHtcbiAgICBjb25zdCB7b3BhY2l0eSwgZWxldmF0aW9uU2NhbGUsIGV4dHJ1ZGVkLCBjb3ZlcmFnZSwgbGlnaHRTZXR0aW5nc30gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgbW9kZWwuc2V0VW5pZm9ybXMoT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgZXh0cnVkZWQsXG4gICAgICBvcGFjaXR5LFxuICAgICAgY292ZXJhZ2UsXG4gICAgICBlbGV2YXRpb25TY2FsZVxuICAgIH0sXG4gICAgbGlnaHRTZXR0aW5ncykpO1xuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IHRoaXMuZ2V0Q3lsaW5kZXJHZW9tZXRyeSgxKSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIHN1cGVyLmRyYXcoe3VuaWZvcm1zOiBPYmplY3QuYXNzaWduKHRoaXMudXBkYXRlUmFkaXVzQW5nbGUoKSwgdW5pZm9ybXMpfSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q2VudHJvaWQsIGdldEVsZXZhdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IFtsb24sIGxhdF0gPSBnZXRDZW50cm9pZChvYmplY3QpO1xuICAgICAgY29uc3QgZWxldmF0aW9uID0gZ2V0RWxldmF0aW9uKG9iamVjdCk7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBsb247XG4gICAgICB2YWx1ZVtpICsgMV0gPSBsYXQ7XG4gICAgICB2YWx1ZVtpICsgMl0gPSBlbGV2YXRpb24gfHwgMDtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENlbnRyb2lkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRDZW50cm9pZChvYmplY3QpO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMV0pWzFdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3Iob2JqZWN0KSB8fCBERUZBVUxUX0NPTE9SO1xuXG4gICAgICB2YWx1ZVtpICsgMF0gPSBjb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gY29sb3JbMl07XG4gICAgICB2YWx1ZVtpICsgM10gPSBOdW1iZXIuaXNGaW5pdGUoY29sb3JbM10pID8gY29sb3JbM10gOiBERUZBVUxUX0NPTE9SWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxufVxuXG5IZXhhZ29uQ2VsbExheWVyLmxheWVyTmFtZSA9ICdIZXhhZ29uQ2VsbExheWVyJztcbkhleGFnb25DZWxsTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19