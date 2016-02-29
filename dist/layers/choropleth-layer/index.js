'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mapLayer = require('../map-layer');

var _mapLayer2 = _interopRequireDefault(_mapLayer);

var _earcut = require('earcut');

var _earcut2 = _interopRequireDefault(_earcut);

var _lodash = require('lodash.flattendeep');

var _lodash2 = _interopRequireDefault(_lodash);

var _geojsonNormalize = require('geojson-normalize');

var _geojsonNormalize2 = _interopRequireDefault(_geojsonNormalize);

var _luma = require('luma.gl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2015 Uber Technologies, Inc.
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

var glslify = require('glslify');

var ATTRIBUTES = {
  vertices: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  instances: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' }
  // Override picking colors to prevent auto allocation
  // pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

var ChoroplethLayer = function (_MapLayer) {
  _inherits(ChoroplethLayer, _MapLayer);

  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} opts
   * @param {bool} opts.drawContour - ? drawContour : drawArea
   * @param {function} opts.onChoroplethHovered - provide proerties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} opts.onChoroplethClicked - provide proerties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */

  function ChoroplethLayer(opts) {
    _classCallCheck(this, ChoroplethLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChoroplethLayer).call(this, _extends({}, opts)));
  }

  _createClass(ChoroplethLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(ChoroplethLayer.prototype), 'initializeState', this).call(this);
      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      attributes.addInstanced(ATTRIBUTES, {
        // Primtive attributes
        indices: { update: this.calculateIndices },
        vertices: { update: this.calculateVertices },
        colors: { update: this.calculateColors },
        // Instanced attributes
        pickingColors: { update: this.calculatePickingColors, noAlloc: true }
      });

      var program = new _luma.Program(gl, glslify(_path2.default.join(__dirname, 'vertex.glsl')), glslify(_path2.default.join(__dirname, 'fragment.glsl')), 'choropleth');

      var primitive = {
        id: this.props.id,
        drawType: this.props.drawContour ? 'LINES' : 'TRIANGLES',
        instanced: false
      };

      this.setState({
        numInstances: 0,
        program: program,
        primitive: primitive
      });

      this.extractChoropleths();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ChoroplethLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var _state2 = this.state;
      var dataChanged = _state2.dataChanged;
      var attributes = _state2.attributes;

      if (dataChanged) {
        this.extractChoropleths();
        attributes.invalidateAll();
      }
    }
  }, {
    key: 'calculateVertices',
    value: function calculateVertices(attribute) {
      var vertices = (0, _lodash2.default)(this.state.groupedVertices);
      attribute.value = new Float32Array(vertices);
    }
  }, {
    key: 'calculateIndices',
    value: function calculateIndices(attribute) {
      var _this2 = this;

      // adjust index offset for multiple choropleths
      var offsets = this.state.groupedVertices.reduce(function (acc, vertices) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + vertices.length]);
      }, [0]);

      var indices = this.state.groupedVertices.map(function (vertices, choroplethIndex) {
        return _this2.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        _this2.calculateContourIndices(vertices.length).map(function (index) {
          return index + offsets[choroplethIndex];
        }) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        (0, _earcut2.default)((0, _lodash2.default)(vertices), null, 3).map(function (index) {
          return index + offsets[choroplethIndex];
        });
      });

      attribute.value = new Uint16Array((0, _lodash2.default)(indices));
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _this3 = this;

      var colors = this.state.groupedVertices.map(function (vertices) {
        return vertices.map(function (vertex) {
          return _this3.drawContour ? [0, 0, 0] : [128, 128, 128];
        });
      });

      attribute.value = new Float32Array((0, _lodash2.default)(colors));
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      // const {attributes} = this.state;
      // const {vertices: value} = attributes
      // const pickingColors = this.state.groupedVer.map(
      //   (vertices, choroplethIndex) => vertices.map(
      //     vertex => this.drawContour ? [-1, -1, -1] : [
      //       (choroplethIndex + 1) % 256,
      //       Math.floor((choroplethIndex + 1) / 256) % 256,
      //       this.layerIndex
      //     ]
      //   )
      // );

      // attribute.value = new Float32Array(flattenDeep(pickingColors));
    }
  }, {
    key: 'extractChoropleths',
    value: function extractChoropleths() {
      var data = this.props.data;

      var normalizedGeojson = (0, _geojsonNormalize2.default)(data);

      this.state.choropleths = normalizedGeojson.features.map(function (choropleth) {
        var coordinates = choropleth.geometry.coordinates[0];
        // flatten nested polygons
        if (coordinates.length === 1 && coordinates[0].length > 2) {
          coordinates = coordinates[0];
        }
        return {
          properties: choropleth.properties,
          coordinates: coordinates
        };
      });

      this.state.groupedVertices = this.state.choropleths.map(function (choropleth) {
        return choropleth.coordinates.map(function (coordinate) {
          return [coordinate[0], coordinate[1], 100];
        });
      });
    }
  }, {
    key: 'calculateContourIndices',
    value: function calculateContourIndices(numVertices) {
      // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
      var indices = [];
      for (var i = 1; i < numVertices - 1; i++) {
        indices = [].concat(_toConsumableArray(indices), [i, i]);
      }
      return [0].concat(_toConsumableArray(indices), [0]);
    }
  }, {
    key: 'onHover',
    value: function onHover(info) {
      var index = info.index;
      var data = this.props.data;

      var feature = data.features[index];
      this.props.onHover(_extends({}, info, { feature: feature }));
    }
  }, {
    key: 'onClick',
    value: function onClick(info) {
      var index = info.index;
      var data = this.props.data;

      var feature = data.features[index];
      this.props.onClick(_extends({}, info, { feature: feature }));
    }
  }]);

  return ChoroplethLayer;
}(_mapLayer2.default);

