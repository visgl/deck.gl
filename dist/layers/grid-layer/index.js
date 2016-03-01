'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _layer = require('../layer');

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
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' }
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
      _get(Object.getPrototypeOf(GridLayer.prototype), 'initializeState', this).call(this);

      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'grid');

      var geometry = {
        drawType: 'TRIANGLE_FAN',
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      };

      var primitive = _extends({
        id: this.props.id,
        instanced: true
      }, geometry);

      this.setState({
        program: program,
        primitive: primitive
      });

      attributes.addInstanced(ATTRIBUTES, {
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

      var attributes = this.state.attributes;

      attributes.invalidateAll();

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
      var _Math;

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

          var pixel = this.project([point.position.x, point.position.y]);
          var space = this.screenToSpace(pixel.x, pixel.y);

          var colId = Math.floor((space.x + width) / unitWidth);
          var rowId = Math.floor((space.y + height) / unitHeight);
          if (colId < numCol && rowId < numRow) {
            var i3 = (colId + rowId * numCol) * size;
            value[i3 + 0] += 1;
            value[i3 + 1] += 5;
            value[i3 + 2] += 1;
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

      this.setUniforms({ maxCount: (_Math = Math).max.apply(_Math, _toConsumableArray(value)) });
    }
  }]);

  return GridLayer;
}(_layer2.default);

