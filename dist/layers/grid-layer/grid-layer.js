'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _layer = require('../../layer');

var _layer2 = _interopRequireDefault(_layer);

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
  positions: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  colors: { size: 4, '0': 'red', '1': 'green', '2': 'blue', '3': 'alpha' }
};

var GridLayer = function (_Layer) {
  _inherits(GridLayer, _Layer);

  _createClass(GridLayer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * GridLayer
     *
     * @class
     * @param {object} opts
     * @param {number} opts.unitWidth - width of the unit rectangle
     * @param {number} opts.unitHeight - height of the unit rectangle
     */

  }]);

  function GridLayer(opts) {
    _classCallCheck(this, GridLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GridLayer).call(this, _extends({
      unitWidth: 100,
      unitHeight: 100
    }, opts)));
  }

  _createClass(GridLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      this.setState({
        model: this.getModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });

      this.updateCell();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(GridLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var cellSizeChanged = newProps.unitWidth !== oldProps.unitWidth || newProps.unitHeight !== oldProps.unitHeight;

      if (cellSizeChanged || this.state.viewportChanged) {
        this.updateCell();
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./grid-layer-vertex.glsl'),
          fs: glslify('./grid-layer-fragment.glsl'),
          id: 'grid'
        }),
        geometry: new _luma.Geometry({
          id: this.props.id,
          drawMode: 'TRIANGLE_FAN',
          vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
        }),
        instanced: true
      });
    }
  }, {
    key: 'updateCell',
    value: function updateCell() {
      var _props = this.props;
      var width = _props.width;
      var height = _props.height;
      var unitWidth = _props.unitWidth;
      var unitHeight = _props.unitHeight;


      var numCol = Math.ceil(width * 2 / unitWidth);
      var numRow = Math.ceil(height * 2 / unitHeight);
      this.setState({
        numCol: numCol,
        numRow: numRow,
        numInstances: numCol * numRow
      });

      var attributeManager = this.state.attributeManager;

      attributeManager.invalidateAll();

      var MARGIN = 2;
      var scale = new Float32Array([unitWidth - MARGIN * 2, unitHeight - MARGIN * 2, 1]);
      this.setUniforms({ scale: scale });
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute, numInstances) {
      var _props2 = this.props;
      var unitWidth = _props2.unitWidth;
      var unitHeight = _props2.unitHeight;
      var width = _props2.width;
      var height = _props2.height;
      var numCol = this.state.numCol;
      var value = attribute.value;
      var size = attribute.size;


      for (var i = 0; i < numInstances; i++) {
        var x = i % numCol;
        var y = Math.floor(i / numCol);
        value[i * size + 0] = x * unitWidth - width;
        value[i * size + 1] = y * unitHeight - height;
        value[i * size + 2] = 0;
      }
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _props3 = this.props;
      var data = _props3.data;
      var unitWidth = _props3.unitWidth;
      var unitHeight = _props3.unitHeight;
      var width = _props3.width;
      var height = _props3.height;
      var _state2 = this.state;
      var numCol = _state2.numCol;
      var numRow = _state2.numRow;
      var value = attribute.value;
      var size = attribute.size;


      value.fill(0.0);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var pixel = this.project([point.position.y, point.position.x]);
          var space = this.screenToSpace(pixel);

          var colId = Math.floor((space.x + width) / unitWidth);
          var rowId = Math.floor((space.y + height) / unitHeight);
          if (colId < numCol && rowId < numRow) {
            var i4 = (colId + rowId * numCol) * size;
            value[i4 + 2] = value[i4 + 0] += 1;
            value[i4 + 1] += 5;
            value[i4 + 3] = 0.6;
          }
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

      this.setUniforms({ maxCount: Math.max.apply(Math, _toConsumableArray(value)) });
    }
  }]);

  return GridLayer;
}(_layer2.default);

