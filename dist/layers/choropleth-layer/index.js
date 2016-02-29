'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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

      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'choropleth');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLFlBQVUsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBeEM7QUFDQSxhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1Qzs7O0FBSGlCLENBQWI7O0lBUWU7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhbkIsV0FibUIsZUFhbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQWJDLGlCQWFEOztrRUFiQyx5Q0FlWixRQUZXO0dBQWxCOztlQWJtQjs7c0NBbUJEO0FBQ2hCLGlDQXBCaUIsK0RBb0JqQixDQURnQjttQkFFUyxLQUFLLEtBQUwsQ0FGVDtVQUVULGVBRlM7VUFFTCwrQkFGSzs7O0FBSWhCLGlCQUFXLFlBQVgsQ0FBd0IsVUFBeEIsRUFBb0M7O0FBRWxDLGlCQUFTLEVBQUMsUUFBUSxLQUFLLGdCQUFMLEVBQWxCO0FBQ0Esa0JBQVUsRUFBQyxRQUFRLEtBQUssaUJBQUwsRUFBbkI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCOztBQUVBLHVCQUFlLEVBQUMsUUFBUSxLQUFLLHNCQUFMLEVBQTZCLFNBQVMsSUFBVCxFQUFyRDtPQU5GLEVBSmdCOztBQWFoQixVQUFNLFVBQVUsa0JBQ2QsRUFEYyxFQUVkLFFBQVEsZUFBUixDQUZjLEVBR2QsUUFBUSxpQkFB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U0FBUCxDQU5vRTtPQUFkLENBQXhELENBSm1COztBQWdCbkIsV0FBSyxLQUFMLENBQVcsZUFBWCxHQUE2QixLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXVCLEdBQXZCLENBQzNCO2VBQWMsV0FBVyxXQUFYLENBQXVCLEdBQXZCLENBQ1o7aUJBQWMsQ0FBQyxXQUFXLENBQVgsQ0FBRCxFQUFnQixXQUFXLENBQVgsQ0FBaEIsRUFBK0IsR0FBL0I7U0FBZDtPQURGLENBREYsQ0FoQm1COzs7OzRDQXVCRyxhQUFhOztBQUVuQyxVQUFJLFVBQVUsRUFBVixDQUYrQjtBQUduQyxXQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxjQUFjLENBQWQsRUFBaUIsR0FBckMsRUFBMEM7QUFDeEMsK0NBQWMsV0FBUyxHQUFHLEdBQTFCLENBRHdDO09BQTFDO0FBR0EsY0FBUSw2QkFBTSxXQUFTLEdBQXZCLENBTm1DOzs7OzRCQVM3QixNQUFNO1VBQ0wsUUFBUyxLQUFULE1BREs7VUFFTCxPQUFRLEtBQUssS0FBTCxDQUFSLEtBRks7O0FBR1osVUFBTSxVQUFVLEtBQUssUUFBTCxDQUFjLEtBQWQsQ0FBVixDQUhNO0FBSVosV0FBSyxLQUFMLENBQVcsT0FBWCxjQUF1QixRQUFNLG1CQUE3QixFQUpZOzs7OzRCQU9OLE1BQU07VUFDTCxRQUFTLEtBQVQsTUFESztVQUVMLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FGSzs7QUFHWixVQUFNLFVBQVUsS0FBSyxRQUFMLENBQWMsS0FBZCxDQUFWLENBSE07QUFJWixXQUFLLEtBQUwsQ0FBVyxPQUFYLGNBQXVCLFFBQU0sbUJBQTdCLEVBSlk7Ozs7U0EvSksiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTWFwTGF5ZXIgZnJvbSAnLi4vbWFwLWxheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgdmVydGljZXM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBpbnN0YW5jZXM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxuICAvLyBPdmVycmlkZSBwaWNraW5nIGNvbG9ycyB0byBwcmV2ZW50IGF1dG8gYWxsb2NhdGlvblxuICAvLyBwaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgJzAnOiAncGlja1JlZCcsICcxJzogJ3BpY2tHcmVlbicsICcyJzogJ3BpY2tCbHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENob3JvcGxldGhMYXllciBleHRlbmRzIE1hcExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQ2hvcm9wbGV0aExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKiBAcGFyYW0ge2Jvb2x9IG9wdHMuZHJhd0NvbnRvdXIgLSA/IGRyYXdDb250b3VyIDogZHJhd0FyZWFcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkNob3JvcGxldGhIb3ZlcmVkIC0gcHJvdmlkZSBwcm9lcnRpZXMgb2YgdGhlXG4gICAqIHNlbGVjdGVkIGNob3JvcGxldGgsIHRvZ2V0aGVyIHdpdGggdGhlIG1vdXNlIGV2ZW50IHdoZW4gbW91c2UgaG92ZXJlZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uQ2hvcm9wbGV0aENsaWNrZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBjbGlja2VkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3B0c1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgLy8gUHJpbXRpdmUgYXR0cmlidXRlc1xuICAgICAgaW5kaWNlczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbmRpY2VzfSxcbiAgICAgIHZlcnRpY2VzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVZlcnRpY2VzfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9LFxuICAgICAgLy8gSW5zdGFuY2VkIGF0dHJpYnV0ZXNcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgbm9BbGxvYzogdHJ1ZX1cbiAgICB9KTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShcbiAgICAgIGdsLFxuICAgICAgZ2xzbGlmeSgnLi92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeSgnLi9mcmFnbWVudC5nbHNsJyksXG4gICAgICAnY2hvcm9wbGV0aCdcbiAgICApO1xuXG4gICAgY29uc3QgcHJpbWl0aXZlID0ge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBkcmF3VHlwZTogdGhpcy5wcm9wcy5kcmF3Q29udG91ciA/ICdMSU5FUycgOiAnVFJJQU5HTEVTJyxcbiAgICAgIGluc3RhbmNlZDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXM6IDAsXG4gICAgICBwcm9ncmFtLFxuICAgICAgcHJpbWl0aXZlXG4gICAgfSk7XG5cbiAgICB0aGlzLmV4dHJhY3RDaG9yb3BsZXRocygpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICBjb25zdCB7ZGF0YUNoYW5nZWQsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuZXh0cmFjdENob3JvcGxldGhzKCk7XG4gICAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVWZXJ0aWNlcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGZsYXR0ZW5EZWVwKHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzKTtcbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluZGljZXMoYXR0cmlidXRlKSB7XG4gICAgLy8gYWRqdXN0IGluZGV4IG9mZnNldCBmb3IgbXVsdGlwbGUgY2hvcm9wbGV0aHNcbiAgICBjb25zdCBvZmZzZXRzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMucmVkdWNlKFxuICAgICAgKGFjYywgdmVydGljZXMpID0+IFsuLi5hY2MsIGFjY1thY2MubGVuZ3RoIC0gMV0gKyB2ZXJ0aWNlcy5sZW5ndGhdLFxuICAgICAgWzBdXG4gICAgKTtcblxuICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdGhpcy5kcmF3Q29udG91ciA/XG4gICAgICAgIC8vIDEuIGdldCBzZXF1ZW50aWFsbHkgb3JkZXJlZCBpbmRpY2VzIG9mIGVhY2ggY2hvcm9wbGV0aCBjb250b3VyXG4gICAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBjaG9yb3BsZXRoc1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLmxlbmd0aCkubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICkgOlxuICAgICAgICAvLyAxLiBnZXQgdHJpYW5ndWxhdGVkIGluZGljZXMgZm9yIHRoZSBpbnRlcm5hbCBhcmVhc1xuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgY2hvcm9wbGV0aHNcbiAgICAgICAgZWFyY3V0KGZsYXR0ZW5EZWVwKHZlcnRpY2VzKSwgbnVsbCwgMykubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IFVpbnQxNkFycmF5KGZsYXR0ZW5EZWVwKGluZGljZXMpKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICB2ZXJ0aWNlcyA9PiB2ZXJ0aWNlcy5tYXAoXG4gICAgICAgIHZlcnRleCA9PiB0aGlzLmRyYXdDb250b3VyID8gWzAsIDAsIDBdIDogWzEyOCwgMTI4LCAxMjhdXG4gICAgICApXG4gICAgKTtcblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAoY29sb3JzKSk7XG4gIH1cblxuICAvLyBPdmVycmlkZSB0aGUgZGVmYXVsdCBwaWNraW5nIGNvbG9ycyBjYWxjdWxhdGlvblxuICBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIC8vIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gY29uc3Qge3ZlcnRpY2VzOiB2YWx1ZX0gPSBhdHRyaWJ1dGVzXG4gICAgLy8gY29uc3QgcGlja2luZ0NvbG9ycyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlci5tYXAoXG4gICAgLy8gICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdmVydGljZXMubWFwKFxuICAgIC8vICAgICB2ZXJ0ZXggPT4gdGhpcy5kcmF3Q29udG91ciA/IFstMSwgLTEsIC0xXSA6IFtcbiAgICAvLyAgICAgICAoY2hvcm9wbGV0aEluZGV4ICsgMSkgJSAyNTYsXG4gICAgLy8gICAgICAgTWF0aC5mbG9vcigoY2hvcm9wbGV0aEluZGV4ICsgMSkgLyAyNTYpICUgMjU2LFxuICAgIC8vICAgICAgIHRoaXMubGF5ZXJJbmRleFxuICAgIC8vICAgICBdXG4gICAgLy8gICApXG4gICAgLy8gKTtcblxuICAgIC8vIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAocGlja2luZ0NvbG9ycykpO1xuICB9XG5cbiAgZXh0cmFjdENob3JvcGxldGhzKCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgbm9ybWFsaXplZEdlb2pzb24gPSBub3JtYWxpemUoZGF0YSk7XG5cbiAgICB0aGlzLnN0YXRlLmNob3JvcGxldGhzID0gbm9ybWFsaXplZEdlb2pzb24uZmVhdHVyZXMubWFwKGNob3JvcGxldGggPT4ge1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gY2hvcm9wbGV0aC5nZW9tZXRyeS5jb29yZGluYXRlc1swXTtcbiAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIHBvbHlnb25zXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSAxICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnRpZXM6IGNob3JvcGxldGgucHJvcGVydGllcyxcbiAgICAgICAgY29vcmRpbmF0ZXNcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcyA9IHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMubWFwKFxuICAgICAgY2hvcm9wbGV0aCA9PiBjaG9yb3BsZXRoLmNvb3JkaW5hdGVzLm1hcChcbiAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgMTAwXVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjYWxjdWxhdGVDb250b3VySW5kaWNlcyhudW1WZXJ0aWNlcykge1xuICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIGdsLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgIGxldCBpbmRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgaW5kaWNlcyA9IFsuLi5pbmRpY2VzLCBpLCBpXTtcbiAgICB9XG4gICAgcmV0dXJuIFswLCAuLi5pbmRpY2VzLCAwXTtcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtpbmRleH0gPSBpbmZvO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmVhdHVyZSA9IGRhdGEuZmVhdHVyZXNbaW5kZXhdO1xuICAgIHRoaXMucHJvcHMub25Ib3Zlcih7Li4uaW5mbywgZmVhdHVyZX0pO1xuICB9XG5cbiAgb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlID0gZGF0YS5mZWF0dXJlc1tpbmRleF07XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHsuLi5pbmZvLCBmZWF0dXJlfSk7XG4gIH1cblxufVxuIl19