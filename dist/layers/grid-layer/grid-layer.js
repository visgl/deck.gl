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
        })
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

          var pixel = this.project([point.position.x, point.position.y]);
          var space = this.screenToSpace(pixel);

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

      this.setUniforms({ maxCount: Math.max.apply(Math, _toConsumableArray(value)) });
    }
  }]);

  return GridLayer;
}(_layer2.default);

exports.default = GridLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ3JpZC1sYXllci9ncmlkLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7OztBQWF4QixXQWZtQixTQWVuQixDQUFZLElBQVosRUFBa0I7MEJBZkMsV0FlRDs7a0VBZkM7QUFpQmYsaUJBQVcsR0FBWDtBQUNBLGtCQUFZLEdBQVo7T0FDRyxRQUpXO0dBQWxCOztlQWZtQjs7c0NBdUJEO0FBQ2hCLGlDQXhCaUIseURBd0JqQixDQURnQjs7bUJBR2UsS0FBSyxLQUFMLENBSGY7VUFHVCxlQUhTO1VBR0wsMkNBSEs7OztBQUtoQixXQUFLLFFBQUwsQ0FBYztBQUNaLGVBQU8sS0FBSyxRQUFMLENBQWMsRUFBZCxDQUFQO09BREYsRUFMZ0I7O0FBU2hCLHVCQUFpQixZQUFqQixDQUE4QixVQUE5QixFQUEwQztBQUN4QyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtBQUNBLGdCQUFRLEVBQUMsUUFBUSxLQUFLLGVBQUwsRUFBakI7T0FGRixFQVRnQjs7QUFjaEIsV0FBSyxVQUFMLEdBZGdCOzs7O3FDQWlCRCxVQUFVLFVBQVU7QUFDbkMsaUNBekNpQiwyREF5Q00sVUFBVSxTQUFqQyxDQURtQzs7QUFHbkMsVUFBTSxrQkFDSixTQUFTLFNBQVQsS0FB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Y0FBTSxRQUFRLEtBQUssT0FBTCxDQUFhLENBQUMsTUFBTSxRQUFOLENBQWUsQ0FBZixFQUFrQixNQUFNLFFBQU4sQ0FBZSxDQUFmLENBQWhDLENBQVIsQ0FEa0I7QUFFeEIsY0FBTSxRQUFRLEtBQUssYUFBTCxDQUFtQixLQUFuQixDQUFSLENBRmtCOztBQUl4QixjQUFNLFFBQVEsS0FBSyxLQUFMLENBQVcsQ0FBQyxNQUFNLENBQU4sR0FBVSxLQUFWLENBQUQsR0FBb0IsU0FBcEIsQ0FBbkIsQ0FKa0I7QUFLeEIsY0FBTSxRQUFRLEtBQUssS0FBTCxDQUFXLENBQUMsTUFBTSxDQUFOLEdBQVUsTUFBVixDQUFELEdBQXFCLFVBQXJCLENBQW5CLENBTGtCO0FBTXhCLGNBQUksUUFBUSxNQUFSLElBQWtCLFFBQVEsTUFBUixFQUFnQjtBQUNwQyxnQkFBTSxLQUFLLENBQUMsUUFBUSxRQUFRLE1BQVIsQ0FBVCxHQUEyQixJQUEzQixDQUR5QjtBQUVwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUZvQztBQUdwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUhvQztBQUlwQyxrQkFBTSxLQUFLLENBQUwsQ0FBTixJQUFpQixDQUFqQixDQUpvQztXQUF0QztTQU5GOzs7Ozs7Ozs7Ozs7OztPQVB5Qjs7QUFxQnpCLFdBQUssV0FBTCxDQUFpQixFQUFDLFVBQVUsS0FBSyxHQUFMLGdDQUFZLE1BQVosQ0FBVixFQUFsQixFQXJCeUI7Ozs7U0F6R1IiLCJmaWxlIjoiZ3JpZC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBMYXllciBmcm9tICcuLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsLCBQcm9ncmFtLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JpZExheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEdyaWRMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMudW5pdFdpZHRoIC0gd2lkdGggb2YgdGhlIHVuaXQgcmVjdGFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLnVuaXRIZWlnaHQgLSBoZWlnaHQgb2YgdGhlIHVuaXQgcmVjdGFuZ2xlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgdW5pdFdpZHRoOiAxMDAsXG4gICAgICB1bml0SGVpZ2h0OiAxMDAsXG4gICAgICAuLi5vcHRzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG5cbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZUNlbGwoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3QgY2VsbFNpemVDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLnVuaXRXaWR0aCAhPT0gb2xkUHJvcHMudW5pdFdpZHRoIHx8XG4gICAgICBuZXdQcm9wcy51bml0SGVpZ2h0ICE9PSBvbGRQcm9wcy51bml0SGVpZ2h0O1xuXG4gICAgaWYgKGNlbGxTaXplQ2hhbmdlZCB8fCB0aGlzLnN0YXRlLnZpZXdwb3J0Q2hhbmdlZCkge1xuICAgICAgdGhpcy51cGRhdGVDZWxsKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2dyaWQtbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vZ3JpZC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnZ3JpZCdcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVDZWxsKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB1bml0V2lkdGgsIHVuaXRIZWlnaHR9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IG51bUNvbCA9IE1hdGguY2VpbCh3aWR0aCAqIDIgLyB1bml0V2lkdGgpO1xuICAgIGNvbnN0IG51bVJvdyA9IE1hdGguY2VpbChoZWlnaHQgKiAyIC8gdW5pdEhlaWdodCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1Db2wsXG4gICAgICBudW1Sb3csXG4gICAgICBudW1JbnN0YW5jZXM6IG51bUNvbCAqIG51bVJvd1xuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgIGNvbnN0IE1BUkdJTiA9IDI7XG4gICAgY29uc3Qgc2NhbGUgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgIHVuaXRXaWR0aCAtIE1BUkdJTiAqIDIsXG4gICAgICB1bml0SGVpZ2h0IC0gTUFSR0lOICogMixcbiAgICAgIDFcbiAgICBdKTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtzY2FsZX0pO1xuXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIG51bUNvbDtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyBudW1Db2wpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IHggKiB1bml0V2lkdGggLSB3aWR0aDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSB5ICogdW5pdEhlaWdodCAtIGhlaWdodDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgdW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbCwgbnVtUm93fSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcblxuICAgIHZhbHVlLmZpbGwoMC4wKTtcblxuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcGl4ZWwgPSB0aGlzLnByb2plY3QoW3BvaW50LnBvc2l0aW9uLngsIHBvaW50LnBvc2l0aW9uLnldKTtcbiAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHBpeGVsKTtcblxuICAgICAgY29uc3QgY29sSWQgPSBNYXRoLmZsb29yKChzcGFjZS54ICsgd2lkdGgpIC8gdW5pdFdpZHRoKTtcbiAgICAgIGNvbnN0IHJvd0lkID0gTWF0aC5mbG9vcigoc3BhY2UueSArIGhlaWdodCkgLyB1bml0SGVpZ2h0KTtcbiAgICAgIGlmIChjb2xJZCA8IG51bUNvbCAmJiByb3dJZCA8IG51bVJvdykge1xuICAgICAgICBjb25zdCBpMyA9IChjb2xJZCArIHJvd0lkICogbnVtQ29sKSAqIHNpemU7XG4gICAgICAgIHZhbHVlW2kzICsgMF0gKz0gMTtcbiAgICAgICAgdmFsdWVbaTMgKyAxXSArPSA1O1xuICAgICAgICB2YWx1ZVtpMyArIDJdICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7bWF4Q291bnQ6IE1hdGgubWF4KC4uLnZhbHVlKX0pO1xuICB9XG5cbn1cbiJdfQ==