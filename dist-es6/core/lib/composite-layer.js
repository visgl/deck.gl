var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
import Layer from './layer';
import log from '../utils/log';
import { flatten } from '../utils/flatten';

var CompositeLayer = function (_Layer) {
  _inherits(CompositeLayer, _Layer);

  function CompositeLayer(props) {
    _classCallCheck(this, CompositeLayer);

    return _possibleConstructorReturn(this, (CompositeLayer.__proto__ || Object.getPrototypeOf(CompositeLayer)).call(this, props));
  }

  _createClass(CompositeLayer, [{
    key: 'getSubLayers',
    value: function getSubLayers() {
      return this.internalState.subLayers || [];
    }

    // initializeState is usually not needed for composite layers
    // Provide empty definition to disable check for missing definition

  }, {
    key: 'initializeState',
    value: function initializeState() {}

    // called to augment the info object that is bubbled up from a sublayer
    // override Layer.getPickingInfo() because decoding / setting uniform do
    // not apply to a composite layer.
    // @return null to cancel event

  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref) {
      var info = _ref.info;

      return info;
    }

    // Implement to generate subLayers

  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      return null;
    }

    // Returns sub layer props for a specific sublayer

  }, {
    key: 'getSubLayerProps',
    value: function getSubLayerProps(sublayerProps) {
      var _props = this.props,
          opacity = _props.opacity,
          pickable = _props.pickable,
          visible = _props.visible,
          parameters = _props.parameters,
          getPolygonOffset = _props.getPolygonOffset,
          highlightedObjectIndex = _props.highlightedObjectIndex,
          autoHighlight = _props.autoHighlight,
          highlightColor = _props.highlightColor,
          coordinateSystem = _props.coordinateSystem,
          coordinateOrigin = _props.coordinateOrigin,
          modelMatrix = _props.modelMatrix;

      var newProps = {
        opacity: opacity, pickable: pickable, visible: visible,
        parameters: parameters, getPolygonOffset: getPolygonOffset,
        highlightedObjectIndex: highlightedObjectIndex, autoHighlight: autoHighlight, highlightColor: highlightColor,
        coordinateSystem: coordinateSystem, coordinateOrigin: coordinateOrigin, modelMatrix: modelMatrix
      };

      if (sublayerProps) {
        Object.assign(newProps, sublayerProps, {
          id: this.props.id + '-' + sublayerProps.id,
          updateTriggers: Object.assign({
            all: this.props.updateTriggers.all
          }, sublayerProps.updateTriggers)
        });
      }

      return newProps;
    }

    // Called by layer manager to render subLayers

  }, {
    key: '_renderLayers',
    value: function _renderLayers() {
      var subLayers = this.internalState.subLayers;

      if (subLayers && !this.needsUpdate()) {
        log.log(3, 'Composite layer reused subLayers ' + this, this.internalState.subLayers);
      } else {
        subLayers = this.renderLayers();
        // Flatten the returned array, removing any null, undefined or false
        // this allows layers to render sublayers conditionally
        // (see CompositeLayer.renderLayers docs)
        subLayers = flatten(subLayers, { filter: Boolean });
        this.internalState.subLayers = subLayers;
        log.log(2, 'Composite layer rendered new subLayers ' + this, subLayers);
      }

      // populate reference to parent layer (this layer)
      // NOTE: needs to be done even when reusing layers as the parent may have changed
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = subLayers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var layer = _step.value;

          layer.parentLayer = this;
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
    key: 'isComposite',
    get: function get() {
      return true;
    }
  }]);

  return CompositeLayer;
}(Layer);

