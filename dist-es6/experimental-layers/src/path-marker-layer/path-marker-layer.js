var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { CompositeLayer, ScatterplotLayer, COORDINATE_SYSTEM } from 'deck.gl';
import PathOutlineLayer from '../path-outline-layer/path-outline-layer';
import MeshLayer from '../mesh-layer/mesh-layer';
import Arrow2DGeometry from './arrow-2d-geometry';

import createPathMarkers from './create-path-markers';
import { getClosestPointOnPolyline } from './polyline';

var DISTANCE_FOR_MULTI_ARROWS = 0.1;
var ARROW_HEAD_SIZE = 0.2;
var ARROW_TAIL_WIDTH = 0.05;
// const ARROW_CENTER_ADJUST = -0.8;

var DEFAULT_MARKER_LAYER = MeshLayer;

var DEFAULT_MARKER_LAYER_PROPS = {
  mesh: new Arrow2DGeometry({ headSize: ARROW_HEAD_SIZE, tailWidth: ARROW_TAIL_WIDTH })
};

var defaultProps = Object.assign({}, PathOutlineLayer.defaultProps, {
  MarkerLayer: DEFAULT_MARKER_LAYER,
  markerLayerProps: DEFAULT_MARKER_LAYER_PROPS,

  sizeScale: 100,
  fp64: false,

  hightlightIndex: -1,
  highlightPoint: null,

  getPath: function getPath(x) {
    return x.path;
  },
  getColor: function getColor(x) {
    return x.color;
  },
  getMarkerColor: function getMarkerColor(x) {
    return [0, 0, 0, 255];
  },
  getDirection: function getDirection(x) {
    return x.direction;
  },
  getMarkerPercentages: function getMarkerPercentages(object, _ref) {
    var lineLength = _ref.lineLength;
    return lineLength > DISTANCE_FOR_MULTI_ARROWS ? [0.25, 0.5, 0.75] : [0.5];
  }
});

var PathMarkerLayer = function (_CompositeLayer) {
  _inherits(PathMarkerLayer, _CompositeLayer);

  function PathMarkerLayer() {
    _classCallCheck(this, PathMarkerLayer);

    return _possibleConstructorReturn(this, (PathMarkerLayer.__proto__ || Object.getPrototypeOf(PathMarkerLayer)).apply(this, arguments));
  }

  _createClass(PathMarkerLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.state = {
        markers: [],
        mesh: new Arrow2DGeometry({ headSize: ARROW_HEAD_SIZE, tailWidth: ARROW_TAIL_WIDTH }),
        closestPoint: null
      };
    }
  }, {
    key: 'projectFlat',
    value: function projectFlat(xyz, viewport, coordinateSystem, coordinateOrigin) {
      if (coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
        var _viewport$metersToLng = viewport.metersToLngLatDelta(xyz),
            _viewport$metersToLng2 = _slicedToArray(_viewport$metersToLng, 2),
            dx = _viewport$metersToLng2[0],
            dy = _viewport$metersToLng2[1];

        var _coordinateOrigin = _slicedToArray(coordinateOrigin, 2),
            x = _coordinateOrigin[0],
            y = _coordinateOrigin[1];

        return viewport.projectFlat([x - dx, dy + y]);
      }

      return viewport.projectFlat(xyz);
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var _this2 = this;

      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      if (changeFlags.dataChanged) {
        var _props = this.props,
            data = _props.data,
            getPath = _props.getPath,
            getDirection = _props.getDirection,
            getMarkerColor = _props.getMarkerColor,
            getMarkerPercentages = _props.getMarkerPercentages,
            coordinateSystem = _props.coordinateSystem,
            coordinateOrigin = _props.coordinateOrigin;
        var viewport = this.context.viewport;

        var projectFlat = function projectFlat(o) {
          return _this2.projectFlat(o, viewport, coordinateSystem, coordinateOrigin);
        };
        this.state.markers = createPathMarkers({
          data: data, getPath: getPath, getDirection: getDirection, getColor: getMarkerColor, getMarkerPercentages: getMarkerPercentages, projectFlat: projectFlat
        });
        this._recalculateClosestPoint();
      }
      if (changeFlags.propsChanged) {
        if (props.point !== oldProps.point) {
          this._recalculateClosestPoint();
        }
      }
    }
  }, {
    key: '_recalculateClosestPoint',
    value: function _recalculateClosestPoint() {
      var _props2 = this.props,
          highlightPoint = _props2.highlightPoint,
          highlightIndex = _props2.highlightIndex;

      if (highlightPoint && highlightIndex >= 0) {
        var object = this.props.data[highlightIndex];
        var points = this.props.getPath(object);

        var _getClosestPointOnPol = getClosestPointOnPolyline({ points: points, p: highlightPoint }),
            point = _getClosestPointOnPol.point;

        this.state.closestPoints = [{
          position: point
        }];
      } else {
        this.state.closestPoints = [];
      }
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref3) {
      var info = _ref3.info;

      return Object.assign(info, {
        // override object with picked feature
        object: info.object && info.object.path || info.object
      });
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      return [new PathOutlineLayer(this.getSubLayerProps(Object.assign({}, this.props, {
        id: 'paths',
        fp64: this.props.fp64
      }))), new this.props.MarkerLayer(this.getSubLayerProps(Object.assign({}, this.props.markerLayerProps, {
        id: 'markers',
        data: this.state.markers,
        sizeScale: this.props.sizeScale,
        fp64: this.props.fp64,
        pickable: false,
        parameters: {
          blend: false,
          depthTest: false
        }
      }))), this.state.closestPoints && new ScatterplotLayer({
        id: this.props.id + '-highlight',
        data: this.state.closestPoints,
        fp64: this.props.fp64
      })];
    }
  }]);

  return PathMarkerLayer;
}(CompositeLayer);