exports.default = GridLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ3JpZC1sYXllci9ncmlkLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUFhLEtBQUssT0FBTCxFQUF6RDtDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7OztBQWF4QixXQWZtQixTQWVuQixDQUFZLElBQVosRUFBa0I7MEJBZkMsV0FlRDs7a0VBZkM7QUFpQmYsaUJBQVcsR0FBWDtBQUNBLGtCQUFZLEdBQVo7T0FDRyxRQUpXO0dBQWxCOztlQWZtQjs7c0NBdUJEO21CQUNlLEtBQUssS0FBTCxDQURmO1VBQ1QsZUFEUztVQUNMLDJDQURLOzs7QUFHaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssUUFBTCxDQUFjLEVBQWQsQ0FBUDtPQURGLEVBSGdCOztBQU9oQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCO09BRkYsRUFQZ0I7O0FBWWhCLFdBQUssVUFBTCxHQVpnQjs7OztxQ0FlRCxVQUFVLFVBQVU7QUFDbkMsaUNBdkNpQiwyREF1Q00sVUFBVSxTQUFqQyxDQURtQzs7QUFHbkMsVUFBTSxrQkFDSixTQUFTLFNBQVQsS0FBdUIsU0FBUyxTQUFULElB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QixjQUFNLFFBQVEsS0FBSyxPQUFMLENBQWEsQ0FBQyxNQUFNLFFBQU4sQ0FBZSxDQUFmLEVBQWtCLE1BQU0sUUFBTixDQUFlLENBQWYsQ0FBaEMsQ0FBUixDQURrQjtBQUV4QixjQUFNLFFBQVEsS0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQVIsQ0FGa0I7O0FBSXhCLGNBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxDQUFDLE1BQU0sQ0FBTixHQUFVLEtBQVYsQ0FBRCxHQUFvQixTQUFwQixDQUFuQixDQUprQjtBQUt4QixjQUFNLFFBQVEsS0FBSyxLQUFMLENBQVcsQ0FBQyxNQUFNLENBQU4sR0FBVSxNQUFWLENBQUQsR0FBcUIsVUFBckIsQ0FBbkIsQ0FMa0I7QUFNeEIsY0FBSSxRQUFRLE1BQVIsSUFBa0IsUUFBUSxNQUFSLEVBQWdCO0FBQ3BDLGdCQUFNLEtBQUssQ0FBQyxRQUFRLFFBQVEsTUFBUixDQUFULEdBQTJCLElBQTNCLENBRHlCO0FBRXBDLGtCQUFNLEtBQUssQ0FBTCxDQUFOLEdBQWdCLE1BQU0sS0FBSyxDQUFMLENBQU4sSUFBaUIsQ0FBakIsQ0FGb0I7QUFHcEMsa0JBQU0sS0FBSyxDQUFMLENBQU4sSUFBaUIsQ0FBakIsQ0FIb0M7QUFJcEMsa0JBQU0sS0FBSyxDQUFMLENBQU4sR0FBZ0IsR0FBaEIsQ0FKb0M7V0FBdEM7U0FORjs7Ozs7Ozs7Ozs7Ozs7T0FQeUI7O0FBcUJ6QixXQUFLLFdBQUwsQ0FBaUIsRUFBQyxVQUFVLEtBQUssR0FBTCxnQ0FBWSxNQUFaLENBQVYsRUFBbEIsRUFyQnlCOzs7O1NBeEdSIiwiZmlsZSI6ImdyaWQtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbCwgUHJvZ3JhbSwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogNCwgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJywgJzMnOiAnYWxwaGEnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JpZExheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEdyaWRMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMudW5pdFdpZHRoIC0gd2lkdGggb2YgdGhlIHVuaXQgcmVjdGFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLnVuaXRIZWlnaHQgLSBoZWlnaHQgb2YgdGhlIHVuaXQgcmVjdGFuZ2xlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgdW5pdFdpZHRoOiAxMDAsXG4gICAgICB1bml0SGVpZ2h0OiAxMDAsXG4gICAgICAuLi5vcHRzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVsKGdsKVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc30sXG4gICAgICBjb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfVxuICAgIH0pO1xuXG4gICAgdGhpcy51cGRhdGVDZWxsKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIGNvbnN0IGNlbGxTaXplQ2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy51bml0V2lkdGggIT09IG9sZFByb3BzLnVuaXRXaWR0aCB8fFxuICAgICAgbmV3UHJvcHMudW5pdEhlaWdodCAhPT0gb2xkUHJvcHMudW5pdEhlaWdodDtcblxuICAgIGlmIChjZWxsU2l6ZUNoYW5nZWQgfHwgdGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMudXBkYXRlQ2VsbCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZGVsKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9ncmlkLWxheWVyLXZlcnRleC5nbHNsJyksXG4gICAgICAgIGZzOiBnbHNsaWZ5KCcuL2dyaWQtbGF5ZXItZnJhZ21lbnQuZ2xzbCcpLFxuICAgICAgICBpZDogJ2dyaWQnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgICAgZHJhd01vZGU6ICdUUklBTkdMRV9GQU4nLFxuICAgICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMCwgMCwgMSwgMF0pXG4gICAgICB9KSxcbiAgICAgIGluc3RhbmNlZDogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlQ2VsbCgpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgdW5pdFdpZHRoLCB1bml0SGVpZ2h0fSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBudW1Db2wgPSBNYXRoLmNlaWwod2lkdGggKiAyIC8gdW5pdFdpZHRoKTtcbiAgICBjb25zdCBudW1Sb3cgPSBNYXRoLmNlaWwoaGVpZ2h0ICogMiAvIHVuaXRIZWlnaHQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbnVtQ29sLFxuICAgICAgbnVtUm93LFxuICAgICAgbnVtSW5zdGFuY2VzOiBudW1Db2wgKiBudW1Sb3dcbiAgICB9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG5cbiAgICBjb25zdCBNQVJHSU4gPSAyO1xuICAgIGNvbnN0IHNjYWxlID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICB1bml0V2lkdGggLSBNQVJHSU4gKiAyLFxuICAgICAgdW5pdEhlaWdodCAtIE1BUkdJTiAqIDIsXG4gICAgICAxXG4gICAgXSk7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7c2NhbGV9KTtcblxuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSwgbnVtSW5zdGFuY2VzKSB7XG4gICAgY29uc3Qge3VuaXRXaWR0aCwgdW5pdEhlaWdodCwgd2lkdGgsIGhlaWdodH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtudW1Db2x9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgY29uc3QgeCA9IGkgJSBudW1Db2w7XG4gICAgICBjb25zdCB5ID0gTWF0aC5mbG9vcihpIC8gbnVtQ29sKTtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSB4ICogdW5pdFdpZHRoIC0gd2lkdGg7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0geSAqIHVuaXRIZWlnaHQgLSBoZWlnaHQ7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDJdID0gMDtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIHVuaXRXaWR0aCwgdW5pdEhlaWdodCwgd2lkdGgsIGhlaWdodH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtudW1Db2wsIG51bVJvd30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICB2YWx1ZS5maWxsKDAuMCk7XG5cbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBpeGVsID0gdGhpcy5wcm9qZWN0KFtwb2ludC5wb3NpdGlvbi55LCBwb2ludC5wb3NpdGlvbi54XSk7XG4gICAgICBjb25zdCBzcGFjZSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbCk7XG5cbiAgICAgIGNvbnN0IGNvbElkID0gTWF0aC5mbG9vcigoc3BhY2UueCArIHdpZHRoKSAvIHVuaXRXaWR0aCk7XG4gICAgICBjb25zdCByb3dJZCA9IE1hdGguZmxvb3IoKHNwYWNlLnkgKyBoZWlnaHQpIC8gdW5pdEhlaWdodCk7XG4gICAgICBpZiAoY29sSWQgPCBudW1Db2wgJiYgcm93SWQgPCBudW1Sb3cpIHtcbiAgICAgICAgY29uc3QgaTQgPSAoY29sSWQgKyByb3dJZCAqIG51bUNvbCkgKiBzaXplO1xuICAgICAgICB2YWx1ZVtpNCArIDJdID0gdmFsdWVbaTQgKyAwXSArPSAxO1xuICAgICAgICB2YWx1ZVtpNCArIDFdICs9IDU7XG4gICAgICAgIHZhbHVlW2k0ICsgM10gPSAwLjY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7bWF4Q291bnQ6IE1hdGgubWF4KC4uLnZhbHVlKX0pO1xuICB9XG5cbn1cbiJdfQ==