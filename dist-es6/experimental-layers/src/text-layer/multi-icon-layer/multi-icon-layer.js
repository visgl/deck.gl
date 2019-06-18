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

import { IconLayer, experimental } from 'deck.gl';
var enable64bitSupport = experimental.enable64bitSupport;


import vs from './multi-icon-layer-vertex.glsl';
import vs64 from './multi-icon-layer-vertex-64.glsl';

var defaultProps = {
  getIndexOfIcon: function getIndexOfIcon(x) {
    return x.index || 0;
  },
  getNumOfIcon: function getNumOfIcon(x) {
    return x.len || 1;
  },
  // 1: left, 0: middle, -1: right
  getAnchorX: function getAnchorX(x) {
    return x.anchorX || 0;
  },
  // 1: top, 0: center, -1: bottom
  getAnchorY: function getAnchorY(x) {
    return x.anchorY || 0;
  },
  getPixelOffset: function getPixelOffset(x) {
    return x.pixelOffset || [0, 0];
  }
};

var MultiIconLayer = function (_IconLayer) {
  _inherits(MultiIconLayer, _IconLayer);

  function MultiIconLayer() {
    _classCallCheck(this, MultiIconLayer);

    return _possibleConstructorReturn(this, (MultiIconLayer.__proto__ || Object.getPrototypeOf(MultiIconLayer)).apply(this, arguments));
  }

  _createClass(MultiIconLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      var multiIconVs = enable64bitSupport(this.props) ? vs64 : vs;
      return Object.assign({}, _get(MultiIconLayer.prototype.__proto__ || Object.getPrototypeOf(MultiIconLayer.prototype), 'getShaders', this).call(this), {
        vs: multiIconVs
      });
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      _get(MultiIconLayer.prototype.__proto__ || Object.getPrototypeOf(MultiIconLayer.prototype), 'initializeState', this).call(this);

      var attributeManager = this.state.attributeManager;

      attributeManager.addInstanced({
        instanceIndexOfIcon: {
          size: 1,
          accessor: 'getIndexOfIcon',
          update: this.calculateInstanceIndexOfIcon
        },
        instanceNumOfIcon: {
          size: 1,
          accessor: 'getNumOfIcon',
          update: this.calculateInstanceNumOfIcon
        },
        instancePixelOffset: {
          size: 2,
          accessor: 'getPixelOffset',
          update: this.calculatePixelOffset
        }
      });
    }
  }, {
    key: 'calculateInstanceIndexOfIcon',
    value: function calculateInstanceIndexOfIcon(attribute) {
      var _props = this.props,
          data = _props.data,
          getIndexOfIcon = _props.getIndexOfIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          value[i++] = getIndexOfIcon(object);
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
    key: 'calculateInstanceNumOfIcon',
    value: function calculateInstanceNumOfIcon(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getNumOfIcon = _props2.getNumOfIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          value[i++] = getNumOfIcon(object);
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
    key: 'calculateInstanceOffsets',
    value: function calculateInstanceOffsets(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          iconMapping = _props3.iconMapping,
          getIcon = _props3.getIcon,
          getAnchorX = _props3.getAnchorX,
          getAnchorY = _props3.getAnchorY,
          getNumOfIcon = _props3.getNumOfIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var icon = getIcon(object);
          var rect = iconMapping[icon] || {};
          value[i++] = rect.width / 2 * getAnchorX(object) * getNumOfIcon(object) || 0;
          value[i++] = rect.height / 2 * getAnchorY(object) || 0;
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
  }, {
    key: 'calculatePixelOffset',
    value: function calculatePixelOffset(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getPixelOffset = _props4.getPixelOffset;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          var pixelOffset = getPixelOffset(object);
          value[i++] = pixelOffset[0] || 0;
          value[i++] = pixelOffset[1] || 0;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return MultiIconLayer;
}(IconLayer);

export default MultiIconLayer;


MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy90ZXh0LWxheWVyL211bHRpLWljb24tbGF5ZXIvbXVsdGktaWNvbi1sYXllci5qcyJdLCJuYW1lcyI6WyJJY29uTGF5ZXIiLCJleHBlcmltZW50YWwiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJ2cyIsInZzNjQiLCJkZWZhdWx0UHJvcHMiLCJnZXRJbmRleE9mSWNvbiIsIngiLCJpbmRleCIsImdldE51bU9mSWNvbiIsImxlbiIsImdldEFuY2hvclgiLCJhbmNob3JYIiwiZ2V0QW5jaG9yWSIsImFuY2hvclkiLCJnZXRQaXhlbE9mZnNldCIsInBpeGVsT2Zmc2V0IiwiTXVsdGlJY29uTGF5ZXIiLCJtdWx0aUljb25WcyIsInByb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VJbmRleE9mSWNvbiIsInNpemUiLCJhY2Nlc3NvciIsInVwZGF0ZSIsImNhbGN1bGF0ZUluc3RhbmNlSW5kZXhPZkljb24iLCJpbnN0YW5jZU51bU9mSWNvbiIsImNhbGN1bGF0ZUluc3RhbmNlTnVtT2ZJY29uIiwiaW5zdGFuY2VQaXhlbE9mZnNldCIsImNhbGN1bGF0ZVBpeGVsT2Zmc2V0IiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwiaSIsIm9iamVjdCIsImljb25NYXBwaW5nIiwiZ2V0SWNvbiIsImljb24iLCJyZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxTQUFSLEVBQW1CQyxZQUFuQixRQUFzQyxTQUF0QztJQUNPQyxrQixHQUFzQkQsWSxDQUF0QkMsa0I7OztB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QVI2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUy9COzs7O0VBdEV5Q2hCLFM7O2VBQXZCaUIsYzs7O0FBeUVyQkEsZUFBZTRCLFNBQWYsR0FBMkIsZ0JBQTNCO0FBQ0E1QixlQUFlWixZQUFmLEdBQThCQSxZQUE5QiIsImZpbGUiOiJtdWx0aS1pY29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7SWNvbkxheWVyLCBleHBlcmltZW50YWx9IGZyb20gJ2RlY2suZ2wnO1xuY29uc3Qge2VuYWJsZTY0Yml0U3VwcG9ydH0gPSBleHBlcmltZW50YWw7XG5cbmltcG9ydCB2cyBmcm9tICcuL211bHRpLWljb24tbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9tdWx0aS1pY29uLWxheWVyLXZlcnRleC02NC5nbHNsJztcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBnZXRJbmRleE9mSWNvbjogeCA9PiB4LmluZGV4IHx8IDAsXG4gIGdldE51bU9mSWNvbjogeCA9PiB4LmxlbiB8fCAxLFxuICAvLyAxOiBsZWZ0LCAwOiBtaWRkbGUsIC0xOiByaWdodFxuICBnZXRBbmNob3JYOiB4ID0+IHguYW5jaG9yWCB8fCAwLFxuICAvLyAxOiB0b3AsIDA6IGNlbnRlciwgLTE6IGJvdHRvbVxuICBnZXRBbmNob3JZOiB4ID0+IHguYW5jaG9yWSB8fCAwLFxuICBnZXRQaXhlbE9mZnNldDogeCA9PiB4LnBpeGVsT2Zmc2V0IHx8IFswLCAwXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXVsdGlJY29uTGF5ZXIgZXh0ZW5kcyBJY29uTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIGNvbnN0IG11bHRpSWNvblZzID0gZW5hYmxlNjRiaXRTdXBwb3J0KHRoaXMucHJvcHMpID8gdnM2NCA6IHZzO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdXBlci5nZXRTaGFkZXJzKCksIHtcbiAgICAgIHZzOiBtdWx0aUljb25Wc1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICBpbnN0YW5jZUluZGV4T2ZJY29uOiB7XG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGFjY2Vzc29yOiAnZ2V0SW5kZXhPZkljb24nLFxuICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VJbmRleE9mSWNvblxuICAgICAgfSxcbiAgICAgIGluc3RhbmNlTnVtT2ZJY29uOiB7XG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGFjY2Vzc29yOiAnZ2V0TnVtT2ZJY29uJyxcbiAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlTnVtT2ZJY29uXG4gICAgICB9LFxuICAgICAgaW5zdGFuY2VQaXhlbE9mZnNldDoge1xuICAgICAgICBzaXplOiAyLFxuICAgICAgICBhY2Nlc3NvcjogJ2dldFBpeGVsT2Zmc2V0JyxcbiAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBpeGVsT2Zmc2V0XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUluZGV4T2ZJY29uKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRJbmRleE9mSWNvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2krK10gPSBnZXRJbmRleE9mSWNvbihvYmplY3QpO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlTnVtT2ZJY29uKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXROdW1PZkljb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpKytdID0gZ2V0TnVtT2ZJY29uKG9iamVjdCk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VPZmZzZXRzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBpY29uTWFwcGluZywgZ2V0SWNvbiwgZ2V0QW5jaG9yWCwgZ2V0QW5jaG9yWSwgZ2V0TnVtT2ZJY29ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgaWNvbiA9IGdldEljb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IHJlY3QgPSBpY29uTWFwcGluZ1tpY29uXSB8fCB7fTtcbiAgICAgIHZhbHVlW2krK10gPSByZWN0LndpZHRoIC8gMiAqIGdldEFuY2hvclgob2JqZWN0KSAqIGdldE51bU9mSWNvbihvYmplY3QpIHx8IDA7XG4gICAgICB2YWx1ZVtpKytdID0gcmVjdC5oZWlnaHQgLyAyICogZ2V0QW5jaG9yWShvYmplY3QpIHx8IDA7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlUGl4ZWxPZmZzZXQoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBpeGVsT2Zmc2V0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcGl4ZWxPZmZzZXQgPSBnZXRQaXhlbE9mZnNldChvYmplY3QpO1xuICAgICAgdmFsdWVbaSsrXSA9IHBpeGVsT2Zmc2V0WzBdIHx8IDA7XG4gICAgICB2YWx1ZVtpKytdID0gcGl4ZWxPZmZzZXRbMV0gfHwgMDtcbiAgICB9XG4gIH1cbn1cblxuTXVsdGlJY29uTGF5ZXIubGF5ZXJOYW1lID0gJ011bHRpSWNvbkxheWVyJztcbk11bHRpSWNvbkxheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==