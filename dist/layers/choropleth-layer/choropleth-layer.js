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
      _get(Object.getPrototypeOf(ChoroplethLayer.prototype), 'initializeState', this).call(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9jaG9yb3BsZXRoLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixZQUFVLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXhDO0FBQ0EsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7OztBQUhpQixDQUFiOztJQVFlOzs7Ozs7Ozs7Ozs7Ozs7O0FBYW5CLFdBYm1CLGVBYW5CLENBQVksSUFBWixFQUFrQjswQkFiQyxpQkFhRDs7a0VBYkMseUNBZVosUUFGVztHQUFsQjs7ZUFibUI7O3NDQW1CRDtBQUNoQixpQ0FwQmlCLCtEQW9CakIsQ0FEZ0I7bUJBRWUsS0FBSyxLQUFMLENBRmY7VUFFVCxlQUZTO1VBRUwsMkNBRks7OztBQUloQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7O0FBRXhDLGlCQUFTLEVBQUMsUUFBUSxLQUFLLGdCQUFMLEVBQWxCO0FBQ0Esa0JBQVUsRUFBQyxRQUFRLEtBQUssaUJBQUwsRUFBbkI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCOztBQUVBLHVCQUFlLEVBQUMsUUFBUSxLQUFLLHNCQUFMLEVBQTZCLFNBQVMsSUFBVCxFQUFyRDtPQU5GLEVBSmdCOztBQWFoQixXQUFLLFFBQUwsQ0FBYztBQUNaLHNC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QixFQUEyQjtBQUN6RCx3QkFBYyxZQUFZLENBQVosQ0FBZCxDQUR5RDtTQUEzRDtBQUdBLGVBQU87QUFDTCxzQkFBWSxXQUFXLFVBQVg7QUFDWixrQ0FGSztTQUFQLENBTm9FO09BQWQsQ0FBeEQsQ0FKbUI7O0FBZ0JuQixXQUFLLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBdUIsR0FBdkIsQ0FDM0I7ZUFBYyxXQUFXLFdBQVgsQ0FBdUIsR0FBdkIsQ0FDWjtpQkFBYyxDQUFDLFdBQVcsQ0FBWCxDQUFELEVBQWdCLFdBQVcsQ0FBWCxDQUFoQixFQUErQixHQUEvQjtTQUFkO09BREYsQ0FERixDQWhCbUI7Ozs7NENBdUJHLGFBQWE7O0FBRW5DLFVBQUksVUFBVSxFQUFWLENBRitCO0FBR25DLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLGNBQWMsQ0FBZCxFQUFpQixHQUFyQyxFQUEwQztBQUN4QywrQ0FBYyxXQUFTLEdBQUcsR0FBMUIsQ0FEd0M7T0FBMUM7QUFHQSxjQUFRLDZCQUFNLFdBQVMsR0FBdkIsQ0FObUM7Ozs7NEJBUzdCLE1BQU07VUFDTCxRQUFTLEtBQVQsTUFESztVQUVMLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FGSzs7QUFHWixVQUFNLFVBQVUsS0FBSyxRQUFMLENBQWMsS0FBZCxDQUFWLENBSE07QUFJWixXQUFLLEtBQUwsQ0FBVyxPQUFYLGNBQXVCLFFBQU0sbUJBQTdCLEVBSlk7Ozs7NEJBT04sTUFBTTtVQUNMLFFBQVMsS0FBVCxNQURLO1VBRUwsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQUZLOztBQUdaLFVBQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQVYsQ0FITTtBQUlaLFdBQUssS0FBTCxDQUFXLE9BQVgsY0FBdUIsUUFBTSxtQkFBN0IsRUFKWTs7OztTQS9KSyIsImZpbGUiOiJjaG9yb3BsZXRoLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge01vZGVsLCBQcm9ncmFtLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICB2ZXJ0aWNlczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGluc3RhbmNlczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG4gIC8vIE92ZXJyaWRlIHBpY2tpbmcgY29sb3JzIHRvIHByZXZlbnQgYXV0byBhbGxvY2F0aW9uXG4gIC8vIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hvcm9wbGV0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBDaG9yb3BsZXRoTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqIEBwYXJhbSB7Ym9vbH0gb3B0cy5kcmF3Q29udG91ciAtID8gZHJhd0NvbnRvdXIgOiBkcmF3QXJlYVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uQ2hvcm9wbGV0aEhvdmVyZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBob3ZlcmVkXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25DaG9yb3BsZXRoQ2xpY2tlZCAtIHByb3ZpZGUgcHJvZXJ0aWVzIG9mIHRoZVxuICAgKiBzZWxlY3RlZCBjaG9yb3BsZXRoLCB0b2dldGhlciB3aXRoIHRoZSBtb3VzZSBldmVudCB3aGVuIG1vdXNlIGNsaWNrZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcih7XG4gICAgICAuLi5vcHRzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICAvLyBQcmltdGl2ZSBhdHRyaWJ1dGVzXG4gICAgICBpbmRpY2VzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluZGljZXN9LFxuICAgICAgdmVydGljZXM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlVmVydGljZXN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc30sXG4gICAgICAvLyBJbnN0YW5jZWQgYXR0cmlidXRlc1xuICAgICAgcGlja2luZ0NvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzLCBub0FsbG9jOiB0cnVlfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXM6IDAsXG4gICAgICBtb2RlbDogdGhpcy5nZXRNb2RlbChnbClcbiAgICB9KTtcblxuICAgIHRoaXMuZXh0cmFjdENob3JvcGxldGhzKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIGNvbnN0IHtkYXRhQ2hhbmdlZCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChkYXRhQ2hhbmdlZCkge1xuICAgICAgdGhpcy5leHRyYWN0Q2hvcm9wbGV0aHMoKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZGVsKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9jaG9yb3BsZXRoLWxheWVyLXZlcnRleC5nbHNsJyksXG4gICAgICAgIGZzOiBnbHNsaWZ5KCcuL2Nob3JvcGxldGgtbGF5ZXItZnJhZ21lbnQuZ2xzbCcpLFxuICAgICAgICBpZDogJ2Nob3JvcGxldGgnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgICAgZHJhd01vZGU6IHRoaXMucHJvcHMuZHJhd0NvbnRvdXIgPyAnTElORVMnIDogJ1RSSUFOR0xFUydcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVWZXJ0aWNlcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGZsYXR0ZW5EZWVwKHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzKTtcbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluZGljZXMoYXR0cmlidXRlKSB7XG4gICAgLy8gYWRqdXN0IGluZGV4IG9mZnNldCBmb3IgbXVsdGlwbGUgY2hvcm9wbGV0aHNcbiAgICBjb25zdCBvZmZzZXRzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMucmVkdWNlKFxuICAgICAgKGFjYywgdmVydGljZXMpID0+IFsuLi5hY2MsIGFjY1thY2MubGVuZ3RoIC0gMV0gKyB2ZXJ0aWNlcy5sZW5ndGhdLFxuICAgICAgWzBdXG4gICAgKTtcblxuICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdGhpcy5kcmF3Q29udG91ciA/XG4gICAgICAgIC8vIDEuIGdldCBzZXF1ZW50aWFsbHkgb3JkZXJlZCBpbmRpY2VzIG9mIGVhY2ggY2hvcm9wbGV0aCBjb250b3VyXG4gICAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBjaG9yb3BsZXRoc1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLmxlbmd0aCkubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICkgOlxuICAgICAgICAvLyAxLiBnZXQgdHJpYW5ndWxhdGVkIGluZGljZXMgZm9yIHRoZSBpbnRlcm5hbCBhcmVhc1xuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgY2hvcm9wbGV0aHNcbiAgICAgICAgZWFyY3V0KGZsYXR0ZW5EZWVwKHZlcnRpY2VzKSwgbnVsbCwgMykubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IFVpbnQxNkFycmF5KGZsYXR0ZW5EZWVwKGluZGljZXMpKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICB2ZXJ0aWNlcyA9PiB2ZXJ0aWNlcy5tYXAoXG4gICAgICAgIHZlcnRleCA9PiB0aGlzLmRyYXdDb250b3VyID8gWzAsIDAsIDBdIDogWzEyOCwgMTI4LCAxMjhdXG4gICAgICApXG4gICAgKTtcblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAoY29sb3JzKSk7XG4gIH1cblxuICAvLyBPdmVycmlkZSB0aGUgZGVmYXVsdCBwaWNraW5nIGNvbG9ycyBjYWxjdWxhdGlvblxuICBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIC8vIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gY29uc3Qge3ZlcnRpY2VzOiB2YWx1ZX0gPSBhdHRyaWJ1dGVNYW5hZ2VyXG4gICAgLy8gY29uc3QgcGlja2luZ0NvbG9ycyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlci5tYXAoXG4gICAgLy8gICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdmVydGljZXMubWFwKFxuICAgIC8vICAgICB2ZXJ0ZXggPT4gdGhpcy5kcmF3Q29udG91ciA/IFstMSwgLTEsIC0xXSA6IFtcbiAgICAvLyAgICAgICAoY2hvcm9wbGV0aEluZGV4ICsgMSkgJSAyNTYsXG4gICAgLy8gICAgICAgTWF0aC5mbG9vcigoY2hvcm9wbGV0aEluZGV4ICsgMSkgLyAyNTYpICUgMjU2LFxuICAgIC8vICAgICAgIHRoaXMubGF5ZXJJbmRleFxuICAgIC8vICAgICBdXG4gICAgLy8gICApXG4gICAgLy8gKTtcblxuICAgIC8vIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAocGlja2luZ0NvbG9ycykpO1xuICB9XG5cbiAgZXh0cmFjdENob3JvcGxldGhzKCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgbm9ybWFsaXplZEdlb2pzb24gPSBub3JtYWxpemUoZGF0YSk7XG5cbiAgICB0aGlzLnN0YXRlLmNob3JvcGxldGhzID0gbm9ybWFsaXplZEdlb2pzb24uZmVhdHVyZXMubWFwKGNob3JvcGxldGggPT4ge1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gY2hvcm9wbGV0aC5nZW9tZXRyeS5jb29yZGluYXRlc1swXTtcbiAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIHBvbHlnb25zXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSAxICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnRpZXM6IGNob3JvcGxldGgucHJvcGVydGllcyxcbiAgICAgICAgY29vcmRpbmF0ZXNcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcyA9IHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMubWFwKFxuICAgICAgY2hvcm9wbGV0aCA9PiBjaG9yb3BsZXRoLmNvb3JkaW5hdGVzLm1hcChcbiAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgMTAwXVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjYWxjdWxhdGVDb250b3VySW5kaWNlcyhudW1WZXJ0aWNlcykge1xuICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIGdsLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgIGxldCBpbmRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgaW5kaWNlcyA9IFsuLi5pbmRpY2VzLCBpLCBpXTtcbiAgICB9XG4gICAgcmV0dXJuIFswLCAuLi5pbmRpY2VzLCAwXTtcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtpbmRleH0gPSBpbmZvO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmVhdHVyZSA9IGRhdGEuZmVhdHVyZXNbaW5kZXhdO1xuICAgIHRoaXMucHJvcHMub25Ib3Zlcih7Li4uaW5mbywgZmVhdHVyZX0pO1xuICB9XG5cbiAgb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlID0gZGF0YS5mZWF0dXJlc1tpbmRleF07XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHsuLi5pbmZvLCBmZWF0dXJlfSk7XG4gIH1cblxufVxuIl19