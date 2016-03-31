'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('../../layer');

var _layer2 = _interopRequireDefault(_layer);

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
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      attributeManager.addInstanced(ATTRIBUTES, {
        // Primtive attributes
        indices: { update: this.calculateIndices },
        vertices: { update: this.calculateVertices },
        colors: { update: this.calculateColors },
        // Instanced attributes
        pickingColors: { update: this.calculatePickingColors, noAlloc: true }
      });

      this.setState({
        numInstances: 0,
        model: this.getModel(gl)
      });

      this.extractChoropleths();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ChoroplethLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var _state2 = this.state;
      var dataChanged = _state2.dataChanged;
      var attributeManager = _state2.attributeManager;

      if (dataChanged) {
        this.extractChoropleths();
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./choropleth-layer-vertex.glsl'),
          fs: glslify('./choropleth-layer-fragment.glsl'),
          id: 'choropleth'
        }),
        geometry: new _luma.Geometry({
          id: this.props.id,
          drawMode: this.props.drawContour ? 'LINES' : 'TRIANGLES'
        })
      });
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
      // const {attributeManager} = this.state;
      // const {vertices: value} = attributeManager
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9jaG9yb3BsZXRoLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixZQUFVLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXhDO0FBQ0EsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7OztBQUhpQixDQUFiOztJQVFlOzs7Ozs7Ozs7Ozs7Ozs7O0FBYW5CLFdBYm1CLGVBYW5CLENBQVksSUFBWixFQUFrQjswQkFiQyxpQkFhRDs7a0VBYkMseUNBZVosUUFGVztHQUFsQjs7ZUFibUI7O3NDQW1CRDttQkFDZSxLQUFLLEtBQUwsQ0FEZjtVQUNULGVBRFM7VUFDTCwyQ0FESzs7O0FBR2hCLHVCQUFpQixZQUFqQixDQUE4QixVQUE5QixFQUEwQzs7QUFFeEMsaUJBQVMsRUFBQyxRQUFRLEtBQUssZ0JBQUwsRUFBbEI7QUFDQSxrQkFBVSxFQUFDLFFBQVEsS0FBSyxpQkFBTCxFQUFuQjtBQUNBLGdCQUFRLEVBQUMsUUFBUSxLQUFLLGVBQUwsRUFBakI7O0FBRUEsdUJBQWUsRUFBQyxRQUFRLEtBQUssc0JBQUwsRUFBNkIsU0FBUyxJQUFULEVBQXJEO09BTkYsRUFIZ0I7O0FBWWhCLFdBQUssUUFBTCxDQUFjO0FBQ1osc0JBQWMsQ0FBZDtBQUNBLGVBQU8sS0FBSyxRQUFM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WixDQUFkLENBRHlEO1NBQTNEO0FBR0EsZUFBTztBQUNMLHNCQUFZLFdBQVcsVUFBWDtBQUNaLGtDQUZLO1NBQVAsQ0FOb0U7T0FBZCxDQUF4RCxDQUptQjs7QUFnQm5CLFdBQUssS0FBTCxDQUFXLGVBQVgsR0FBNkIsS0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixHQUF2QixDQUMzQjtlQUFjLFdBQVcsV0FBWCxDQUF1QixHQUF2QixDQUNaO2lCQUFjLENBQUMsV0FBVyxDQUFYLENBQUQsRUFBZ0IsV0FBVyxDQUFYLENBQWhCLEVBQStCLEdBQS9CO1NBQWQ7T0FERixDQURGLENBaEJtQjs7Ozs0Q0F1QkcsYUFBYTs7QUFFbkMsVUFBSSxVQUFVLEVBQVYsQ0FGK0I7QUFHbkMsV0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksY0FBYyxDQUFkLEVBQWlCLEdBQXJDLEVBQTBDO0FBQ3hDLCtDQUFjLFdBQVMsR0FBRyxHQUExQixDQUR3QztPQUExQztBQUdBLGNBQVEsNkJBQU0sV0FBUyxHQUF2QixDQU5tQzs7Ozs0QkFTN0IsTUFBTTtVQUNMLFFBQVMsS0FBVCxNQURLO1VBRUwsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQUZLOztBQUdaLFVBQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQVYsQ0FITTtBQUlaLFdBQUssS0FBTCxDQUFXLE9BQVgsY0FBdUIsUUFBTSxtQkFBN0IsRUFKWTs7Ozs0QkFPTixNQUFNO1VBQ0wsUUFBUyxLQUFULE1BREs7VUFFTCxPQUFRLEtBQUssS0FBTCxDQUFSLEtBRks7O0FBR1osVUFBTSxVQUFVLEtBQUssUUFBTCxDQUFjLEtBQWQsQ0FBVixDQUhNO0FBSVosV0FBSyxLQUFMLENBQVcsT0FBWCxjQUF1QixRQUFNLG1CQUE3QixFQUpZOzs7O1NBOUpLIiwiZmlsZSI6ImNob3JvcGxldGgtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vLi4vbGF5ZXInO1xuaW1wb3J0IGVhcmN1dCBmcm9tICdlYXJjdXQnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC5mbGF0dGVuZGVlcCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ2dlb2pzb24tbm9ybWFsaXplJztcbmltcG9ydCB7TW9kZWwsIFByb2dyYW0sIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHZlcnRpY2VzOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgaW5zdGFuY2VzOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbiAgLy8gT3ZlcnJpZGUgcGlja2luZyBjb2xvcnMgdG8gcHJldmVudCBhdXRvIGFsbG9jYXRpb25cbiAgLy8gcGlja2luZ0NvbG9yczoge3NpemU6IDMsICcwJzogJ3BpY2tSZWQnLCAnMSc6ICdwaWNrR3JlZW4nLCAnMic6ICdwaWNrQmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaG9yb3BsZXRoTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIENob3JvcGxldGhMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICogQHBhcmFtIHtib29sfSBvcHRzLmRyYXdDb250b3VyIC0gPyBkcmF3Q29udG91ciA6IGRyYXdBcmVhXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25DaG9yb3BsZXRoSG92ZXJlZCAtIHByb3ZpZGUgcHJvZXJ0aWVzIG9mIHRoZVxuICAgKiBzZWxlY3RlZCBjaG9yb3BsZXRoLCB0b2dldGhlciB3aXRoIHRoZSBtb3VzZSBldmVudCB3aGVuIG1vdXNlIGhvdmVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkNob3JvcGxldGhDbGlja2VkIC0gcHJvdmlkZSBwcm9lcnRpZXMgb2YgdGhlXG4gICAqIHNlbGVjdGVkIGNob3JvcGxldGgsIHRvZ2V0aGVyIHdpdGggdGhlIG1vdXNlIGV2ZW50IHdoZW4gbW91c2UgY2xpY2tlZFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKHtcbiAgICAgIC4uLm9wdHNcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIC8vIFByaW10aXZlIGF0dHJpYnV0ZXNcbiAgICAgIGluZGljZXM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5kaWNlc30sXG4gICAgICB2ZXJ0aWNlczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVWZXJ0aWNlc30sXG4gICAgICBjb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfSxcbiAgICAgIC8vIEluc3RhbmNlZCBhdHRyaWJ1dGVzXG4gICAgICBwaWNraW5nQ29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMsIG5vQWxsb2M6IHRydWV9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG51bUluc3RhbmNlczogMCxcbiAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVsKGdsKVxuICAgIH0pO1xuXG4gICAgdGhpcy5leHRyYWN0Q2hvcm9wbGV0aHMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGRhdGFDaGFuZ2VkKSB7XG4gICAgICB0aGlzLmV4dHJhY3RDaG9yb3BsZXRocygpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2Nob3JvcGxldGgtbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vY2hvcm9wbGV0aC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnY2hvcm9wbGV0aCdcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgICBkcmF3TW9kZTogdGhpcy5wcm9wcy5kcmF3Q29udG91ciA/ICdMSU5FUycgOiAnVFJJQU5HTEVTJ1xuICAgICAgfSlcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVZlcnRpY2VzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gZmxhdHRlbkRlZXAodGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMpO1xuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5kaWNlcyhhdHRyaWJ1dGUpIHtcbiAgICAvLyBhZGp1c3QgaW5kZXggb2Zmc2V0IGZvciBtdWx0aXBsZSBjaG9yb3BsZXRoc1xuICAgIGNvbnN0IG9mZnNldHMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5yZWR1Y2UoXG4gICAgICAoYWNjLCB2ZXJ0aWNlcykgPT4gWy4uLmFjYywgYWNjW2FjYy5sZW5ndGggLSAxXSArIHZlcnRpY2VzLmxlbmd0aF0sXG4gICAgICBbMF1cbiAgICApO1xuXG4gICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzLm1hcChcbiAgICAgICh2ZXJ0aWNlcywgY2hvcm9wbGV0aEluZGV4KSA9PiB0aGlzLmRyYXdDb250b3VyID9cbiAgICAgICAgLy8gMS4gZ2V0IHNlcXVlbnRpYWxseSBvcmRlcmVkIGluZGljZXMgb2YgZWFjaCBjaG9yb3BsZXRoIGNvbnRvdXJcbiAgICAgICAgLy8gMi4gb2Zmc2V0IHRoZW0gYnkgdGhlIG51bWJlciBvZiBpbmRpY2VzIGluIHByZXZpb3VzIGNob3JvcGxldGhzXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29udG91ckluZGljZXModmVydGljZXMubGVuZ3RoKS5tYXAoXG4gICAgICAgICAgaW5kZXggPT4gaW5kZXggKyBvZmZzZXRzW2Nob3JvcGxldGhJbmRleF1cbiAgICAgICAgKSA6XG4gICAgICAgIC8vIDEuIGdldCB0cmlhbmd1bGF0ZWQgaW5kaWNlcyBmb3IgdGhlIGludGVybmFsIGFyZWFzXG4gICAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBjaG9yb3BsZXRoc1xuICAgICAgICBlYXJjdXQoZmxhdHRlbkRlZXAodmVydGljZXMpLCBudWxsLCAzKS5tYXAoXG4gICAgICAgICAgaW5kZXggPT4gaW5kZXggKyBvZmZzZXRzW2Nob3JvcGxldGhJbmRleF1cbiAgICAgICAgKVxuICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgVWludDE2QXJyYXkoZmxhdHRlbkRlZXAoaW5kaWNlcykpO1xuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzLm1hcChcbiAgICAgIHZlcnRpY2VzID0+IHZlcnRpY2VzLm1hcChcbiAgICAgICAgdmVydGV4ID0+IHRoaXMuZHJhd0NvbnRvdXIgPyBbMCwgMCwgMF0gOiBbMTI4LCAxMjgsIDEyOF1cbiAgICAgIClcbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuRGVlcChjb2xvcnMpKTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHBpY2tpbmcgY29sb3JzIGNhbGN1bGF0aW9uXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgLy8gY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAvLyBjb25zdCB7dmVydGljZXM6IHZhbHVlfSA9IGF0dHJpYnV0ZU1hbmFnZXJcbiAgICAvLyBjb25zdCBwaWNraW5nQ29sb3JzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVyLm1hcChcbiAgICAvLyAgICh2ZXJ0aWNlcywgY2hvcm9wbGV0aEluZGV4KSA9PiB2ZXJ0aWNlcy5tYXAoXG4gICAgLy8gICAgIHZlcnRleCA9PiB0aGlzLmRyYXdDb250b3VyID8gWy0xLCAtMSwgLTFdIDogW1xuICAgIC8vICAgICAgIChjaG9yb3BsZXRoSW5kZXggKyAxKSAlIDI1NixcbiAgICAvLyAgICAgICBNYXRoLmZsb29yKChjaG9yb3BsZXRoSW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgLy8gICAgICAgdGhpcy5sYXllckluZGV4XG4gICAgLy8gICAgIF1cbiAgICAvLyAgIClcbiAgICAvLyApO1xuXG4gICAgLy8gYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuRGVlcChwaWNraW5nQ29sb3JzKSk7XG4gIH1cblxuICBleHRyYWN0Q2hvcm9wbGV0aHMoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBub3JtYWxpemVkR2VvanNvbiA9IG5vcm1hbGl6ZShkYXRhKTtcblxuICAgIHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMgPSBub3JtYWxpemVkR2VvanNvbi5mZWF0dXJlcy5tYXAoY2hvcm9wbGV0aCA9PiB7XG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBjaG9yb3BsZXRoLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdO1xuICAgICAgLy8gZmxhdHRlbiBuZXN0ZWQgcG9seWdvbnNcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IDEgJiYgY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID4gMikge1xuICAgICAgICBjb29yZGluYXRlcyA9IGNvb3JkaW5hdGVzWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydGllczogY2hvcm9wbGV0aC5wcm9wZXJ0aWVzLFxuICAgICAgICBjb29yZGluYXRlc1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzID0gdGhpcy5zdGF0ZS5jaG9yb3BsZXRocy5tYXAoXG4gICAgICBjaG9yb3BsZXRoID0+IGNob3JvcGxldGguY29vcmRpbmF0ZXMubWFwKFxuICAgICAgICBjb29yZGluYXRlID0+IFtjb29yZGluYXRlWzBdLCBjb29yZGluYXRlWzFdLCAxMDBdXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKG51bVZlcnRpY2VzKSB7XG4gICAgLy8gdXNlIHZlcnRleCBwYWlycyBmb3IgZ2wuTElORVMgPT4gWzAsIDEsIDEsIDIsIDIsIC4uLiwgbi0xLCBuLTEsIDBdXG4gICAgbGV0IGluZGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG51bVZlcnRpY2VzIC0gMTsgaSsrKSB7XG4gICAgICBpbmRpY2VzID0gWy4uLmluZGljZXMsIGksIGldO1xuICAgIH1cbiAgICByZXR1cm4gWzAsIC4uLmluZGljZXMsIDBdO1xuICB9XG5cbiAgb25Ib3ZlcihpbmZvKSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlID0gZGF0YS5mZWF0dXJlc1tpbmRleF07XG4gICAgdGhpcy5wcm9wcy5vbkhvdmVyKHsuLi5pbmZvLCBmZWF0dXJlfSk7XG4gIH1cblxuICBvbkNsaWNrKGluZm8pIHtcbiAgICBjb25zdCB7aW5kZXh9ID0gaW5mbztcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGZlYXR1cmUgPSBkYXRhLmZlYXR1cmVzW2luZGV4XTtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2soey4uLmluZm8sIGZlYXR1cmV9KTtcbiAgfVxuXG59XG4iXX0=