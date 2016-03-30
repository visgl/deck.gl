'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; // Copyright (c) 2015 Uber Technologies, Inc.
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

/* global window */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _webglRenderer = require('./webgl-renderer');

var _webglRenderer2 = _interopRequireDefault(_webglRenderer);

var _flatWorld = require('./flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _layerManager = require('./layer-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var PROP_TYPES = {
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,
  layers: _react.PropTypes.array.isRequired
};

var DeckGLOverlay = (_class = function (_React$Component) {
  _inherits(DeckGLOverlay, _React$Component);

  _createClass(DeckGLOverlay, null, [{
    key: 'propTypes',
    get: function get() {
      return PROP_TYPES;
    }
  }]);

  function DeckGLOverlay(props) {
    _classCallCheck(this, DeckGLOverlay);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DeckGLOverlay).call(this, props));

    _this.state = {};
    _this.needsRedraw = true;
    return _this;
  }

  _createClass(DeckGLOverlay, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      (0, _layerManager.matchLayers)(this.props.layers, nextProps.layers);
      (0, _layerManager.finalizeOldLayers)(this.props.layers);
      (0, _layerManager.updateMatchedLayers)(nextProps.layers);
      this.initializeLayers(nextProps.layers);
    }
  }, {
    key: 'initializeLayers',
    value: function initializeLayers(layers) {
      var gl = this.state.gl;

      if (!gl) {
        return;
      }
      (0, _layerManager.initializeNewLayers)(layers, { gl: gl });
      this.addLayersToScene(layers);
    }
  }, {
    key: 'addLayersToScene',
    value: function addLayersToScene(layers) {
      var scene = this.state.scene;

      if (!scene) {
        return;
      }
      // clear scene and repopulate based on new layers
      scene.removeAll();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = layers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var layer = _step.value;

          // Save layer on model for picking purposes
          // TODO - store on model.userData rather than directly on model
          layer.state.model.userData.layer = layer;
          // Add model to scene
          scene.add(layer.state.model);
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
    key: '_onRendererInitialized',
    value: function _onRendererInitialized(_ref) {
      var gl = _ref.gl;
      var scene = _ref.scene;

      this.setState({ gl: gl, scene: scene });
      (0, _layerManager.initializeNewLayers)(this.props.layers, { gl: gl });
    }

    // Route events to layers

  }, {
    key: '_onClick',
    value: function _onClick(info) {
      var picked = info.picked;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = picked[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          if (item.model.userData.layer.onClick(_extends({ color: item.color }, info))) {
            return;
          }
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

    // Route events to layers

  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(info) {
      var picked = info.picked;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = picked[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var item = _step3.value;

          if (item.model.userData.layer.onHover(_extends({ color: item.color }, info))) {
            return;
          }
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
    key: '_checkIfNeedRedraw',
    value: function _checkIfNeedRedraw() {
      var layers = this.props.layers;

      return (0, _layerManager.layersNeedRedraw)(layers, { clearFlag: true });
    }

    // @autobind
    // onAfterRender

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var width = _props.width;
      var height = _props.height;
      var layers = _props.layers;

      var otherProps = _objectWithoutProperties(_props, ['width', 'height', 'layers']);

      // if (layers.length === 0) {
      //   return null;
      // }

      this.initializeLayers(layers);

      return _react2.default.createElement(_webglRenderer2.default, _extends({}, otherProps, {

        width: width,
        height: height,

        viewport: new _flatWorld2.default.Viewport(width, height),
        camera: _flatWorld2.default.getCamera(),
        lights: _flatWorld2.default.getLighting(),
        blending: _flatWorld2.default.getBlending(),
        pixelRatio: _flatWorld2.default.getPixelRatio(window.devicePixelRatio),

        onRendererInitialized: this._onRendererInitialized,
        onNeedRedraw: this._checkIfNeedRedraw,
        onMouseMove: this._onMouseMove,
        onClick: this._onClick }));
    }
  }]);

  return DeckGLOverlay;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, '_onRendererInitialized', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onRendererInitialized'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_checkIfNeedRedraw', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_checkIfNeedRedraw'), _class.prototype)), _class);
exports.default = DeckGLOverlay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNrZ2wtb3ZlcmxheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0JBLElBQU0sYUFBYTtBQUNqQixTQUFPLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUCxVQUFRLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUixVQUFRLGlCQUFVLEtBQVYsQ0FBZ0IsVUFBaEI7Q0FISjs7SUFNZTs7Ozs7d0JBRUk7QUFDckIsYUFBTyxVQUFQLENBRHFCOzs7O0FBSXZCLFdBTm1CLGFBTW5CLENBQVksS0FBWixFQUFtQjswQkFOQSxlQU1BOzt1RUFOQSwwQkFPWCxRQURXOztBQUVqQixVQUFLLEtBQUwsR0FBYSxFQUFiLENBRmlCO0FBR2pCLFVBQUssV0FBTCxHQUFtQixJQUFuQixDQUhpQjs7R0FBbkI7O2VBTm1COzs4Q0FZTyxXQUFXO0FBQ25DLHFDQUFZLEtBQUssS0FBTCxDQUFXLE1BQVgsRUFBbUIsVUFBVSxNQUFWLENBQS9CLENBRG1DO0FBRW5DLDJDQUFrQixLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWxCLENBRm1DO0FBR25DLDZDQUFvQixVQUFVLE1BQVYsQ0FBcEIsQ0FIbUM7QUFJbkMsV0FBSyxnQkFBTCxDQUFzQixVQUFVLE1BQVYsQ0FBdEIsQ0FKbUM7Ozs7cUNBT3BCLFFBQVE7VUFDaEIsS0FBTSxLQUFLLEtBQUwsQ0FBTixHQURnQjs7QUFFdkIsVUFBSSxDQUFDLEVBQUQsRUFBSztBQUNQLGVBRE87T0FBVDtBQUdBLDZDQUFvQixNQUFwQixFQUE0QixFQUFDLE1BQUQsRUFBNUIsRUFMdUI7QUFNdkIsV0FBSyxnQkFBTCxDQUFzQixNQUF0QixFQU51Qjs7OztxQ0FTUixRQUFRO1VBQ2hCLFFBQVMsS0FBSyxLQUFMLENBQVQsTUFEZ0I7O0FBRXZCLFVBQUksQ0FBQyxLQUFELEVBQVE7QUFDVixlQURVO09BQVo7O0FBRnVCLFdBTXZCLENBQU0sU0FBTixHQU51Qjs7Ozs7O0FBT3ZCLDZCQUFvQixnQ0FBcEIsb0dBQTRCO2NBQWpCLG9CQUFpQjs7OztBQUcxQixnQkFBTSxLQUFOLENBQVksS0FBWixDQUFrQixRQUFsQixDQUEyQixLQUEzQixHQUFtQyxLQUFuQzs7QUFIMEIsZUFLMUIsQ0FBTSxHQUFOLENBQVUsTUFBTSxLQUFOLENBQVksS0FBWixDQUFWLENBTDBCO1NBQTVCOzs7Ozs7Ozs7Ozs7OztPQVB1Qjs7OztpREFpQlc7VUFBWixhQUFZO1VBQVIsbUJBQVE7O0FBQ2xDLFdBQUssUUFBTCxDQUFjLEVBQUMsTUFBRCxFQUFLLFlBQUwsRUFBZCxFQURrQztBQUVsQyw2Q0FBb0IsS0FBSyxLQUFMLENBQVcsTUFBWCxFQUFtQixFQUFDLE1BQUQsRUFBdkMsRUFGa0M7Ozs7Ozs7NkJBTzNCLE1BQU07VUFDTixTQUFVLEtBQVYsT0FETTs7Ozs7O0FBRWIsOEJBQW1CLGlDQUFuQix3R0FBMkI7Y0FBaEIsb0JBQWdCOztBQUN6QixjQUFJLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsS0FBcEIsQ0FBMEIsT0FBMUIsWUFBbUMsT0FBTyxLQUFLLEtBQUwsSUFBZSxLQUF6RCxDQUFKLEVBQXFFO0FBQ25FLG1CQURtRTtXQUFyRTtTQURGOzs7Ozs7Ozs7Ozs7OztPQUZhOzs7Ozs7O2lDQVdGLE1BQU07VUFDVixTQUFVLEtBQVYsT0FEVTs7Ozs7O0FBRWpCLDhCQUFtQixpQ0FBbkIsd0dBQTJCO2NBQWhCLG9CQUFnQjs7QUFDekIsY0FBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLEtBQXBCLENBQTBCLE9BQTFCLFlBQW1DLE9BQU8sS0FBSyxLQUFMLElBQWUsS0FBekQsQ0FBSixFQUFxRTtBQUNuRSxtQkFEbUU7V0FBckU7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FGaUI7Ozs7eUNBVUU7VUFDWixTQUFVLEtBQUssS0FBTCxDQUFWLE9BRFk7O0FBRW5CLGFBQU8sb0NBQWlCLE1BQWpCLEVBQXlCLEVBQUMsV0FBVyxJQUFYLEVBQTFCLENBQVAsQ0FGbUI7Ozs7Ozs7OzZCQVFaO21CQUN3QyxLQUFLLEtBQUwsQ0FEeEM7VUFDQSxxQkFEQTtVQUNPLHVCQURQO1VBQ2UsdUJBRGY7O1VBQzBCOzs7Ozs7QUFEMUIsVUFPUCxDQUFLLGdCQUFMLENBQXNCLE1BQXRCLEVBUE87O0FBU1AsYUFDRSxvRUFDTzs7QUFFTCxlQUFRLEtBQVI7QUFDQSxnQkFBUyxNQUFUOztBQUVBLGtCQUFXLElBQUksb0JBQVUsUUFBVixDQUFtQixLQUF2QixFQUE4QixNQUE5QixDQUFYO0FBQ0EsZ0JBQVMsb0JBQVUsU0FBVixFQUFUO0FBQ0EsZ0JBQVMsb0JBQVUsV0FBVixFQUFUO0FBQ0Esa0JBQVcsb0JBQVUsV0FBVixFQUFYO0FBQ0Esb0JBQWEsb0JBQVUsYUFBVixDQUF3QixPQUFPLGdCQUFQLENBQXJDOztBQUVBLCtCQUF3QixLQUFLLHNCQUFMO0FBQ3hCLHNCQUFlLEtBQUssa0JBQUw7QUFDZixxQkFBYyxLQUFLLFlBQUw7QUFDZCxpQkFBVSxLQUFLLFFBQUwsR0FmWixDQURGLENBVE87Ozs7U0FqRlU7RUFBc0IsZ0JBQU0sU0FBTjtrQkFBdEIiLCJmaWxlIjoiZGVja2dsLW92ZXJsYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBhdXRvYmluZCBmcm9tICdhdXRvYmluZC1kZWNvcmF0b3InO1xuXG5pbXBvcnQgV2ViR0xSZW5kZXJlciBmcm9tICcuL3dlYmdsLXJlbmRlcmVyJztcbmltcG9ydCBmbGF0V29ybGQgZnJvbSAnLi9mbGF0LXdvcmxkJztcbmltcG9ydCB7XG4gIG1hdGNoTGF5ZXJzLCBmaW5hbGl6ZU9sZExheWVycywgdXBkYXRlTWF0Y2hlZExheWVycywgaW5pdGlhbGl6ZU5ld0xheWVycyxcbiAgbGF5ZXJzTmVlZFJlZHJhd1xufSBmcm9tICcuL2xheWVyLW1hbmFnZXInO1xuXG5jb25zdCBQUk9QX1RZUEVTID0ge1xuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgbGF5ZXJzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVja0dMT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIGdldCBwcm9wVHlwZXMoKSB7XG4gICAgcmV0dXJuIFBST1BfVFlQRVM7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge307XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgIG1hdGNoTGF5ZXJzKHRoaXMucHJvcHMubGF5ZXJzLCBuZXh0UHJvcHMubGF5ZXJzKTtcbiAgICBmaW5hbGl6ZU9sZExheWVycyh0aGlzLnByb3BzLmxheWVycyk7XG4gICAgdXBkYXRlTWF0Y2hlZExheWVycyhuZXh0UHJvcHMubGF5ZXJzKTtcbiAgICB0aGlzLmluaXRpYWxpemVMYXllcnMobmV4dFByb3BzLmxheWVycyk7XG4gIH1cblxuICBpbml0aWFsaXplTGF5ZXJzKGxheWVycykge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZ2wpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5pdGlhbGl6ZU5ld0xheWVycyhsYXllcnMsIHtnbH0pO1xuICAgIHRoaXMuYWRkTGF5ZXJzVG9TY2VuZShsYXllcnMpO1xuICB9XG5cbiAgYWRkTGF5ZXJzVG9TY2VuZShsYXllcnMpIHtcbiAgICBjb25zdCB7c2NlbmV9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoIXNjZW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNsZWFyIHNjZW5lIGFuZCByZXBvcHVsYXRlIGJhc2VkIG9uIG5ldyBsYXllcnNcbiAgICBzY2VuZS5yZW1vdmVBbGwoKTtcbiAgICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgICAgLy8gU2F2ZSBsYXllciBvbiBtb2RlbCBmb3IgcGlja2luZyBwdXJwb3Nlc1xuICAgICAgLy8gVE9ETyAtIHN0b3JlIG9uIG1vZGVsLnVzZXJEYXRhIHJhdGhlciB0aGFuIGRpcmVjdGx5IG9uIG1vZGVsXG4gICAgICBsYXllci5zdGF0ZS5tb2RlbC51c2VyRGF0YS5sYXllciA9IGxheWVyO1xuICAgICAgLy8gQWRkIG1vZGVsIHRvIHNjZW5lXG4gICAgICBzY2VuZS5hZGQobGF5ZXIuc3RhdGUubW9kZWwpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25SZW5kZXJlckluaXRpYWxpemVkKHtnbCwgc2NlbmV9KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Z2wsIHNjZW5lfSk7XG4gICAgaW5pdGlhbGl6ZU5ld0xheWVycyh0aGlzLnByb3BzLmxheWVycywge2dsfSk7XG4gIH1cblxuICAvLyBSb3V0ZSBldmVudHMgdG8gbGF5ZXJzXG4gIEBhdXRvYmluZFxuICBfb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge3BpY2tlZH0gPSBpbmZvO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBwaWNrZWQpIHtcbiAgICAgIGlmIChpdGVtLm1vZGVsLnVzZXJEYXRhLmxheWVyLm9uQ2xpY2soe2NvbG9yOiBpdGVtLmNvbG9yLCAuLi5pbmZvfSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICAgLy8gUm91dGUgZXZlbnRzIHRvIGxheWVyc1xuICBAYXV0b2JpbmRcbiAgX29uTW91c2VNb3ZlKGluZm8pIHtcbiAgICBjb25zdCB7cGlja2VkfSA9IGluZm87XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHBpY2tlZCkge1xuICAgICAgaWYgKGl0ZW0ubW9kZWwudXNlckRhdGEubGF5ZXIub25Ib3Zlcih7Y29sb3I6IGl0ZW0uY29sb3IsIC4uLmluZm99KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9jaGVja0lmTmVlZFJlZHJhdygpIHtcbiAgICBjb25zdCB7bGF5ZXJzfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGxheWVyc05lZWRSZWRyYXcobGF5ZXJzLCB7Y2xlYXJGbGFnOiB0cnVlfSk7XG4gIH1cblxuICAvLyBAYXV0b2JpbmRcbiAgLy8gb25BZnRlclJlbmRlclxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgbGF5ZXJzLCAuLi5vdGhlclByb3BzfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBpZiAobGF5ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vICAgcmV0dXJuIG51bGw7XG4gICAgLy8gfVxuXG4gICAgdGhpcy5pbml0aWFsaXplTGF5ZXJzKGxheWVycyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFdlYkdMUmVuZGVyZXJcbiAgICAgICAgeyAuLi5vdGhlclByb3BzIH1cblxuICAgICAgICB3aWR0aD17IHdpZHRoIH1cbiAgICAgICAgaGVpZ2h0PXsgaGVpZ2h0IH1cblxuICAgICAgICB2aWV3cG9ydD17IG5ldyBmbGF0V29ybGQuVmlld3BvcnQod2lkdGgsIGhlaWdodCkgfVxuICAgICAgICBjYW1lcmE9eyBmbGF0V29ybGQuZ2V0Q2FtZXJhKCkgfVxuICAgICAgICBsaWdodHM9eyBmbGF0V29ybGQuZ2V0TGlnaHRpbmcoKSB9XG4gICAgICAgIGJsZW5kaW5nPXsgZmxhdFdvcmxkLmdldEJsZW5kaW5nKCkgfVxuICAgICAgICBwaXhlbFJhdGlvPXsgZmxhdFdvcmxkLmdldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pIH1cblxuICAgICAgICBvblJlbmRlcmVySW5pdGlhbGl6ZWQ9eyB0aGlzLl9vblJlbmRlcmVySW5pdGlhbGl6ZWQgfVxuICAgICAgICBvbk5lZWRSZWRyYXc9eyB0aGlzLl9jaGVja0lmTmVlZFJlZHJhdyB9XG4gICAgICAgIG9uTW91c2VNb3ZlPXsgdGhpcy5fb25Nb3VzZU1vdmUgfVxuICAgICAgICBvbkNsaWNrPXsgdGhpcy5fb25DbGljayB9Lz5cbiAgICApO1xuICB9XG5cbn1cbiJdfQ==