export default PathMarkerLayer;


PathMarkerLayer.layerName = 'PathMarkerLayer';
PathMarkerLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9wYXRoLW1hcmtlci1sYXllci9wYXRoLW1hcmtlci1sYXllci5qcyJdLCJuYW1lcyI6WyJDb21wb3NpdGVMYXllciIsIlNjYXR0ZXJwbG90TGF5ZXIiLCJDT09SRElOQVRFX1NZU1RFTSIsIlBhdGhPdXRsaW5lTGF5ZXIiLCJNZXNoTGF5ZXIiLCJBcnJvdzJER2VvbWV0cnkiLCJjcmVhdGVQYXRoTWFya2VycyIsImdldENsb3Nlc3RQb2ludE9uUG9seWxpbmUiLCJESVNUQU5DRV9GT1JfTVVMVElfQVJST1dTIiwiQVJST1dfSEVBRF9TSVpFIiwiQVJST1dfVEFJTF9XSURUSCIsIkRFRkFVTFRfTUFSS0VSX0xBWUVSIiwiREVGQVVMVF9NQVJLRVJfTEFZRVJfUFJPUFMiLCJtZXNoIiwiaGVhZFNpemUiLCJ0YWlsV2lkdGgiLCJkZWZhdWx0UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJNYXJrZXJMYXllciIsIm1hcmtlckxheWVyUHJvcHMiLCJzaXplU2NhbGUiLCJmcDY0IiwiaGlnaHRsaWdodEluZGV4IiwiaGlnaGxpZ2h0UG9pbnQiLCJnZXRQYXRoIiwieCIsInBhdGgiLCJnZXRDb2xvciIsImNvbG9yIiwiZ2V0TWFya2VyQ29sb3IiLCJnZXREaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJnZXRNYXJrZXJQZXJjZW50YWdlcyIsIm9iamVjdCIsImxpbmVMZW5ndGgiLCJQYXRoTWFya2VyTGF5ZXIiLCJzdGF0ZSIsIm1hcmtlcnMiLCJjbG9zZXN0UG9pbnQiLCJ4eXoiLCJ2aWV3cG9ydCIsImNvb3JkaW5hdGVTeXN0ZW0iLCJjb29yZGluYXRlT3JpZ2luIiwiTUVURVJfT0ZGU0VUUyIsIm1ldGVyc1RvTG5nTGF0RGVsdGEiLCJkeCIsImR5IiwieSIsInByb2plY3RGbGF0IiwicHJvcHMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiZGF0YUNoYW5nZWQiLCJkYXRhIiwiY29udGV4dCIsIm8iLCJfcmVjYWxjdWxhdGVDbG9zZXN0UG9pbnQiLCJwcm9wc0NoYW5nZWQiLCJwb2ludCIsImhpZ2hsaWdodEluZGV4IiwicG9pbnRzIiwicCIsImNsb3Nlc3RQb2ludHMiLCJwb3NpdGlvbiIsImluZm8iLCJnZXRTdWJMYXllclByb3BzIiwiaWQiLCJwaWNrYWJsZSIsInBhcmFtZXRlcnMiLCJibGVuZCIsImRlcHRoVGVzdCIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLFNBQVFBLGNBQVIsRUFBd0JDLGdCQUF4QixFQUEwQ0MsaUJBQTFDLFFBQWtFLFNBQWxFO0FBQ0EsT0FBT0MsZ0JBQVAsTUFBNkIsMENBQTdCO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQiwwQkFBdEI7QUFDQSxPQUFPQyxlQUFQLE1BQTRCLHFCQUE1Qjs7QUFFQSxPQUFPQyxpQkFBUCxNQUE4Qix1QkFBOUI7QUFDQSxTQUFRQyx5QkFBUixRQUF3QyxZQUF4Qzs7QUFFQSxJQUFNQyw0QkFBNEIsR0FBbEM7QUFDQSxJQUFNQyxrQkFBa0IsR0FBeEI7QUFDQSxJQUFNQyxtQkFBbUIsSUFBekI7QUFDQTs7QUFFQSxJQUFNQyx1QkFBdUJQLFNBQTdCOztBQUVBLElBQU1RLDZCQUE2QjtBQUNqQ0MsUUFBTSxJQUFJUixlQUFKLENBQW9CLEVBQUNTLFVBQVVMLGVBQVgsRUFBNEJNLFdBQVdMLGdCQUF2QyxFQUFwQjtBQUQyQixDQUFuQzs7QUFJQSxJQUFNTSxlQUFlQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQmYsaUJBQWlCYSxZQUFuQyxFQUFpRDtBQUNwRUcsZUFBYVIsb0JBRHVEO0FBRXBFUyxvQkFBa0JSLDBCQUZrRDs7QUFJcEVTLGFBQVcsR0FKeUQ7QUFLcEVDLFFBQU0sS0FMOEQ7O0FBT3BFQyxtQkFBaUIsQ0FBQyxDQVBrRDtBQVFwRUMsa0JBQWdCLElBUm9EOztBQVVwRUMsV0FBUztBQUFBLFdBQUtDLEVBQUVDLElBQVA7QUFBQSxHQVYyRDtBQVdwRUMsWUFBVTtBQUFBLFdBQUtGLEVBQUVHLEtBQVA7QUFBQSxHQVgwRDtBQVlwRUMsa0JBQWdCO0FBQUEsV0FBSyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FBTDtBQUFBLEdBWm9EO0FBYXBFQyxnQkFBYztBQUFBLFdBQUtMLEVBQUVNLFNBQVA7QUFBQSxHQWJzRDtBQWNwRUMsd0JBQXNCLDhCQUFDQyxNQUFEO0FBQUEsUUFBVUMsVUFBVixRQUFVQSxVQUFWO0FBQUEsV0FDckJBLGFBQWEzQix5QkFBYixHQUF5QyxDQUFDLElBQUQsRUFBTyxHQUFQLEVBQVksSUFBWixDQUF6QyxHQUE2RCxDQUFDLEdBQUQsQ0FEeEM7QUFBQTtBQWQ4QyxDQUFqRCxDQUFyQjs7SUFrQnFCNEIsZTs7Ozs7Ozs7Ozs7c0NBQ0Q7QUFDaEIsV0FBS0MsS0FBTCxHQUFhO0FBQ1hDLGlCQUFTLEVBREU7QUFFWHpCLGNBQU0sSUFBSVIsZUFBSixDQUFvQixFQUFDUyxVQUFVTCxlQUFYLEVBQTRCTSxXQUFXTCxnQkFBdkMsRUFBcEIsQ0FGSztBQUdYNkIsc0JBQWM7QUFISCxPQUFiO0FBS0Q7OztnQ0FFV0MsRyxFQUFLQyxRLEVBQVVDLGdCLEVBQWtCQyxnQixFQUFrQjtBQUM3RCxVQUFJRCxxQkFBcUJ4QyxrQkFBa0IwQyxhQUEzQyxFQUEwRDtBQUFBLG9DQUN2Q0gsU0FBU0ksbUJBQVQsQ0FBNkJMLEdBQTdCLENBRHVDO0FBQUE7QUFBQSxZQUNqRE0sRUFEaUQ7QUFBQSxZQUM3Q0MsRUFENkM7O0FBQUEsK0NBRXpDSixnQkFGeUM7QUFBQSxZQUVqRGpCLENBRmlEO0FBQUEsWUFFOUNzQixDQUY4Qzs7QUFHeEQsZUFBT1AsU0FBU1EsV0FBVCxDQUFxQixDQUFDdkIsSUFBSW9CLEVBQUwsRUFBU0MsS0FBS0MsQ0FBZCxDQUFyQixDQUFQO0FBQ0Q7O0FBRUQsYUFBT1AsU0FBU1EsV0FBVCxDQUFxQlQsR0FBckIsQ0FBUDtBQUNEOzs7dUNBRTJDO0FBQUE7O0FBQUEsVUFBL0JVLEtBQStCLFNBQS9CQSxLQUErQjtBQUFBLFVBQXhCQyxRQUF3QixTQUF4QkEsUUFBd0I7QUFBQSxVQUFkQyxXQUFjLFNBQWRBLFdBQWM7O0FBQzFDLFVBQUlBLFlBQVlDLFdBQWhCLEVBQTZCO0FBQUEscUJBRWEsS0FBS0gsS0FGbEI7QUFBQSxZQUNwQkksSUFEb0IsVUFDcEJBLElBRG9CO0FBQUEsWUFDZDdCLE9BRGMsVUFDZEEsT0FEYztBQUFBLFlBQ0xNLFlBREssVUFDTEEsWUFESztBQUFBLFlBQ1NELGNBRFQsVUFDU0EsY0FEVDtBQUFBLFlBQ3lCRyxvQkFEekIsVUFDeUJBLG9CQUR6QjtBQUFBLFlBRXpCUyxnQkFGeUIsVUFFekJBLGdCQUZ5QjtBQUFBLFlBRVBDLGdCQUZPLFVBRVBBLGdCQUZPO0FBQUEsWUFHcEJGLFFBSG9CLEdBR1IsS0FBS2MsT0FIRyxDQUdwQmQsUUFIb0I7O0FBSTNCLFlBQU1RLGNBQWMsU0FBZEEsV0FBYztBQUFBLGlCQUFLLE9BQUtBLFdBQUwsQ0FBaUJPLENBQWpCLEVBQW9CZixRQUFwQixFQUE4QkMsZ0JBQTlCLEVBQWdEQyxnQkFBaEQsQ0FBTDtBQUFBLFNBQXBCO0FBQ0EsYUFBS04sS0FBTCxDQUFXQyxPQUFYLEdBQXFCaEMsa0JBQWtCO0FBQ3JDZ0Qsb0JBRHFDLEVBQy9CN0IsZ0JBRCtCLEVBQ3RCTSwwQkFEc0IsRUFDUkgsVUFBVUUsY0FERixFQUNrQkcsMENBRGxCLEVBQ3dDZ0I7QUFEeEMsU0FBbEIsQ0FBckI7QUFHQSxhQUFLUSx3QkFBTDtBQUNEO0FBQ0QsVUFBSUwsWUFBWU0sWUFBaEIsRUFBOEI7QUFDNUIsWUFBSVIsTUFBTVMsS0FBTixLQUFnQlIsU0FBU1EsS0FBN0IsRUFBb0M7QUFDbEMsZUFBS0Ysd0JBQUw7QUFDRDtBQUNGO0FBQ0Y7OzsrQ0FFMEI7QUFBQSxvQkFDZ0IsS0FBS1AsS0FEckI7QUFBQSxVQUNsQjFCLGNBRGtCLFdBQ2xCQSxjQURrQjtBQUFBLFVBQ0ZvQyxjQURFLFdBQ0ZBLGNBREU7O0FBRXpCLFVBQUlwQyxrQkFBa0JvQyxrQkFBa0IsQ0FBeEMsRUFBMkM7QUFDekMsWUFBTTFCLFNBQVMsS0FBS2dCLEtBQUwsQ0FBV0ksSUFBWCxDQUFnQk0sY0FBaEIsQ0FBZjtBQUNBLFlBQU1DLFNBQVMsS0FBS1gsS0FBTCxDQUFXekIsT0FBWCxDQUFtQlMsTUFBbkIsQ0FBZjs7QUFGeUMsb0NBR3pCM0IsMEJBQTBCLEVBQUNzRCxjQUFELEVBQVNDLEdBQUd0QyxjQUFaLEVBQTFCLENBSHlCO0FBQUEsWUFHbENtQyxLQUhrQyx5QkFHbENBLEtBSGtDOztBQUl6QyxhQUFLdEIsS0FBTCxDQUFXMEIsYUFBWCxHQUEyQixDQUFDO0FBQzFCQyxvQkFBVUw7QUFEZ0IsU0FBRCxDQUEzQjtBQUdELE9BUEQsTUFPTztBQUNMLGFBQUt0QixLQUFMLENBQVcwQixhQUFYLEdBQTJCLEVBQTNCO0FBQ0Q7QUFDRjs7OzBDQUVzQjtBQUFBLFVBQVBFLElBQU8sU0FBUEEsSUFBTzs7QUFDckIsYUFBT2hELE9BQU9DLE1BQVAsQ0FBYytDLElBQWQsRUFBb0I7QUFDekI7QUFDQS9CLGdCQUFTK0IsS0FBSy9CLE1BQUwsSUFBZStCLEtBQUsvQixNQUFMLENBQVlQLElBQTVCLElBQXFDc0MsS0FBSy9CO0FBRnpCLE9BQXBCLENBQVA7QUFJRDs7O21DQUVjO0FBQ2IsYUFBTyxDQUNMLElBQUkvQixnQkFBSixDQUNFLEtBQUsrRCxnQkFBTCxDQUNFakQsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS2dDLEtBQXZCLEVBQThCO0FBQzVCaUIsWUFBSSxPQUR3QjtBQUU1QjdDLGNBQU0sS0FBSzRCLEtBQUwsQ0FBVzVCO0FBRlcsT0FBOUIsQ0FERixDQURGLENBREssRUFTTCxJQUFJLEtBQUs0QixLQUFMLENBQVcvQixXQUFmLENBQ0UsS0FBSytDLGdCQUFMLENBQ0VqRCxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLZ0MsS0FBTCxDQUFXOUIsZ0JBQTdCLEVBQStDO0FBQzdDK0MsWUFBSSxTQUR5QztBQUU3Q2IsY0FBTSxLQUFLakIsS0FBTCxDQUFXQyxPQUY0QjtBQUc3Q2pCLG1CQUFXLEtBQUs2QixLQUFMLENBQVc3QixTQUh1QjtBQUk3Q0MsY0FBTSxLQUFLNEIsS0FBTCxDQUFXNUIsSUFKNEI7QUFLN0M4QyxrQkFBVSxLQUxtQztBQU03Q0Msb0JBQVk7QUFDVkMsaUJBQU8sS0FERztBQUVWQyxxQkFBVztBQUZEO0FBTmlDLE9BQS9DLENBREYsQ0FERixDQVRLLEVBd0JMLEtBQUtsQyxLQUFMLENBQVcwQixhQUFYLElBQ0EsSUFBSTlELGdCQUFKLENBQXFCO0FBQ25Ca0UsWUFBTyxLQUFLakIsS0FBTCxDQUFXaUIsRUFBbEIsZUFEbUI7QUFFbkJiLGNBQU0sS0FBS2pCLEtBQUwsQ0FBVzBCLGFBRkU7QUFHbkJ6QyxjQUFNLEtBQUs0QixLQUFMLENBQVc1QjtBQUhFLE9BQXJCLENBekJLLENBQVA7QUErQkQ7Ozs7RUExRjBDdEIsYzs7ZUFBeEJvQyxlOzs7QUE2RnJCQSxnQkFBZ0JvQyxTQUFoQixHQUE0QixpQkFBNUI7QUFDQXBDLGdCQUFnQnBCLFlBQWhCLEdBQStCQSxZQUEvQiIsImZpbGUiOiJwYXRoLW1hcmtlci1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9zaXRlTGF5ZXIsIFNjYXR0ZXJwbG90TGF5ZXIsIENPT1JESU5BVEVfU1lTVEVNfSBmcm9tICdkZWNrLmdsJztcbmltcG9ydCBQYXRoT3V0bGluZUxheWVyIGZyb20gJy4uL3BhdGgtb3V0bGluZS1sYXllci9wYXRoLW91dGxpbmUtbGF5ZXInO1xuaW1wb3J0IE1lc2hMYXllciBmcm9tICcuLi9tZXNoLWxheWVyL21lc2gtbGF5ZXInO1xuaW1wb3J0IEFycm93MkRHZW9tZXRyeSBmcm9tICcuL2Fycm93LTJkLWdlb21ldHJ5JztcblxuaW1wb3J0IGNyZWF0ZVBhdGhNYXJrZXJzIGZyb20gJy4vY3JlYXRlLXBhdGgtbWFya2Vycyc7XG5pbXBvcnQge2dldENsb3Nlc3RQb2ludE9uUG9seWxpbmV9IGZyb20gJy4vcG9seWxpbmUnO1xuXG5jb25zdCBESVNUQU5DRV9GT1JfTVVMVElfQVJST1dTID0gMC4xO1xuY29uc3QgQVJST1dfSEVBRF9TSVpFID0gMC4yO1xuY29uc3QgQVJST1dfVEFJTF9XSURUSCA9IDAuMDU7XG4vLyBjb25zdCBBUlJPV19DRU5URVJfQURKVVNUID0gLTAuODtcblxuY29uc3QgREVGQVVMVF9NQVJLRVJfTEFZRVIgPSBNZXNoTGF5ZXI7XG5cbmNvbnN0IERFRkFVTFRfTUFSS0VSX0xBWUVSX1BST1BTID0ge1xuICBtZXNoOiBuZXcgQXJyb3cyREdlb21ldHJ5KHtoZWFkU2l6ZTogQVJST1dfSEVBRF9TSVpFLCB0YWlsV2lkdGg6IEFSUk9XX1RBSUxfV0lEVEh9KVxufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUGF0aE91dGxpbmVMYXllci5kZWZhdWx0UHJvcHMsIHtcbiAgTWFya2VyTGF5ZXI6IERFRkFVTFRfTUFSS0VSX0xBWUVSLFxuICBtYXJrZXJMYXllclByb3BzOiBERUZBVUxUX01BUktFUl9MQVlFUl9QUk9QUyxcblxuICBzaXplU2NhbGU6IDEwMCxcbiAgZnA2NDogZmFsc2UsXG5cbiAgaGlnaHRsaWdodEluZGV4OiAtMSxcbiAgaGlnaGxpZ2h0UG9pbnQ6IG51bGwsXG5cbiAgZ2V0UGF0aDogeCA9PiB4LnBhdGgsXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IsXG4gIGdldE1hcmtlckNvbG9yOiB4ID0+IFswLCAwLCAwLCAyNTVdLFxuICBnZXREaXJlY3Rpb246IHggPT4geC5kaXJlY3Rpb24sXG4gIGdldE1hcmtlclBlcmNlbnRhZ2VzOiAob2JqZWN0LCB7bGluZUxlbmd0aH0pID0+XG4gICBsaW5lTGVuZ3RoID4gRElTVEFOQ0VfRk9SX01VTFRJX0FSUk9XUyA/IFswLjI1LCAwLjUsIDAuNzVdIDogWzAuNV1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoTWFya2VyTGF5ZXIgZXh0ZW5kcyBDb21wb3NpdGVMYXllciB7XG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWFya2VyczogW10sXG4gICAgICBtZXNoOiBuZXcgQXJyb3cyREdlb21ldHJ5KHtoZWFkU2l6ZTogQVJST1dfSEVBRF9TSVpFLCB0YWlsV2lkdGg6IEFSUk9XX1RBSUxfV0lEVEh9KSxcbiAgICAgIGNsb3Nlc3RQb2ludDogbnVsbFxuICAgIH07XG4gIH1cblxuICBwcm9qZWN0RmxhdCh4eXosIHZpZXdwb3J0LCBjb29yZGluYXRlU3lzdGVtLCBjb29yZGluYXRlT3JpZ2luKSB7XG4gICAgaWYgKGNvb3JkaW5hdGVTeXN0ZW0gPT09IENPT1JESU5BVEVfU1lTVEVNLk1FVEVSX09GRlNFVFMpIHtcbiAgICAgIGNvbnN0IFtkeCwgZHldID0gdmlld3BvcnQubWV0ZXJzVG9MbmdMYXREZWx0YSh4eXopO1xuICAgICAgY29uc3QgW3gsIHldID0gY29vcmRpbmF0ZU9yaWdpbjtcbiAgICAgIHJldHVybiB2aWV3cG9ydC5wcm9qZWN0RmxhdChbeCAtIGR4LCBkeSArIHldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlld3BvcnQucHJvamVjdEZsYXQoeHl6KTtcbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGlmIChjaGFuZ2VGbGFncy5kYXRhQ2hhbmdlZCkge1xuICAgICAgY29uc3Qge2RhdGEsIGdldFBhdGgsIGdldERpcmVjdGlvbiwgZ2V0TWFya2VyQ29sb3IsIGdldE1hcmtlclBlcmNlbnRhZ2VzLFxuICAgICAgICBjb29yZGluYXRlU3lzdGVtLCBjb29yZGluYXRlT3JpZ2lufSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgY29uc3QgcHJvamVjdEZsYXQgPSBvID0+IHRoaXMucHJvamVjdEZsYXQobywgdmlld3BvcnQsIGNvb3JkaW5hdGVTeXN0ZW0sIGNvb3JkaW5hdGVPcmlnaW4pO1xuICAgICAgdGhpcy5zdGF0ZS5tYXJrZXJzID0gY3JlYXRlUGF0aE1hcmtlcnMoe1xuICAgICAgICBkYXRhLCBnZXRQYXRoLCBnZXREaXJlY3Rpb24sIGdldENvbG9yOiBnZXRNYXJrZXJDb2xvciwgZ2V0TWFya2VyUGVyY2VudGFnZXMsIHByb2plY3RGbGF0XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3JlY2FsY3VsYXRlQ2xvc2VzdFBvaW50KCk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VGbGFncy5wcm9wc0NoYW5nZWQpIHtcbiAgICAgIGlmIChwcm9wcy5wb2ludCAhPT0gb2xkUHJvcHMucG9pbnQpIHtcbiAgICAgICAgdGhpcy5fcmVjYWxjdWxhdGVDbG9zZXN0UG9pbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfcmVjYWxjdWxhdGVDbG9zZXN0UG9pbnQoKSB7XG4gICAgY29uc3Qge2hpZ2hsaWdodFBvaW50LCBoaWdobGlnaHRJbmRleH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChoaWdobGlnaHRQb2ludCAmJiBoaWdobGlnaHRJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBvYmplY3QgPSB0aGlzLnByb3BzLmRhdGFbaGlnaGxpZ2h0SW5kZXhdO1xuICAgICAgY29uc3QgcG9pbnRzID0gdGhpcy5wcm9wcy5nZXRQYXRoKG9iamVjdCk7XG4gICAgICBjb25zdCB7cG9pbnR9ID0gZ2V0Q2xvc2VzdFBvaW50T25Qb2x5bGluZSh7cG9pbnRzLCBwOiBoaWdobGlnaHRQb2ludH0pO1xuICAgICAgdGhpcy5zdGF0ZS5jbG9zZXN0UG9pbnRzID0gW3tcbiAgICAgICAgcG9zaXRpb246IHBvaW50XG4gICAgICB9XTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZS5jbG9zZXN0UG9pbnRzID0gW107XG4gICAgfVxuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm99KSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5mbywge1xuICAgICAgLy8gb3ZlcnJpZGUgb2JqZWN0IHdpdGggcGlja2VkIGZlYXR1cmVcbiAgICAgIG9iamVjdDogKGluZm8ub2JqZWN0ICYmIGluZm8ub2JqZWN0LnBhdGgpIHx8IGluZm8ub2JqZWN0XG4gICAgfSk7XG4gIH1cblxuICByZW5kZXJMYXllcnMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBQYXRoT3V0bGluZUxheWVyKFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdwYXRocycsXG4gICAgICAgICAgICBmcDY0OiB0aGlzLnByb3BzLmZwNjRcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgbmV3IHRoaXMucHJvcHMuTWFya2VyTGF5ZXIoXG4gICAgICAgIHRoaXMuZ2V0U3ViTGF5ZXJQcm9wcyhcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLm1hcmtlckxheWVyUHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbWFya2VycycsXG4gICAgICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLm1hcmtlcnMsXG4gICAgICAgICAgICBzaXplU2NhbGU6IHRoaXMucHJvcHMuc2l6ZVNjYWxlLFxuICAgICAgICAgICAgZnA2NDogdGhpcy5wcm9wcy5mcDY0LFxuICAgICAgICAgICAgcGlja2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBibGVuZDogZmFsc2UsXG4gICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgdGhpcy5zdGF0ZS5jbG9zZXN0UG9pbnRzICYmXG4gICAgICBuZXcgU2NhdHRlcnBsb3RMYXllcih7XG4gICAgICAgIGlkOiBgJHt0aGlzLnByb3BzLmlkfS1oaWdobGlnaHRgLFxuICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLmNsb3Nlc3RQb2ludHMsXG4gICAgICAgIGZwNjQ6IHRoaXMucHJvcHMuZnA2NFxuICAgICAgfSlcbiAgICBdO1xuICB9XG59XG5cblBhdGhNYXJrZXJMYXllci5sYXllck5hbWUgPSAnUGF0aE1hcmtlckxheWVyJztcblBhdGhNYXJrZXJMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=