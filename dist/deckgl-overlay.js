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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNrZ2wtb3ZlcmxheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsSUFBTSxhQUFhO0FBQ2pCLFNBQU8saUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNQLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNSLFVBQVEsaUJBQVUsS0FBVixDQUFnQixVQUFoQjtDQUhKOztJQU1lOzs7Ozt3QkFFSTtBQUNyQixhQUFPLFVBQVAsQ0FEcUI7Ozs7QUFJdkIsV0FObUIsYUFNbkIsQ0FBWSxLQUFaLEVBQW1COzBCQU5BLGVBTUE7O3VFQU5BLDBCQU9YLFFBRFc7O0FBRWpCLFVBQUssS0FBTCxHQUFhLEVBQWIsQ0FGaUI7QUFHakIsVUFBSyxXQUFMLEdBQW1CLElBQW5CLENBSGlCOztHQUFuQjs7ZUFObUI7OzhDQVlPLFdBQVc7QUFDbkMscUNBQVksS0FBSyxLQUFMLENBQVcsTUFBWCxFQUFtQixVQUFVLE1BQVYsQ0FBL0IsQ0FEbUM7QUFFbkMsMkNBQWtCLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBbEIsQ0FGbUM7QUFHbkMsNkNBQW9CLFVBQVUsTUFBVixDQUFwQixDQUhtQztBQUluQyxXQUFLLGdCQUFMLENBQXNCLFVBQVUsTUFBVixDQUF0QixDQUptQzs7OztxQ0FPcEIsUUFBUTtVQUNoQixLQUFNLEtBQUssS0FBTCxDQUFOLEdBRGdCOztBQUV2QixVQUFJLENBQUMsRUFBRCxFQUFLO0FBQ1AsZUFETztPQUFUO0FBR0EsNkNBQW9CLE1BQXBCLEVBQTRCLEVBQUMsTUFBRCxFQUE1QixFQUx1QjtBQU12QixXQUFLLGdCQUFMLENBQXNCLE1BQXRCLEVBTnVCOzs7O3FDQVNSLFFBQVE7VUFDaEIsUUFBUyxLQUFLLEtBQUwsQ0FBVCxNQURnQjs7QUFFdkIsVUFBSSxDQUFDLEtBQUQsRUFBUTtBQUNWLGVBRFU7T0FBWjs7QUFGdUIsV0FNdkIsQ0FBTSxTQUFOLEdBTnVCOzs7Ozs7QUFPdkIsNkJBQW9CLGdDQUFwQixvR0FBNEI7Y0FBakIsb0JBQWlCOzs7O0FBRzFCLGdCQUFNLEtBQU4sQ0FBWSxLQUFaLENBQWtCLFFBQWxCLENBQTJCLEtBQTNCLEdBQW1DLEtBQW5DOztBQUgwQixlQUsxQixDQUFNLEdBQU4sQ0FBVSxNQUFNLEtBQU4sQ0FBWSxLQUFaLENBQVYsQ0FMMEI7U0FBNUI7Ozs7Ozs7Ozs7Ozs7O09BUHVCOzs7O2lEQWlCVztVQUFaLGFBQVk7VUFBUixtQkFBUTs7QUFDbEMsV0FBSyxRQUFMLENBQWMsRUFBQyxNQUFELEVBQUssWUFBTCxFQUFkLEVBRGtDO0FBRWxDLDZDQUFvQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEVBQW1CLEVBQUMsTUFBRCxFQUF2QyxFQUZrQzs7Ozs7Ozs2QkFPM0IsTUFBTTtVQUNOLFNBQVUsS0FBVixPQURNOzs7Ozs7QUFFYiw4QkFBbUIsaUNBQW5CLHdHQUEyQjtjQUFoQixvQkFBZ0I7O0FBQ3pCLGNBQUksS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixLQUFwQixDQUEwQixPQUExQixZQUFtQyxPQUFPLEtBQUssS0FBTCxJQUFlLEtBQXpELENBQUosRUFBcUU7QUFDbkUsbUJBRG1FO1dBQXJFO1NBREY7Ozs7Ozs7Ozs7Ozs7O09BRmE7Ozs7Ozs7aUNBV0YsTUFBTTtVQUNWLFNBQVUsS0FBVixPQURVOzs7Ozs7QUFFakIsOEJBQW1CLGlDQUFuQix3R0FBMkI7Y0FBaEIsb0JBQWdCOztBQUN6QixjQUFJLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsS0FBcEIsQ0FBMEIsT0FBMUIsWUFBbUMsT0FBTyxLQUFLLEtBQUwsSUFBZSxLQUF6RCxDQUFKLEVBQXFFO0FBQ25FLG1CQURtRTtXQUFyRTtTQURGOzs7Ozs7Ozs7Ozs7OztPQUZpQjs7Ozt5Q0FVRTtVQUNaLFNBQVUsS0FBSyxLQUFMLENBQVYsT0FEWTs7QUFFbkIsYUFBTyxvQ0FBaUIsTUFBakIsRUFBeUIsRUFBQyxXQUFXLElBQVgsRUFBMUIsQ0FBUCxDQUZtQjs7Ozs7Ozs7NkJBUVo7bUJBQ3dDLEtBQUssS0FBTCxDQUR4QztVQUNBLHFCQURBO1VBQ08sdUJBRFA7VUFDZSx1QkFEZjs7VUFDMEI7Ozs7OztBQUQxQixVQU9QLENBQUssZ0JBQUwsQ0FBc0IsTUFBdEIsRUFQTzs7QUFTUCxhQUNFLG9FQUNPOztBQUVMLGVBQVEsS0FBUjtBQUNBLGdCQUFTLE1BQVQ7O0FBRUEsa0JBQVcsSUFBSSxvQkFBVSxRQUFWLENBQW1CLEtBQXZCLEVBQThCLE1BQTlCLENBQVg7QUFDQSxnQkFBUyxvQkFBVSxTQUFWLEVBQVQ7QUFDQSxnQkFBUyxvQkFBVSxXQUFWLEVBQVQ7QUFDQSxrQkFBVyxvQkFBVSxXQUFWLEVBQVg7QUFDQSxvQkFBYSxvQkFBVSxhQUFWLENBQXdCLE9BQU8sZ0JBQVAsQ0FBckM7O0FBRUEsK0JBQXdCLEtBQUssc0JBQUw7QUFDeEIsc0JBQWUsS0FBSyxrQkFBTDtBQUNmLHFCQUFjLEtBQUssWUFBTDtBQUNkLGlCQUFVLEtBQUssUUFBTCxHQWZaLENBREYsQ0FUTzs7OztTQWpGVTtFQUFzQixnQkFBTSxTQUFOO2tCQUF0QiIsImZpbGUiOiJkZWNrZ2wtb3ZlcmxheS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJ2F1dG9iaW5kLWRlY29yYXRvcic7XG5cbmltcG9ydCBXZWJHTFJlbmRlcmVyIGZyb20gJy4vd2ViZ2wtcmVuZGVyZXInO1xuaW1wb3J0IGZsYXRXb3JsZCBmcm9tICcuL2ZsYXQtd29ybGQnO1xuaW1wb3J0IHtcbiAgbWF0Y2hMYXllcnMsIGZpbmFsaXplT2xkTGF5ZXJzLCB1cGRhdGVNYXRjaGVkTGF5ZXJzLCBpbml0aWFsaXplTmV3TGF5ZXJzLFxuICBsYXllcnNOZWVkUmVkcmF3XG59IGZyb20gJy4vbGF5ZXItbWFuYWdlcic7XG5cbmNvbnN0IFBST1BfVFlQRVMgPSB7XG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBsYXllcnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWNrR0xPdmVybGF5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgZ2V0IHByb3BUeXBlcygpIHtcbiAgICByZXR1cm4gUFJPUF9UWVBFUztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgbWF0Y2hMYXllcnModGhpcy5wcm9wcy5sYXllcnMsIG5leHRQcm9wcy5sYXllcnMpO1xuICAgIGZpbmFsaXplT2xkTGF5ZXJzKHRoaXMucHJvcHMubGF5ZXJzKTtcbiAgICB1cGRhdGVNYXRjaGVkTGF5ZXJzKG5leHRQcm9wcy5sYXllcnMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZUxheWVycyhuZXh0UHJvcHMubGF5ZXJzKTtcbiAgfVxuXG4gIGluaXRpYWxpemVMYXllcnMobGF5ZXJzKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFnbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbml0aWFsaXplTmV3TGF5ZXJzKGxheWVycywge2dsfSk7XG4gICAgdGhpcy5hZGRMYXllcnNUb1NjZW5lKGxheWVycyk7XG4gIH1cblxuICBhZGRMYXllcnNUb1NjZW5lKGxheWVycykge1xuICAgIGNvbnN0IHtzY2VuZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghc2NlbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gY2xlYXIgc2NlbmUgYW5kIHJlcG9wdWxhdGUgYmFzZWQgb24gbmV3IGxheWVyc1xuICAgIHNjZW5lLnJlbW92ZUFsbCgpO1xuICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbGF5ZXJzKSB7XG4gICAgICAvLyBTYXZlIGxheWVyIG9uIG1vZGVsIGZvciBwaWNraW5nIHB1cnBvc2VzXG4gICAgICAvLyBUT0RPIC0gc3RvcmUgb24gbW9kZWwudXNlckRhdGEgcmF0aGVyIHRoYW4gZGlyZWN0bHkgb24gbW9kZWxcbiAgICAgIGxheWVyLnN0YXRlLm1vZGVsLnVzZXJEYXRhLmxheWVyID0gbGF5ZXI7XG4gICAgICAvLyBBZGQgbW9kZWwgdG8gc2NlbmVcbiAgICAgIHNjZW5lLmFkZChsYXllci5zdGF0ZS5tb2RlbCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9vblJlbmRlcmVySW5pdGlhbGl6ZWQoe2dsLCBzY2VuZX0pIHtcbiAgICB0aGlzLnNldFN0YXRlKHtnbCwgc2NlbmV9KTtcbiAgICBpbml0aWFsaXplTmV3TGF5ZXJzKHRoaXMucHJvcHMubGF5ZXJzLCB7Z2x9KTtcbiAgfVxuXG4gIC8vIFJvdXRlIGV2ZW50cyB0byBsYXllcnNcbiAgQGF1dG9iaW5kXG4gIF9vbkNsaWNrKGluZm8pIHtcbiAgICBjb25zdCB7cGlja2VkfSA9IGluZm87XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHBpY2tlZCkge1xuICAgICAgaWYgKGl0ZW0ubW9kZWwudXNlckRhdGEubGF5ZXIub25DbGljayh7Y29sb3I6IGl0ZW0uY29sb3IsIC4uLmluZm99KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgICAvLyBSb3V0ZSBldmVudHMgdG8gbGF5ZXJzXG4gIEBhdXRvYmluZFxuICBfb25Nb3VzZU1vdmUoaW5mbykge1xuICAgIGNvbnN0IHtwaWNrZWR9ID0gaW5mbztcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcGlja2VkKSB7XG4gICAgICBpZiAoaXRlbS5tb2RlbC51c2VyRGF0YS5sYXllci5vbkhvdmVyKHtjb2xvcjogaXRlbS5jb2xvciwgLi4uaW5mb30pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX2NoZWNrSWZOZWVkUmVkcmF3KCkge1xuICAgIGNvbnN0IHtsYXllcnN9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gbGF5ZXJzTmVlZFJlZHJhdyhsYXllcnMsIHtjbGVhckZsYWc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIEBhdXRvYmluZFxuICAvLyBvbkFmdGVyUmVuZGVyXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBsYXllcnMsIC4uLm90aGVyUHJvcHN9ID0gdGhpcy5wcm9wcztcblxuICAgIC8vIGlmIChsYXllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gICByZXR1cm4gbnVsbDtcbiAgICAvLyB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVMYXllcnMobGF5ZXJzKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8V2ViR0xSZW5kZXJlclxuICAgICAgICB7IC4uLm90aGVyUHJvcHMgfVxuXG4gICAgICAgIHdpZHRoPXsgd2lkdGggfVxuICAgICAgICBoZWlnaHQ9eyBoZWlnaHQgfVxuXG4gICAgICAgIHZpZXdwb3J0PXsgbmV3IGZsYXRXb3JsZC5WaWV3cG9ydCh3aWR0aCwgaGVpZ2h0KSB9XG4gICAgICAgIGNhbWVyYT17IGZsYXRXb3JsZC5nZXRDYW1lcmEoKSB9XG4gICAgICAgIGxpZ2h0cz17IGZsYXRXb3JsZC5nZXRMaWdodGluZygpIH1cbiAgICAgICAgYmxlbmRpbmc9eyBmbGF0V29ybGQuZ2V0QmxlbmRpbmcoKSB9XG4gICAgICAgIHBpeGVsUmF0aW89eyBmbGF0V29ybGQuZ2V0UGl4ZWxSYXRpbyh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbykgfVxuXG4gICAgICAgIG9uUmVuZGVyZXJJbml0aWFsaXplZD17IHRoaXMuX29uUmVuZGVyZXJJbml0aWFsaXplZCB9XG4gICAgICAgIG9uTmVlZFJlZHJhdz17IHRoaXMuX2NoZWNrSWZOZWVkUmVkcmF3IH1cbiAgICAgICAgb25Nb3VzZU1vdmU9eyB0aGlzLl9vbk1vdXNlTW92ZSB9XG4gICAgICAgIG9uQ2xpY2s9eyB0aGlzLl9vbkNsaWNrIH0vPlxuICAgICk7XG4gIH1cblxufVxuIl19