exports.default = ChoroplethLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixZQUFVLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXhDO0FBQ0EsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7OztBQUhpQixDQUFiOztJQVFlOzs7Ozs7Ozs7Ozs7Ozs7O0FBYW5CLFdBYm1CLGVBYW5CLENBQVksSUFBWixFQUFrQjswQkFiQyxpQkFhRDs7a0VBYkMseUNBZVosUUFGVztHQUFsQjs7ZUFibUI7O3NDQW1CRDtBQUNoQixpQ0FwQmlCLCtEQW9CakIsQ0FEZ0I7bUJBRVMsS0FBSyxLQUFMLENBRlQ7VUFFVCxlQUZTO1VBRUwsK0JBRks7OztBQUloQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DOztBQUVsQyxpQkFBUyxFQUFDLFFBQVEsS0FBSyxnQkFBTCxFQUFsQjtBQUNBLGtCQUFVLEVBQUMsUUFBUSxLQUFLLGlCQUFMLEVBQW5CO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjs7QUFFQSx1QkFBZSxFQUFDLFFBQVEsS0FBSyxzQkFBTCxFQUE2QixTQUFTLElBQVQsRUFBckQ7T0FORixFQUpnQjs7QUFhaEIsVUFBTSxVQUFVLGtCQUNkLEVBRGMsRUFFZCxRQUFRLGVBQUssSUFBTCxDQUFVLFNBQVYs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QVksQ0FBWixDQUFkLENBRHlEO1NBQTNEO0FBR0EsZUFBTztBQUNMLHNCQUFZLFdBQVcsVUFBWDtBQUNaLGtDQUZLO1NBQVAsQ0FOb0U7T0FBZCxDQUF4RCxDQUptQjs7QUFnQm5CLFdBQUssS0FBTCxDQUFXLGVBQVgsR0FBNkIsS0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixHQUF2QixDQUMzQjtlQUFjLFdBQVcsV0FBWCxDQUF1QixHQUF2QixDQUNaO2lCQUFjLENBQUMsV0FBVyxDQUFYLENBQUQsRUFBZ0IsV0FBVyxDQUFYLENBQWhCLEVBQStCLEdBQS9CO1NBQWQ7T0FERixDQURGLENBaEJtQjs7Ozs0Q0F1QkcsYUFBYTs7QUFFbkMsVUFBSSxVQUFVLEVBQVYsQ0FGK0I7QUFHbkMsV0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksY0FBYyxDQUFkLEVBQWlCLEdBQXJDLEVBQTBDO0FBQ3hDLCtDQUFjLFdBQVMsR0FBRyxHQUExQixDQUR3QztPQUExQztBQUdBLGNBQVEsNkJBQU0sV0FBUyxHQUF2QixDQU5tQzs7Ozs0QkFTN0IsTUFBTTtVQUNMLFFBQVMsS0FBVCxNQURLO1VBRUwsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQUZLOztBQUdaLFVBQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQVYsQ0FITTtBQUlaLFdBQUssS0FBTCxDQUFXLE9BQVgsY0FBdUIsUUFBTSxtQkFBN0IsRUFKWTs7Ozs0QkFPTixNQUFNO1VBQ0wsUUFBUyxLQUFULE1BREs7VUFFTCxPQUFRLEtBQUssS0FBTCxDQUFSLEtBRks7O0FBR1osVUFBTSxVQUFVLEtBQUssUUFBTCxDQUFjLEtBQWQsQ0FBVixDQUhNO0FBSVosV0FBSyxLQUFMLENBQVcsT0FBWCxjQUF1QixRQUFNLG1CQUE3QixFQUpZOzs7O1NBL0pLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgTWFwTGF5ZXIgZnJvbSAnLi4vbWFwLWxheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgdmVydGljZXM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBpbnN0YW5jZXM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxuICAvLyBPdmVycmlkZSBwaWNraW5nIGNvbG9ycyB0byBwcmV2ZW50IGF1dG8gYWxsb2NhdGlvblxuICAvLyBwaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgJzAnOiAncGlja1JlZCcsICcxJzogJ3BpY2tHcmVlbicsICcyJzogJ3BpY2tCbHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENob3JvcGxldGhMYXllciBleHRlbmRzIE1hcExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQ2hvcm9wbGV0aExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKiBAcGFyYW0ge2Jvb2x9IG9wdHMuZHJhd0NvbnRvdXIgLSA/IGRyYXdDb250b3VyIDogZHJhd0FyZWFcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkNob3JvcGxldGhIb3ZlcmVkIC0gcHJvdmlkZSBwcm9lcnRpZXMgb2YgdGhlXG4gICAqIHNlbGVjdGVkIGNob3JvcGxldGgsIHRvZ2V0aGVyIHdpdGggdGhlIG1vdXNlIGV2ZW50IHdoZW4gbW91c2UgaG92ZXJlZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uQ2hvcm9wbGV0aENsaWNrZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBjbGlja2VkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3B0c1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgLy8gUHJpbXRpdmUgYXR0cmlidXRlc1xuICAgICAgaW5kaWNlczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbmRpY2VzfSxcbiAgICAgIHZlcnRpY2VzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVZlcnRpY2VzfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9LFxuICAgICAgLy8gSW5zdGFuY2VkIGF0dHJpYnV0ZXNcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgbm9BbGxvYzogdHJ1ZX1cbiAgICB9KTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShcbiAgICAgIGdsLFxuICAgICAgZ2xzbGlmeShwYXRoLmpvaW4oX19kaXJuYW1lLCAndmVydGV4Lmdsc2wnKSksXG4gICAgICBnbHNsaWZ5KHBhdGguam9pbihfX2Rpcm5hbWUsICdmcmFnbWVudC5nbHNsJykpLFxuICAgICAgJ2Nob3JvcGxldGgnXG4gICAgKTtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZHJhd1R5cGU6IHRoaXMucHJvcHMuZHJhd0NvbnRvdXIgPyAnTElORVMnIDogJ1RSSUFOR0xFUycsXG4gICAgICBpbnN0YW5jZWQ6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbnVtSW5zdGFuY2VzOiAwLFxuICAgICAgcHJvZ3JhbSxcbiAgICAgIHByaW1pdGl2ZVxuICAgIH0pO1xuXG4gICAgdGhpcy5leHRyYWN0Q2hvcm9wbGV0aHMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGRhdGFDaGFuZ2VkKSB7XG4gICAgICB0aGlzLmV4dHJhY3RDaG9yb3BsZXRocygpO1xuICAgICAgYXR0cmlidXRlcy5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlVmVydGljZXMoYXR0cmlidXRlKSB7XG4gICAgY29uc3QgdmVydGljZXMgPSBmbGF0dGVuRGVlcCh0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcyk7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyk7XG4gIH1cblxuICBjYWxjdWxhdGVJbmRpY2VzKGF0dHJpYnV0ZSkge1xuICAgIC8vIGFkanVzdCBpbmRleCBvZmZzZXQgZm9yIG11bHRpcGxlIGNob3JvcGxldGhzXG4gICAgY29uc3Qgb2Zmc2V0cyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzLnJlZHVjZShcbiAgICAgIChhY2MsIHZlcnRpY2VzKSA9PiBbLi4uYWNjLCBhY2NbYWNjLmxlbmd0aCAtIDFdICsgdmVydGljZXMubGVuZ3RoXSxcbiAgICAgIFswXVxuICAgICk7XG5cbiAgICBjb25zdCBpbmRpY2VzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgKHZlcnRpY2VzLCBjaG9yb3BsZXRoSW5kZXgpID0+IHRoaXMuZHJhd0NvbnRvdXIgP1xuICAgICAgICAvLyAxLiBnZXQgc2VxdWVudGlhbGx5IG9yZGVyZWQgaW5kaWNlcyBvZiBlYWNoIGNob3JvcGxldGggY29udG91clxuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgY2hvcm9wbGV0aHNcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb250b3VySW5kaWNlcyh2ZXJ0aWNlcy5sZW5ndGgpLm1hcChcbiAgICAgICAgICBpbmRleCA9PiBpbmRleCArIG9mZnNldHNbY2hvcm9wbGV0aEluZGV4XVxuICAgICAgICApIDpcbiAgICAgICAgLy8gMS4gZ2V0IHRyaWFuZ3VsYXRlZCBpbmRpY2VzIGZvciB0aGUgaW50ZXJuYWwgYXJlYXNcbiAgICAgICAgLy8gMi4gb2Zmc2V0IHRoZW0gYnkgdGhlIG51bWJlciBvZiBpbmRpY2VzIGluIHByZXZpb3VzIGNob3JvcGxldGhzXG4gICAgICAgIGVhcmN1dChmbGF0dGVuRGVlcCh2ZXJ0aWNlcyksIG51bGwsIDMpLm1hcChcbiAgICAgICAgICBpbmRleCA9PiBpbmRleCArIG9mZnNldHNbY2hvcm9wbGV0aEluZGV4XVxuICAgICAgICApXG4gICAgKTtcblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBVaW50MTZBcnJheShmbGF0dGVuRGVlcChpbmRpY2VzKSk7XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3QgY29sb3JzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgdmVydGljZXMgPT4gdmVydGljZXMubWFwKFxuICAgICAgICB2ZXJ0ZXggPT4gdGhpcy5kcmF3Q29udG91ciA/IFswLCAwLCAwXSA6IFsxMjgsIDEyOCwgMTI4XVxuICAgICAgKVxuICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW5EZWVwKGNvbG9ycykpO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgcGlja2luZyBjb2xvcnMgY2FsY3VsYXRpb25cbiAgY2FsY3VsYXRlUGlja2luZ0NvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICAvLyBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIC8vIGNvbnN0IHt2ZXJ0aWNlczogdmFsdWV9ID0gYXR0cmlidXRlc1xuICAgIC8vIGNvbnN0IHBpY2tpbmdDb2xvcnMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXIubWFwKFxuICAgIC8vICAgKHZlcnRpY2VzLCBjaG9yb3BsZXRoSW5kZXgpID0+IHZlcnRpY2VzLm1hcChcbiAgICAvLyAgICAgdmVydGV4ID0+IHRoaXMuZHJhd0NvbnRvdXIgPyBbLTEsIC0xLCAtMV0gOiBbXG4gICAgLy8gICAgICAgKGNob3JvcGxldGhJbmRleCArIDEpICUgMjU2LFxuICAgIC8vICAgICAgIE1hdGguZmxvb3IoKGNob3JvcGxldGhJbmRleCArIDEpIC8gMjU2KSAlIDI1NixcbiAgICAvLyAgICAgICB0aGlzLmxheWVySW5kZXhcbiAgICAvLyAgICAgXVxuICAgIC8vICAgKVxuICAgIC8vICk7XG5cbiAgICAvLyBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW5EZWVwKHBpY2tpbmdDb2xvcnMpKTtcbiAgfVxuXG4gIGV4dHJhY3RDaG9yb3BsZXRocygpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRHZW9qc29uID0gbm9ybWFsaXplKGRhdGEpO1xuXG4gICAgdGhpcy5zdGF0ZS5jaG9yb3BsZXRocyA9IG5vcm1hbGl6ZWRHZW9qc29uLmZlYXR1cmVzLm1hcChjaG9yb3BsZXRoID0+IHtcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IGNob3JvcGxldGguZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF07XG4gICAgICAvLyBmbGF0dGVuIG5lc3RlZCBwb2x5Z29uc1xuICAgICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gMSAmJiBjb29yZGluYXRlc1swXS5sZW5ndGggPiAyKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gY29vcmRpbmF0ZXNbMF07XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0aWVzOiBjaG9yb3BsZXRoLnByb3BlcnRpZXMsXG4gICAgICAgIGNvb3JkaW5hdGVzXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMgPSB0aGlzLnN0YXRlLmNob3JvcGxldGhzLm1hcChcbiAgICAgIGNob3JvcGxldGggPT4gY2hvcm9wbGV0aC5jb29yZGluYXRlcy5tYXAoXG4gICAgICAgIGNvb3JkaW5hdGUgPT4gW2Nvb3JkaW5hdGVbMF0sIGNvb3JkaW5hdGVbMV0sIDEwMF1cbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgY2FsY3VsYXRlQ29udG91ckluZGljZXMobnVtVmVydGljZXMpIHtcbiAgICAvLyB1c2UgdmVydGV4IHBhaXJzIGZvciBnbC5MSU5FUyA9PiBbMCwgMSwgMSwgMiwgMiwgLi4uLCBuLTEsIG4tMSwgMF1cbiAgICBsZXQgaW5kaWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMgPSBbLi4uaW5kaWNlcywgaSwgaV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgLi4uaW5kaWNlcywgMF07XG4gIH1cblxuICBvbkhvdmVyKGluZm8pIHtcbiAgICBjb25zdCB7aW5kZXh9ID0gaW5mbztcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGZlYXR1cmUgPSBkYXRhLmZlYXR1cmVzW2luZGV4XTtcbiAgICB0aGlzLnByb3BzLm9uSG92ZXIoey4uLmluZm8sIGZlYXR1cmV9KTtcbiAgfVxuXG4gIG9uQ2xpY2soaW5mbykge1xuICAgIGNvbnN0IHtpbmRleH0gPSBpbmZvO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmVhdHVyZSA9IGRhdGEuZmVhdHVyZXNbaW5kZXhdO1xuICAgIHRoaXMucHJvcHMub25DbGljayh7Li4uaW5mbywgZmVhdHVyZX0pO1xuICB9XG5cbn1cbiJdfQ==