exports.default = GridLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ3JpZC1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBekM7QUFDQSxVQUFRLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxLQUFMLEVBQVksS0FBSyxPQUFMLEVBQWMsS0FBSyxNQUFMLEVBQTVDO0NBRkk7O0lBS2U7Ozs7O3dCQUVLO0FBQ3RCLGFBQU8sVUFBUCxDQURzQjs7Ozs7Ozs7Ozs7Ozs7O0FBYXhCLFdBZm1CLFNBZW5CLENBQVksSUFBWixFQUFrQjswQkFmQyxXQWVEOztrRUFmQztBQWlCZixpQkFBVyxHQUFYO0FBQ0Esa0JBQVksR0FBWjtPQUNHLFFBSlc7R0FBbEI7O2VBZm1COztzQ0F1QkQ7QUFDaEIsaUNBeEJpQix5REF3QmpCLENBRGdCOzttQkFHUyxLQUFLLEtBQUwsQ0FIVDtVQUdULGVBSFM7VUFHTCwrQkFISzs7O0FBS2hCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxlQUFSLENBRmMsRUFHZCxRQUFRLGlCQUFSLENBSGMsRUFJZCxNQUpjLENBQVYsQ0FMVTs7QUFZaEIsVUFBTSxXQUFXO0FBQ2Ysa0JBQVUsY0FBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLENBQWpCLENBQVY7T0FGSSxDQVpVOztBQWlCaEIsVUFBTTtB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LENBQWYsRUFBa0IsTUFBTSxRQUFOLENBQWUsQ0FBZixDQUFoQyxDQUFSLENBRGtCO0FBRXhCLGNBQU0sUUFBUSxLQUFLLGFBQUwsQ0FBbUIsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQXBDLENBRmtCOztBQUl4QixjQUFNLFFBQVEsS0FBSyxLQUFMLENBQVcsQ0FBQyxNQUFNLENBQU4sR0FBVSxLQUFWLENBQUQsR0FBb0IsU0FBcEIsQ0FBbkIsQ0FKa0I7QUFLeEIsY0FBTSxRQUFRLEtBQUssS0FBTCxDQUFXLENBQUMsTUFBTSxDQUFOLEdBQVUsTUFBVixDQUFELEdBQXFCLFVBQXJCLENBQW5CLENBTGtCO0FBTXhCLGNBQUksUUFBUSxNQUFSLElBQWtCLFFBQVEsTUFBUixFQUFnQjtBQUNwQyxnQkFBTSxLQUFLLENBQUMsUUFBUSxRQUFRLE1BQVIsQ0FBVCxHQUEyQixJQUEzQixDQUR5QjtBQUVwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUZvQztBQUdwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUhvQztBQUlwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUpvQztXQUF0QztTQU5GOzs7Ozs7Ozs7Ozs7OztPQVB5Qjs7QUFxQnpCLFdBQUssV0FBTCxDQUFpQixFQUFDLFVBQVUsZUFBSyxHQUFMLGlDQUFZLE1BQVosQ0FBVixFQUFsQixFQXJCeUI7Ozs7U0E3R1IiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vbGF5ZXInO1xuaW1wb3J0IHtQcm9ncmFtfSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogR3JpZExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy51bml0V2lkdGggLSB3aWR0aCBvZiB0aGUgdW5pdCByZWN0YW5nbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMudW5pdEhlaWdodCAtIGhlaWdodCBvZiB0aGUgdW5pdCByZWN0YW5nbGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcih7XG4gICAgICB1bml0V2lkdGg6IDEwMCxcbiAgICAgIHVuaXRIZWlnaHQ6IDEwMCxcbiAgICAgIC4uLm9wdHNcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKFxuICAgICAgZ2wsXG4gICAgICBnbHNsaWZ5KCcuL3ZlcnRleC5nbHNsJyksXG4gICAgICBnbHNsaWZ5KCcuL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdncmlkJ1xuICAgICk7XG5cbiAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgIGRyYXdUeXBlOiAnVFJJQU5HTEVfRkFOJyxcbiAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICB9O1xuXG4gICAgY29uc3QgcHJpbWl0aXZlID0ge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBpbnN0YW5jZWQ6IHRydWUsXG4gICAgICAuLi5nZW9tZXRyeVxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmVcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ2VsbCgpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICBjb25zdCBjZWxsU2l6ZUNoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMudW5pdFdpZHRoICE9PSBvbGRQcm9wcy51bml0V2lkdGggfHxcbiAgICAgIG5ld1Byb3BzLnVuaXRIZWlnaHQgIT09IG9sZFByb3BzLnVuaXRIZWlnaHQ7XG5cbiAgICBpZiAoY2VsbFNpemVDaGFuZ2VkIHx8IHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLnVwZGF0ZUNlbGwoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDZWxsKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB1bml0V2lkdGgsIHVuaXRIZWlnaHR9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IG51bUNvbCA9IE1hdGguY2VpbCh3aWR0aCAqIDIgLyB1bml0V2lkdGgpO1xuICAgIGNvbnN0IG51bVJvdyA9IE1hdGguY2VpbChoZWlnaHQgKiAyIC8gdW5pdEhlaWdodCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1Db2wsXG4gICAgICBudW1Sb3csXG4gICAgICBudW1JbnN0YW5jZXM6IG51bUNvbCAqIG51bVJvd1xuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGVBbGwoKTtcblxuICAgIGNvbnN0IE1BUkdJTiA9IDI7XG4gICAgY29uc3Qgc2NhbGUgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgIHVuaXRXaWR0aCAtIE1BUkdJTiAqIDIsXG4gICAgICB1bml0SGVpZ2h0IC0gTUFSR0lOICogMixcbiAgICAgIDFcbiAgICBdKTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtzY2FsZX0pO1xuXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIG51bUNvbDtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyBudW1Db2wpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IHggKiB1bml0V2lkdGggLSB3aWR0aDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSB5ICogdW5pdEhlaWdodCAtIGhlaWdodDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgdW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbCwgbnVtUm93fSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcblxuICAgIHZhbHVlLmZpbGwoMC4wKTtcblxuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcGl4ZWwgPSB0aGlzLnByb2plY3QoW3BvaW50LnBvc2l0aW9uLngsIHBvaW50LnBvc2l0aW9uLnldKTtcbiAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHBpeGVsLngsIHBpeGVsLnkpO1xuXG4gICAgICBjb25zdCBjb2xJZCA9IE1hdGguZmxvb3IoKHNwYWNlLnggKyB3aWR0aCkgLyB1bml0V2lkdGgpO1xuICAgICAgY29uc3Qgcm93SWQgPSBNYXRoLmZsb29yKChzcGFjZS55ICsgaGVpZ2h0KSAvIHVuaXRIZWlnaHQpO1xuICAgICAgaWYgKGNvbElkIDwgbnVtQ29sICYmIHJvd0lkIDwgbnVtUm93KSB7XG4gICAgICAgIGNvbnN0IGkzID0gKGNvbElkICsgcm93SWQgKiBudW1Db2wpICogc2l6ZTtcbiAgICAgICAgdmFsdWVbaTMgKyAwXSArPSAxO1xuICAgICAgICB2YWx1ZVtpMyArIDFdICs9IDU7XG4gICAgICAgIHZhbHVlW2kzICsgMl0gKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHttYXhDb3VudDogTWF0aC5tYXgoLi4udmFsdWUpfSk7XG4gIH1cblxufVxuIl19