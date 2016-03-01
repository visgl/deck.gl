'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('../layer');

var _layer2 = _interopRequireDefault(_layer);

var _earcut = require('earcut');

var _earcut2 = _interopRequireDefault(_earcut);

var _lodash = require('lodash.flattendeep');

var _lodash2 = _interopRequireDefault(_lodash);

var _geojsonNormalize = require('geojson-normalize');

var _geojsonNormalize2 = _interopRequireDefault(_geojsonNormalize);

var _luma = require('luma.gl');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

var ChoroplethLayer = function (_Layer) {
  _inherits(ChoroplethLayer, _Layer);

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
}(_layer2.default);

exports.default = ChoroplethLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixZQUFVLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXhDO0FBQ0EsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7OztBQUhpQixDQUFiOztJQVFlOzs7Ozs7Ozs7Ozs7Ozs7O0FBYW5CLFdBYm1CLGVBYW5CLENBQVksSUFBWixFQUFrQjswQkFiQyxpQkFhRDs7a0VBYkMseUNBZVosUUFGVztHQUFsQjs7ZUFibUI7O3NDQW1CRDtBQUNoQixpQ0FwQmlCLCtEQW9CakIsQ0FEZ0I7bUJBRVMsS0FBSyxLQUFMLENBRlQ7VUFFVCxlQUZTO1VBRUwsK0JBRks7OztBQUloQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DOztBQUVsQyxpQkFBUyxFQUFDLFFBQVEsS0FBSyxnQkFBTCxFQUFsQjtBQUNBLGtCQUFVLEVBQUMsUUFBUSxLQUFLLGlCQUFMLEVBQW5CO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjs7QUFFQSx1QkFBZSxFQUFDLFFBQVEsS0FBSyxzQkFBTCxFQUE2QixTQUFTLElBQVQsRUFBckQ7T0FORixFQUpnQjs7QUFhaEIsVUFBTSxVQUFVLGtCQUNkLEVBRGMsRUFFZCxRQUFRLGVBQUssSUFBTCxDQUFVLFNBQVYs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QVksQ0FBWixDQUFkLENBRHlEO1NBQTNEO0FBR0EsZUFBTztBQUNMLHNCQUFZLFdBQVcsVUFBWDtBQUNaLGtDQUZLO1NBQVAsQ0FOb0U7T0FBZCxDQUF4RCxDQUptQjs7QUFnQm5CLFdBQUssS0FBTCxDQUFXLGVBQVgsR0FBNkIsS0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixHQUF2QixDQUMzQjtlQUFjLFdBQVcsV0FBWCxDQUF1QixHQUF2QixDQUNaO2lCQUFjLENBQUMsV0FBVyxDQUFYLENBQUQsRUFBZ0IsV0FBVyxDQUFYLENBQWhCLEVBQStCLEdBQS9CO1NBQWQ7T0FERixDQURGLENBaEJtQjs7Ozs0Q0F1QkcsYUFBYTs7QUFFbkMsVUFBSSxVQUFVLEVBQVYsQ0FGK0I7QUFHbkMsV0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksY0FBYyxDQUFkLEVBQWlCLEdBQXJDLEVBQTBDO0FBQ3hDLCtDQUFjLFdBQVMsR0FBRyxHQUExQixDQUR3QztPQUExQztBQUdBLGNBQVEsNkJBQU0sV0FBUyxHQUF2QixDQU5tQzs7Ozs0QkFTN0IsTUFBTTtVQUNMLFFBQVMsS0FBVCxNQURLO1VBRUwsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQUZLOztBQUdaLFVBQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQVYsQ0FITTtBQUlaLFdBQUssS0FBTCxDQUFXLE9BQVgsY0FBdUIsUUFBTSxtQkFBN0IsRUFKWTs7Ozs0QkFPTixNQUFNO1VBQ0wsUUFBUyxLQUFULE1BREs7VUFFTCxPQUFRLEtBQUssS0FBTCxDQUFSLEtBRks7O0FBR1osVUFBTSxVQUFVLEtBQUssUUFBTCxDQUFjLEtBQWQsQ0FBVixDQUhNO0FBSVosV0FBSyxLQUFMLENBQVcsT0FBWCxjQUF1QixRQUFNLG1CQUE3QixFQUpZOzs7O1NBL0pLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uL2xheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICB2ZXJ0aWNlczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGluc3RhbmNlczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG4gIC8vIE92ZXJyaWRlIHBpY2tpbmcgY29sb3JzIHRvIHByZXZlbnQgYXV0byBhbGxvY2F0aW9uXG4gIC8vIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hvcm9wbGV0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBDaG9yb3BsZXRoTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqIEBwYXJhbSB7Ym9vbH0gb3B0cy5kcmF3Q29udG91ciAtID8gZHJhd0NvbnRvdXIgOiBkcmF3QXJlYVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uQ2hvcm9wbGV0aEhvdmVyZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBob3ZlcmVkXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25DaG9yb3BsZXRoQ2xpY2tlZCAtIHByb3ZpZGUgcHJvZXJ0aWVzIG9mIHRoZVxuICAgKiBzZWxlY3RlZCBjaG9yb3BsZXRoLCB0b2dldGhlciB3aXRoIHRoZSBtb3VzZSBldmVudCB3aGVuIG1vdXNlIGNsaWNrZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcih7XG4gICAgICAuLi5vcHRzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBhdHRyaWJ1dGVzLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICAvLyBQcmltdGl2ZSBhdHRyaWJ1dGVzXG4gICAgICBpbmRpY2VzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluZGljZXN9LFxuICAgICAgdmVydGljZXM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlVmVydGljZXN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc30sXG4gICAgICAvLyBJbnN0YW5jZWQgYXR0cmlidXRlc1xuICAgICAgcGlja2luZ0NvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzLCBub0FsbG9jOiB0cnVlfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKFxuICAgICAgZ2wsXG4gICAgICBnbHNsaWZ5KHBhdGguam9pbihfX2Rpcm5hbWUsICd2ZXJ0ZXguZ2xzbCcpKSxcbiAgICAgIGdsc2xpZnkocGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZyYWdtZW50Lmdsc2wnKSksXG4gICAgICAnY2hvcm9wbGV0aCdcbiAgICApO1xuXG4gICAgY29uc3QgcHJpbWl0aXZlID0ge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBkcmF3VHlwZTogdGhpcy5wcm9wcy5kcmF3Q29udG91ciA/ICdMSU5FUycgOiAnVFJJQU5HTEVTJyxcbiAgICAgIGluc3RhbmNlZDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXM6IDAsXG4gICAgICBwcm9ncmFtLFxuICAgICAgcHJpbWl0aXZlXG4gICAgfSk7XG5cbiAgICB0aGlzLmV4dHJhY3RDaG9yb3BsZXRocygpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICBjb25zdCB7ZGF0YUNoYW5nZWQsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuZXh0cmFjdENob3JvcGxldGhzKCk7XG4gICAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVWZXJ0aWNlcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGZsYXR0ZW5EZWVwKHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzKTtcbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluZGljZXMoYXR0cmlidXRlKSB7XG4gICAgLy8gYWRqdXN0IGluZGV4IG9mZnNldCBmb3IgbXVsdGlwbGUgY2hvcm9wbGV0aHNcbiAgICBjb25zdCBvZmZzZXRzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMucmVkdWNlKFxuICAgICAgKGFjYywgdmVydGljZXMpID0+IFsuLi5hY2MsIGFjY1thY2MubGVuZ3RoIC0gMV0gKyB2ZXJ0aWNlcy5sZW5ndGhdLFxuICAgICAgWzBdXG4gICAgKTtcblxuICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdGhpcy5kcmF3Q29udG91ciA/XG4gICAgICAgIC8vIDEuIGdldCBzZXF1ZW50aWFsbHkgb3JkZXJlZCBpbmRpY2VzIG9mIGVhY2ggY2hvcm9wbGV0aCBjb250b3VyXG4gICAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBjaG9yb3BsZXRoc1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLmxlbmd0aCkubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICkgOlxuICAgICAgICAvLyAxLiBnZXQgdHJpYW5ndWxhdGVkIGluZGljZXMgZm9yIHRoZSBpbnRlcm5hbCBhcmVhc1xuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgY2hvcm9wbGV0aHNcbiAgICAgICAgZWFyY3V0KGZsYXR0ZW5EZWVwKHZlcnRpY2VzKSwgbnVsbCwgMykubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IFVpbnQxNkFycmF5KGZsYXR0ZW5EZWVwKGluZGljZXMpKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICB2ZXJ0aWNlcyA9PiB2ZXJ0aWNlcy5tYXAoXG4gICAgICAgIHZlcnRleCA9PiB0aGlzLmRyYXdDb250b3VyID8gWzAsIDAsIDBdIDogWzEyOCwgMTI4LCAxMjhdXG4gICAgICApXG4gICAgKTtcblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAoY29sb3JzKSk7XG4gIH1cblxuICAvLyBPdmVycmlkZSB0aGUgZGVmYXVsdCBwaWNraW5nIGNvbG9ycyBjYWxjdWxhdGlvblxuICBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIC8vIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gY29uc3Qge3ZlcnRpY2VzOiB2YWx1ZX0gPSBhdHRyaWJ1dGVzXG4gICAgLy8gY29uc3QgcGlja2luZ0NvbG9ycyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlci5tYXAoXG4gICAgLy8gICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdmVydGljZXMubWFwKFxuICAgIC8vICAgICB2ZXJ0ZXggPT4gdGhpcy5kcmF3Q29udG91ciA/IFstMSwgLTEsIC0xXSA6IFtcbiAgICAvLyAgICAgICAoY2hvcm9wbGV0aEluZGV4ICsgMSkgJSAyNTYsXG4gICAgLy8gICAgICAgTWF0aC5mbG9vcigoY2hvcm9wbGV0aEluZGV4ICsgMSkgLyAyNTYpICUgMjU2LFxuICAgIC8vICAgICAgIHRoaXMubGF5ZXJJbmRleFxuICAgIC8vICAgICBdXG4gICAgLy8gICApXG4gICAgLy8gKTtcblxuICAgIC8vIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAocGlja2luZ0NvbG9ycykpO1xuICB9XG5cbiAgZXh0cmFjdENob3JvcGxldGhzKCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgbm9ybWFsaXplZEdlb2pzb24gPSBub3JtYWxpemUoZGF0YSk7XG5cbiAgICB0aGlzLnN0YXRlLmNob3JvcGxldGhzID0gbm9ybWFsaXplZEdlb2pzb24uZmVhdHVyZXMubWFwKGNob3JvcGxldGggPT4ge1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gY2hvcm9wbGV0aC5nZW9tZXRyeS5jb29yZGluYXRlc1swXTtcbiAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIHBvbHlnb25zXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSAxICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnRpZXM6IGNob3JvcGxldGgucHJvcGVydGllcyxcbiAgICAgICAgY29vcmRpbmF0ZXNcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcyA9IHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMubWFwKFxuICAgICAgY2hvcm9wbGV0aCA9PiBjaG9yb3BsZXRoLmNvb3JkaW5hdGVzLm1hcChcbiAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgMTAwXVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjYWxjdWxhdGVDb250b3VySW5kaWNlcyhudW1WZXJ0aWNlcykge1xuICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIGdsLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgIGxldCBpbmRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgaW5kaWNlcyA9IFsuLi5pbmRpY2VzLCBpLCBpXTtcbiAgICB9XG4gICAgcmV0dXJuIFswLCAuLi5pbmRpY2VzLCAwXTtcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtpbmRleH0gPSBpbmZvO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmVhdHVyZSA9IGRhdGEuZmVhdHVyZXNbaW5kZXhdO1xuICAgIHRoaXMucHJvcHMub25Ib3Zlcih7Li4uaW5mbywgZmVhdHVyZX0pO1xuICB9XG5cbiAgb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlID0gZGF0YS5mZWF0dXJlc1tpbmRleF07XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHsuLi5pbmZvLCBmZWF0dXJlfSk7XG4gIH1cblxufVxuIl19