export default CompositeLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9jb21wb3NpdGUtbGF5ZXIuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJsb2ciLCJmbGF0dGVuIiwiQ29tcG9zaXRlTGF5ZXIiLCJwcm9wcyIsImludGVybmFsU3RhdGUiLCJzdWJMYXllcnMiLCJpbmZvIiwic3VibGF5ZXJQcm9wcyIsIm9wYWNpdHkiLCJwaWNrYWJsZSIsInZpc2libGUiLCJwYXJhbWV0ZXJzIiwiZ2V0UG9seWdvbk9mZnNldCIsImhpZ2hsaWdodGVkT2JqZWN0SW5kZXgiLCJhdXRvSGlnaGxpZ2h0IiwiaGlnaGxpZ2h0Q29sb3IiLCJjb29yZGluYXRlU3lzdGVtIiwiY29vcmRpbmF0ZU9yaWdpbiIsIm1vZGVsTWF0cml4IiwibmV3UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJpZCIsInVwZGF0ZVRyaWdnZXJzIiwiYWxsIiwibmVlZHNVcGRhdGUiLCJyZW5kZXJMYXllcnMiLCJmaWx0ZXIiLCJCb29sZWFuIiwibGF5ZXIiLCJwYXJlbnRMYXllciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU9BLEtBQVAsTUFBa0IsU0FBbEI7QUFDQSxPQUFPQyxHQUFQLE1BQWdCLGNBQWhCO0FBQ0EsU0FBUUMsT0FBUixRQUFzQixrQkFBdEI7O0lBRXFCQyxjOzs7QUFDbkIsMEJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSwySEFDWEEsS0FEVztBQUVsQjs7OzttQ0FNYztBQUNiLGFBQU8sS0FBS0MsYUFBTCxDQUFtQkMsU0FBbkIsSUFBZ0MsRUFBdkM7QUFDRDs7QUFFRDtBQUNBOzs7O3NDQUNrQixDQUNqQjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7Ozt5Q0FDdUI7QUFBQSxVQUFQQyxJQUFPLFFBQVBBLElBQU87O0FBQ3JCLGFBQU9BLElBQVA7QUFDRDs7QUFFRDs7OzttQ0FDZTtBQUNiLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7O3FDQUNpQkMsYSxFQUFlO0FBQUEsbUJBTTFCLEtBQUtKLEtBTnFCO0FBQUEsVUFFNUJLLE9BRjRCLFVBRTVCQSxPQUY0QjtBQUFBLFVBRW5CQyxRQUZtQixVQUVuQkEsUUFGbUI7QUFBQSxVQUVUQyxPQUZTLFVBRVRBLE9BRlM7QUFBQSxVQUc1QkMsVUFINEIsVUFHNUJBLFVBSDRCO0FBQUEsVUFHaEJDLGdCQUhnQixVQUdoQkEsZ0JBSGdCO0FBQUEsVUFJNUJDLHNCQUo0QixVQUk1QkEsc0JBSjRCO0FBQUEsVUFJSkMsYUFKSSxVQUlKQSxhQUpJO0FBQUEsVUFJV0MsY0FKWCxVQUlXQSxjQUpYO0FBQUEsVUFLNUJDLGdCQUw0QixVQUs1QkEsZ0JBTDRCO0FBQUEsVUFLVkMsZ0JBTFUsVUFLVkEsZ0JBTFU7QUFBQSxVQUtRQyxXQUxSLFVBS1FBLFdBTFI7O0FBTzlCLFVBQU1DLFdBQVc7QUFDZlgsd0JBRGUsRUFDTkMsa0JBRE0sRUFDSUMsZ0JBREo7QUFFZkMsOEJBRmUsRUFFSEMsa0NBRkc7QUFHZkMsc0RBSGUsRUFHU0MsNEJBSFQsRUFHd0JDLDhCQUh4QjtBQUlmQywwQ0FKZSxFQUlHQyxrQ0FKSCxFQUlxQkM7QUFKckIsT0FBakI7O0FBT0EsVUFBSVgsYUFBSixFQUFtQjtBQUNqQmEsZUFBT0MsTUFBUCxDQUFjRixRQUFkLEVBQXdCWixhQUF4QixFQUF1QztBQUNyQ2UsY0FBTyxLQUFLbkIsS0FBTCxDQUFXbUIsRUFBbEIsU0FBd0JmLGNBQWNlLEVBREQ7QUFFckNDLDBCQUFnQkgsT0FBT0MsTUFBUCxDQUFjO0FBQzVCRyxpQkFBSyxLQUFLckIsS0FBTCxDQUFXb0IsY0FBWCxDQUEwQkM7QUFESCxXQUFkLEVBRWJqQixjQUFjZ0IsY0FGRDtBQUZxQixTQUF2QztBQU1EOztBQUVELGFBQU9KLFFBQVA7QUFDRDs7QUFFRDs7OztvQ0FDZ0I7QUFBQSxVQUNUZCxTQURTLEdBQ0ksS0FBS0QsYUFEVCxDQUNUQyxTQURTOztBQUVkLFVBQUlBLGFBQWEsQ0FBQyxLQUFLb0IsV0FBTCxFQUFsQixFQUFzQztBQUNwQ3pCLFlBQUlBLEdBQUosQ0FBUSxDQUFSLHdDQUErQyxJQUEvQyxFQUF1RCxLQUFLSSxhQUFMLENBQW1CQyxTQUExRTtBQUNELE9BRkQsTUFFTztBQUNMQSxvQkFBWSxLQUFLcUIsWUFBTCxFQUFaO0FBQ0E7QUFDQTtBQUNBO0FBQ0FyQixvQkFBWUosUUFBUUksU0FBUixFQUFtQixFQUFDc0IsUUFBUUMsT0FBVCxFQUFuQixDQUFaO0FBQ0EsYUFBS3hCLGFBQUwsQ0FBbUJDLFNBQW5CLEdBQStCQSxTQUEvQjtBQUNBTCxZQUFJQSxHQUFKLENBQVEsQ0FBUiw4Q0FBcUQsSUFBckQsRUFBNkRLLFNBQTdEO0FBQ0Q7O0FBRUQ7QUFDQTtBQWZjO0FBQUE7QUFBQTs7QUFBQTtBQWdCZCw2QkFBb0JBLFNBQXBCLDhIQUErQjtBQUFBLGNBQXBCd0IsS0FBb0I7O0FBQzdCQSxnQkFBTUMsV0FBTixHQUFvQixJQUFwQjtBQUNEO0FBbEJhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQmY7Ozt3QkF6RWlCO0FBQ2hCLGFBQU8sSUFBUDtBQUNEOzs7O0VBUHlDL0IsSzs7ZUFBdkJHLGMiLCJmaWxlIjoiY29tcG9zaXRlLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi9sYXllcic7XG5pbXBvcnQgbG9nIGZyb20gJy4uL3V0aWxzL2xvZyc7XG5pbXBvcnQge2ZsYXR0ZW59IGZyb20gJy4uL3V0aWxzL2ZsYXR0ZW4nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb3NpdGVMYXllciBleHRlbmRzIExheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICBnZXQgaXNDb21wb3NpdGUoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXRTdWJMYXllcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxTdGF0ZS5zdWJMYXllcnMgfHwgW107XG4gIH1cblxuICAvLyBpbml0aWFsaXplU3RhdGUgaXMgdXN1YWxseSBub3QgbmVlZGVkIGZvciBjb21wb3NpdGUgbGF5ZXJzXG4gIC8vIFByb3ZpZGUgZW1wdHkgZGVmaW5pdGlvbiB0byBkaXNhYmxlIGNoZWNrIGZvciBtaXNzaW5nIGRlZmluaXRpb25cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICB9XG5cbiAgLy8gY2FsbGVkIHRvIGF1Z21lbnQgdGhlIGluZm8gb2JqZWN0IHRoYXQgaXMgYnViYmxlZCB1cCBmcm9tIGEgc3VibGF5ZXJcbiAgLy8gb3ZlcnJpZGUgTGF5ZXIuZ2V0UGlja2luZ0luZm8oKSBiZWNhdXNlIGRlY29kaW5nIC8gc2V0dGluZyB1bmlmb3JtIGRvXG4gIC8vIG5vdCBhcHBseSB0byBhIGNvbXBvc2l0ZSBsYXllci5cbiAgLy8gQHJldHVybiBudWxsIHRvIGNhbmNlbCBldmVudFxuICBnZXRQaWNraW5nSW5mbyh7aW5mb30pIHtcbiAgICByZXR1cm4gaW5mbztcbiAgfVxuXG4gIC8vIEltcGxlbWVudCB0byBnZW5lcmF0ZSBzdWJMYXllcnNcbiAgcmVuZGVyTGF5ZXJzKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gUmV0dXJucyBzdWIgbGF5ZXIgcHJvcHMgZm9yIGEgc3BlY2lmaWMgc3VibGF5ZXJcbiAgZ2V0U3ViTGF5ZXJQcm9wcyhzdWJsYXllclByb3BzKSB7XG4gICAgY29uc3Qge1xuICAgICAgb3BhY2l0eSwgcGlja2FibGUsIHZpc2libGUsXG4gICAgICBwYXJhbWV0ZXJzLCBnZXRQb2x5Z29uT2Zmc2V0LFxuICAgICAgaGlnaGxpZ2h0ZWRPYmplY3RJbmRleCwgYXV0b0hpZ2hsaWdodCwgaGlnaGxpZ2h0Q29sb3IsXG4gICAgICBjb29yZGluYXRlU3lzdGVtLCBjb29yZGluYXRlT3JpZ2luLCBtb2RlbE1hdHJpeFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG5ld1Byb3BzID0ge1xuICAgICAgb3BhY2l0eSwgcGlja2FibGUsIHZpc2libGUsXG4gICAgICBwYXJhbWV0ZXJzLCBnZXRQb2x5Z29uT2Zmc2V0LFxuICAgICAgaGlnaGxpZ2h0ZWRPYmplY3RJbmRleCwgYXV0b0hpZ2hsaWdodCwgaGlnaGxpZ2h0Q29sb3IsXG4gICAgICBjb29yZGluYXRlU3lzdGVtLCBjb29yZGluYXRlT3JpZ2luLCBtb2RlbE1hdHJpeFxuICAgIH07XG5cbiAgICBpZiAoc3VibGF5ZXJQcm9wcykge1xuICAgICAgT2JqZWN0LmFzc2lnbihuZXdQcm9wcywgc3VibGF5ZXJQcm9wcywge1xuICAgICAgICBpZDogYCR7dGhpcy5wcm9wcy5pZH0tJHtzdWJsYXllclByb3BzLmlkfWAsXG4gICAgICAgIHVwZGF0ZVRyaWdnZXJzOiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICBhbGw6IHRoaXMucHJvcHMudXBkYXRlVHJpZ2dlcnMuYWxsXG4gICAgICAgIH0sIHN1YmxheWVyUHJvcHMudXBkYXRlVHJpZ2dlcnMpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3UHJvcHM7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB0byByZW5kZXIgc3ViTGF5ZXJzXG4gIF9yZW5kZXJMYXllcnMoKSB7XG4gICAgbGV0IHtzdWJMYXllcnN9ID0gdGhpcy5pbnRlcm5hbFN0YXRlO1xuICAgIGlmIChzdWJMYXllcnMgJiYgIXRoaXMubmVlZHNVcGRhdGUoKSkge1xuICAgICAgbG9nLmxvZygzLCBgQ29tcG9zaXRlIGxheWVyIHJldXNlZCBzdWJMYXllcnMgJHt0aGlzfWAsIHRoaXMuaW50ZXJuYWxTdGF0ZS5zdWJMYXllcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJMYXllcnMgPSB0aGlzLnJlbmRlckxheWVycygpO1xuICAgICAgLy8gRmxhdHRlbiB0aGUgcmV0dXJuZWQgYXJyYXksIHJlbW92aW5nIGFueSBudWxsLCB1bmRlZmluZWQgb3IgZmFsc2VcbiAgICAgIC8vIHRoaXMgYWxsb3dzIGxheWVycyB0byByZW5kZXIgc3VibGF5ZXJzIGNvbmRpdGlvbmFsbHlcbiAgICAgIC8vIChzZWUgQ29tcG9zaXRlTGF5ZXIucmVuZGVyTGF5ZXJzIGRvY3MpXG4gICAgICBzdWJMYXllcnMgPSBmbGF0dGVuKHN1YkxheWVycywge2ZpbHRlcjogQm9vbGVhbn0pO1xuICAgICAgdGhpcy5pbnRlcm5hbFN0YXRlLnN1YkxheWVycyA9IHN1YkxheWVycztcbiAgICAgIGxvZy5sb2coMiwgYENvbXBvc2l0ZSBsYXllciByZW5kZXJlZCBuZXcgc3ViTGF5ZXJzICR7dGhpc31gLCBzdWJMYXllcnMpO1xuICAgIH1cblxuICAgIC8vIHBvcHVsYXRlIHJlZmVyZW5jZSB0byBwYXJlbnQgbGF5ZXIgKHRoaXMgbGF5ZXIpXG4gICAgLy8gTk9URTogbmVlZHMgdG8gYmUgZG9uZSBldmVuIHdoZW4gcmV1c2luZyBsYXllcnMgYXMgdGhlIHBhcmVudCBtYXkgaGF2ZSBjaGFuZ2VkXG4gICAgZm9yIChjb25zdCBsYXllciBvZiBzdWJMYXllcnMpIHtcbiAgICAgIGxheWVyLnBhcmVudExheWVyID0gdGhpcztcbiAgICB9XG4gIH1cbn1cbiJdfQ==