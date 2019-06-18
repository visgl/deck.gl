function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { CompositeLayer, COORDINATE_SYSTEM } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import PathOutlineLayer from '../path-outline-layer/path-outline-layer';
import MeshLayer from '../mesh-layer/mesh-layer';
import Arrow2DGeometry from './arrow-2d-geometry';
import createPathMarkers from './create-path-markers';
import { getClosestPointOnPolyline } from './polyline';
const DISTANCE_FOR_MULTI_ARROWS = 0.1;
const ARROW_HEAD_SIZE = 0.2;
const ARROW_TAIL_WIDTH = 0.05; // const ARROW_CENTER_ADJUST = -0.8;

const DEFAULT_MARKER_LAYER = MeshLayer;
const DEFAULT_MARKER_LAYER_PROPS = {
  mesh: new Arrow2DGeometry({
    headSize: ARROW_HEAD_SIZE,
    tailWidth: ARROW_TAIL_WIDTH
  })
};
const defaultProps = Object.assign({}, PathOutlineLayer.defaultProps, {
  MarkerLayer: DEFAULT_MARKER_LAYER,
  markerLayerProps: DEFAULT_MARKER_LAYER_PROPS,
  sizeScale: 100,
  fp64: false,
  hightlightIndex: -1,
  highlightPoint: null,
  getPath: x => x.path,
  getColor: x => x.color,
  getMarkerColor: x => [0, 0, 0, 255],
  getDirection: x => x.direction,
  getMarkerPercentages: (object, {
    lineLength
  }) => lineLength > DISTANCE_FOR_MULTI_ARROWS ? [0.25, 0.5, 0.75] : [0.5]
});
export default class PathMarkerLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      markers: [],
      mesh: new Arrow2DGeometry({
        headSize: ARROW_HEAD_SIZE,
        tailWidth: ARROW_TAIL_WIDTH
      }),
      closestPoint: null
    };
  }

  projectFlat(xyz, viewport, coordinateSystem, coordinateOrigin) {
    if (coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
      const _viewport$metersToLng = viewport.metersToLngLatDelta(xyz),
            _viewport$metersToLng2 = _slicedToArray(_viewport$metersToLng, 2),
            dx = _viewport$metersToLng2[0],
            dy = _viewport$metersToLng2[1];

      const _coordinateOrigin = _slicedToArray(coordinateOrigin, 2),
            x = _coordinateOrigin[0],
            y = _coordinateOrigin[1];

      return viewport.projectFlat([x - dx, dy + y]);
    } else if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS) {
      const _xyz = _slicedToArray(xyz, 2),
            dx = _xyz[0],
            dy = _xyz[1];

      const _coordinateOrigin2 = _slicedToArray(coordinateOrigin, 2),
            x = _coordinateOrigin2[0],
            y = _coordinateOrigin2[1];

      return viewport.projectFlat([x - dx, dy + y]);
    }

    return viewport.projectFlat(xyz);
  }

  updateState({
    props,
    oldProps,
    changeFlags
  }) {
    if (changeFlags.dataChanged || changeFlags.updateTriggersChanged) {
      const _this$props = this.props,
            data = _this$props.data,
            getPath = _this$props.getPath,
            getDirection = _this$props.getDirection,
            getMarkerColor = _this$props.getMarkerColor,
            getMarkerPercentages = _this$props.getMarkerPercentages,
            coordinateSystem = _this$props.coordinateSystem,
            coordinateOrigin = _this$props.coordinateOrigin;
      const viewport = this.context.viewport;

      const projectFlat = o => this.projectFlat(o, viewport, coordinateSystem, coordinateOrigin);

      this.state.markers = createPathMarkers({
        data,
        getPath,
        getDirection,
        getColor: getMarkerColor,
        getMarkerPercentages,
        projectFlat
      });

      this._recalculateClosestPoint();
    }

    if (changeFlags.propsChanged) {
      if (props.point !== oldProps.point) {
        this._recalculateClosestPoint();
      }
    }
  }

  _recalculateClosestPoint() {
    const _this$props2 = this.props,
          highlightPoint = _this$props2.highlightPoint,
          highlightIndex = _this$props2.highlightIndex;

    if (highlightPoint && highlightIndex >= 0) {
      const object = this.props.data[highlightIndex];
      const points = this.props.getPath(object);

      const _getClosestPointOnPol = getClosestPointOnPolyline({
        points,
        p: highlightPoint
      }),
            point = _getClosestPointOnPol.point;

      this.state.closestPoints = [{
        position: point
      }];
    } else {
      this.state.closestPoints = [];
    }
  }

  getPickingInfo({
    info
  }) {
    return Object.assign(info, {
      // override object with picked feature
      object: info.object && info.object.path || info.object
    });
  }

  renderLayers() {
    return [new PathOutlineLayer(this.props, this.getSubLayerProps({
      id: 'paths',
      // Note: data has to be passed explicitly like this to avoid being empty
      data: this.props.data
    })), new this.props.MarkerLayer(this.getSubLayerProps(Object.assign({}, this.props.markerLayerProps, {
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
      id: `${this.props.id}-highlight`,
      data: this.state.closestPoints,
      fp64: this.props.fp64
    })];
  }

}
PathMarkerLayer.layerName = 'PathMarkerLayer';
PathMarkerLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRoLW1hcmtlci1sYXllci9wYXRoLW1hcmtlci1sYXllci5qcyJdLCJuYW1lcyI6WyJDb21wb3NpdGVMYXllciIsIkNPT1JESU5BVEVfU1lTVEVNIiwiU2NhdHRlcnBsb3RMYXllciIsIlBhdGhPdXRsaW5lTGF5ZXIiLCJNZXNoTGF5ZXIiLCJBcnJvdzJER2VvbWV0cnkiLCJjcmVhdGVQYXRoTWFya2VycyIsImdldENsb3Nlc3RQb2ludE9uUG9seWxpbmUiLCJESVNUQU5DRV9GT1JfTVVMVElfQVJST1dTIiwiQVJST1dfSEVBRF9TSVpFIiwiQVJST1dfVEFJTF9XSURUSCIsIkRFRkFVTFRfTUFSS0VSX0xBWUVSIiwiREVGQVVMVF9NQVJLRVJfTEFZRVJfUFJPUFMiLCJtZXNoIiwiaGVhZFNpemUiLCJ0YWlsV2lkdGgiLCJkZWZhdWx0UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJNYXJrZXJMYXllciIsIm1hcmtlckxheWVyUHJvcHMiLCJzaXplU2NhbGUiLCJmcDY0IiwiaGlnaHRsaWdodEluZGV4IiwiaGlnaGxpZ2h0UG9pbnQiLCJnZXRQYXRoIiwieCIsInBhdGgiLCJnZXRDb2xvciIsImNvbG9yIiwiZ2V0TWFya2VyQ29sb3IiLCJnZXREaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJnZXRNYXJrZXJQZXJjZW50YWdlcyIsIm9iamVjdCIsImxpbmVMZW5ndGgiLCJQYXRoTWFya2VyTGF5ZXIiLCJpbml0aWFsaXplU3RhdGUiLCJzdGF0ZSIsIm1hcmtlcnMiLCJjbG9zZXN0UG9pbnQiLCJwcm9qZWN0RmxhdCIsInh5eiIsInZpZXdwb3J0IiwiY29vcmRpbmF0ZVN5c3RlbSIsImNvb3JkaW5hdGVPcmlnaW4iLCJNRVRFUl9PRkZTRVRTIiwibWV0ZXJzVG9MbmdMYXREZWx0YSIsImR4IiwiZHkiLCJ5IiwiTE5HTEFUX09GRlNFVFMiLCJ1cGRhdGVTdGF0ZSIsInByb3BzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImRhdGFDaGFuZ2VkIiwidXBkYXRlVHJpZ2dlcnNDaGFuZ2VkIiwiZGF0YSIsImNvbnRleHQiLCJvIiwiX3JlY2FsY3VsYXRlQ2xvc2VzdFBvaW50IiwicHJvcHNDaGFuZ2VkIiwicG9pbnQiLCJoaWdobGlnaHRJbmRleCIsInBvaW50cyIsInAiLCJjbG9zZXN0UG9pbnRzIiwicG9zaXRpb24iLCJnZXRQaWNraW5nSW5mbyIsImluZm8iLCJyZW5kZXJMYXllcnMiLCJnZXRTdWJMYXllclByb3BzIiwiaWQiLCJwaWNrYWJsZSIsInBhcmFtZXRlcnMiLCJibGVuZCIsImRlcHRoVGVzdCIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxTQUFRQSxjQUFSLEVBQXdCQyxpQkFBeEIsUUFBZ0QsZUFBaEQ7QUFDQSxTQUFRQyxnQkFBUixRQUErQixpQkFBL0I7QUFDQSxPQUFPQyxnQkFBUCxNQUE2QiwwQ0FBN0I7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLDBCQUF0QjtBQUNBLE9BQU9DLGVBQVAsTUFBNEIscUJBQTVCO0FBRUEsT0FBT0MsaUJBQVAsTUFBOEIsdUJBQTlCO0FBQ0EsU0FBUUMseUJBQVIsUUFBd0MsWUFBeEM7QUFFQSxNQUFNQyw0QkFBNEIsR0FBbEM7QUFDQSxNQUFNQyxrQkFBa0IsR0FBeEI7QUFDQSxNQUFNQyxtQkFBbUIsSUFBekIsQyxDQUNBOztBQUVBLE1BQU1DLHVCQUF1QlAsU0FBN0I7QUFFQSxNQUFNUSw2QkFBNkI7QUFDakNDLFFBQU0sSUFBSVIsZUFBSixDQUFvQjtBQUFDUyxjQUFVTCxlQUFYO0FBQTRCTSxlQUFXTDtBQUF2QyxHQUFwQjtBQUQyQixDQUFuQztBQUlBLE1BQU1NLGVBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCZixpQkFBaUJhLFlBQW5DLEVBQWlEO0FBQ3BFRyxlQUFhUixvQkFEdUQ7QUFFcEVTLG9CQUFrQlIsMEJBRmtEO0FBSXBFUyxhQUFXLEdBSnlEO0FBS3BFQyxRQUFNLEtBTDhEO0FBT3BFQyxtQkFBaUIsQ0FBQyxDQVBrRDtBQVFwRUMsa0JBQWdC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QU0sS0FBS0wsS0FBTCxDQUFXSztBQUhHLEtBQXRCLENBRkYsQ0FESyxFQVNMLElBQUksS0FBS0wsS0FBTCxDQUFXbEMsV0FBZixDQUNFLEtBQUtxRCxnQkFBTCxDQUNFdkQsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS21DLEtBQUwsQ0FBV2pDLGdCQUE3QixFQUErQztBQUM3Q3FELFVBQUksU0FEeUM7QUFFN0NmLFlBQU0sS0FBS3BCLEtBQUwsQ0FBV0MsT0FGNEI7QUFHN0NsQixpQkFBVyxLQUFLZ0MsS0FBTCxDQUFXaEMsU0FIdUI7QUFJN0NDLFlBQU0sS0FBSytCLEtBQUwsQ0FBVy9CLElBSjRCO0FBSzdDb0QsZ0JBQVUsS0FMbUM7QUFNN0NDLGtCQUFZO0FBQ1ZDLGVBQU8sS0FERztBQUVWQyxtQkFBVztBQUZEO0FBTmlDLEtBQS9DLENBREYsQ0FERixDQVRLLEVBd0JMLEtBQUt2QyxLQUFMLENBQVc2QixhQUFYLElBQ0UsSUFBSWpFLGdCQUFKLENBQXFCO0FBQ25CdUUsVUFBSyxHQUFFLEtBQUtwQixLQUFMLENBQVdvQixFQUFHLFlBREY7QUFFbkJmLFlBQU0sS0FBS3BCLEtBQUwsQ0FBVzZCLGFBRkU7QUFHbkI3QyxZQUFNLEtBQUsrQixLQUFMLENBQVcvQjtBQUhFLEtBQXJCLENBekJHLENBQVA7QUErQkQ7O0FBNUd5RDtBQStHNURjLGdCQUFnQjBDLFNBQWhCLEdBQTRCLGlCQUE1QjtBQUNBMUMsZ0JBQWdCcEIsWUFBaEIsR0FBK0JBLFlBQS9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb3NpdGVMYXllciwgQ09PUkRJTkFURV9TWVNURU19IGZyb20gJ0BkZWNrLmdsL2NvcmUnO1xuaW1wb3J0IHtTY2F0dGVycGxvdExheWVyfSBmcm9tICdAZGVjay5nbC9sYXllcnMnO1xuaW1wb3J0IFBhdGhPdXRsaW5lTGF5ZXIgZnJvbSAnLi4vcGF0aC1vdXRsaW5lLWxheWVyL3BhdGgtb3V0bGluZS1sYXllcic7XG5pbXBvcnQgTWVzaExheWVyIGZyb20gJy4uL21lc2gtbGF5ZXIvbWVzaC1sYXllcic7XG5pbXBvcnQgQXJyb3cyREdlb21ldHJ5IGZyb20gJy4vYXJyb3ctMmQtZ2VvbWV0cnknO1xuXG5pbXBvcnQgY3JlYXRlUGF0aE1hcmtlcnMgZnJvbSAnLi9jcmVhdGUtcGF0aC1tYXJrZXJzJztcbmltcG9ydCB7Z2V0Q2xvc2VzdFBvaW50T25Qb2x5bGluZX0gZnJvbSAnLi9wb2x5bGluZSc7XG5cbmNvbnN0IERJU1RBTkNFX0ZPUl9NVUxUSV9BUlJPV1MgPSAwLjE7XG5jb25zdCBBUlJPV19IRUFEX1NJWkUgPSAwLjI7XG5jb25zdCBBUlJPV19UQUlMX1dJRFRIID0gMC4wNTtcbi8vIGNvbnN0IEFSUk9XX0NFTlRFUl9BREpVU1QgPSAtMC44O1xuXG5jb25zdCBERUZBVUxUX01BUktFUl9MQVlFUiA9IE1lc2hMYXllcjtcblxuY29uc3QgREVGQVVMVF9NQVJLRVJfTEFZRVJfUFJPUFMgPSB7XG4gIG1lc2g6IG5ldyBBcnJvdzJER2VvbWV0cnkoe2hlYWRTaXplOiBBUlJPV19IRUFEX1NJWkUsIHRhaWxXaWR0aDogQVJST1dfVEFJTF9XSURUSH0pXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBQYXRoT3V0bGluZUxheWVyLmRlZmF1bHRQcm9wcywge1xuICBNYXJrZXJMYXllcjogREVGQVVMVF9NQVJLRVJfTEFZRVIsXG4gIG1hcmtlckxheWVyUHJvcHM6IERFRkFVTFRfTUFSS0VSX0xBWUVSX1BST1BTLFxuXG4gIHNpemVTY2FsZTogMTAwLFxuICBmcDY0OiBmYWxzZSxcblxuICBoaWdodGxpZ2h0SW5kZXg6IC0xLFxuICBoaWdobGlnaHRQb2ludDogbnVsbCxcblxuICBnZXRQYXRoOiB4ID0+IHgucGF0aCxcbiAgZ2V0Q29sb3I6IHggPT4geC5jb2xvcixcbiAgZ2V0TWFya2VyQ29sb3I6IHggPT4gWzAsIDAsIDAsIDI1NV0sXG4gIGdldERpcmVjdGlvbjogeCA9PiB4LmRpcmVjdGlvbixcbiAgZ2V0TWFya2VyUGVyY2VudGFnZXM6IChvYmplY3QsIHtsaW5lTGVuZ3RofSkgPT5cbiAgICBsaW5lTGVuZ3RoID4gRElTVEFOQ0VfRk9SX01VTFRJX0FSUk9XUyA/IFswLjI1LCAwLjUsIDAuNzVdIDogWzAuNV1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoTWFya2VyTGF5ZXIgZXh0ZW5kcyBDb21wb3NpdGVMYXllciB7XG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWFya2VyczogW10sXG4gICAgICBtZXNoOiBuZXcgQXJyb3cyREdlb21ldHJ5KHtoZWFkU2l6ZTogQVJST1dfSEVBRF9TSVpFLCB0YWlsV2lkdGg6IEFSUk9XX1RBSUxfV0lEVEh9KSxcbiAgICAgIGNsb3Nlc3RQb2ludDogbnVsbFxuICAgIH07XG4gIH1cblxuICBwcm9qZWN0RmxhdCh4eXosIHZpZXdwb3J0LCBjb29yZGluYXRlU3lzdGVtLCBjb29yZGluYXRlT3JpZ2luKSB7XG4gICAgaWYgKGNvb3JkaW5hdGVTeXN0ZW0gPT09IENPT1JESU5BVEVfU1lTVEVNLk1FVEVSX09GRlNFVFMpIHtcbiAgICAgIGNvbnN0IFtkeCwgZHldID0gdmlld3BvcnQubWV0ZXJzVG9MbmdMYXREZWx0YSh4eXopO1xuICAgICAgY29uc3QgW3gsIHldID0gY29vcmRpbmF0ZU9yaWdpbjtcbiAgICAgIHJldHVybiB2aWV3cG9ydC5wcm9qZWN0RmxhdChbeCAtIGR4LCBkeSArIHldKTtcbiAgICB9IGVsc2UgaWYgKGNvb3JkaW5hdGVTeXN0ZW0gPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVF9PRkZTRVRTKSB7XG4gICAgICBjb25zdCBbZHgsIGR5XSA9IHh5ejtcbiAgICAgIGNvbnN0IFt4LCB5XSA9IGNvb3JkaW5hdGVPcmlnaW47XG4gICAgICByZXR1cm4gdmlld3BvcnQucHJvamVjdEZsYXQoW3ggLSBkeCwgZHkgKyB5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpZXdwb3J0LnByb2plY3RGbGF0KHh5eik7XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHwgY2hhbmdlRmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIGdldFBhdGgsXG4gICAgICAgIGdldERpcmVjdGlvbixcbiAgICAgICAgZ2V0TWFya2VyQ29sb3IsXG4gICAgICAgIGdldE1hcmtlclBlcmNlbnRhZ2VzLFxuICAgICAgICBjb29yZGluYXRlU3lzdGVtLFxuICAgICAgICBjb29yZGluYXRlT3JpZ2luXG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICBjb25zdCBwcm9qZWN0RmxhdCA9IG8gPT4gdGhpcy5wcm9qZWN0RmxhdChvLCB2aWV3cG9ydCwgY29vcmRpbmF0ZVN5c3RlbSwgY29vcmRpbmF0ZU9yaWdpbik7XG4gICAgICB0aGlzLnN0YXRlLm1hcmtlcnMgPSBjcmVhdGVQYXRoTWFya2Vycyh7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIGdldFBhdGgsXG4gICAgICAgIGdldERpcmVjdGlvbixcbiAgICAgICAgZ2V0Q29sb3I6IGdldE1hcmtlckNvbG9yLFxuICAgICAgICBnZXRNYXJrZXJQZXJjZW50YWdlcyxcbiAgICAgICAgcHJvamVjdEZsYXRcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcmVjYWxjdWxhdGVDbG9zZXN0UG9pbnQoKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZUZsYWdzLnByb3BzQ2hhbmdlZCkge1xuICAgICAgaWYgKHByb3BzLnBvaW50ICE9PSBvbGRQcm9wcy5wb2ludCkge1xuICAgICAgICB0aGlzLl9yZWNhbGN1bGF0ZUNsb3Nlc3RQb2ludCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZWNhbGN1bGF0ZUNsb3Nlc3RQb2ludCgpIHtcbiAgICBjb25zdCB7aGlnaGxpZ2h0UG9pbnQsIGhpZ2hsaWdodEluZGV4fSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGhpZ2hsaWdodFBvaW50ICYmIGhpZ2hsaWdodEluZGV4ID49IDApIHtcbiAgICAgIGNvbnN0IG9iamVjdCA9IHRoaXMucHJvcHMuZGF0YVtoaWdobGlnaHRJbmRleF07XG4gICAgICBjb25zdCBwb2ludHMgPSB0aGlzLnByb3BzLmdldFBhdGgob2JqZWN0KTtcbiAgICAgIGNvbnN0IHtwb2ludH0gPSBnZXRDbG9zZXN0UG9pbnRPblBvbHlsaW5lKHtwb2ludHMsIHA6IGhpZ2hsaWdodFBvaW50fSk7XG4gICAgICB0aGlzLnN0YXRlLmNsb3Nlc3RQb2ludHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwb3NpdGlvbjogcG9pbnRcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZS5jbG9zZXN0UG9pbnRzID0gW107XG4gICAgfVxuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm99KSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5mbywge1xuICAgICAgLy8gb3ZlcnJpZGUgb2JqZWN0IHdpdGggcGlja2VkIGZlYXR1cmVcbiAgICAgIG9iamVjdDogKGluZm8ub2JqZWN0ICYmIGluZm8ub2JqZWN0LnBhdGgpIHx8IGluZm8ub2JqZWN0XG4gICAgfSk7XG4gIH1cblxuICByZW5kZXJMYXllcnMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBQYXRoT3V0bGluZUxheWVyKFxuICAgICAgICB0aGlzLnByb3BzLFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoe1xuICAgICAgICAgIGlkOiAncGF0aHMnLFxuICAgICAgICAgIC8vIE5vdGU6IGRhdGEgaGFzIHRvIGJlIHBhc3NlZCBleHBsaWNpdGx5IGxpa2UgdGhpcyB0byBhdm9pZCBiZWluZyBlbXB0eVxuICAgICAgICAgIGRhdGE6IHRoaXMucHJvcHMuZGF0YVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIG5ldyB0aGlzLnByb3BzLk1hcmtlckxheWVyKFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcy5tYXJrZXJMYXllclByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ21hcmtlcnMnLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5zdGF0ZS5tYXJrZXJzLFxuICAgICAgICAgICAgc2l6ZVNjYWxlOiB0aGlzLnByb3BzLnNpemVTY2FsZSxcbiAgICAgICAgICAgIGZwNjQ6IHRoaXMucHJvcHMuZnA2NCxcbiAgICAgICAgICAgIHBpY2thYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgYmxlbmQ6IGZhbHNlLFxuICAgICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIHRoaXMuc3RhdGUuY2xvc2VzdFBvaW50cyAmJlxuICAgICAgICBuZXcgU2NhdHRlcnBsb3RMYXllcih7XG4gICAgICAgICAgaWQ6IGAke3RoaXMucHJvcHMuaWR9LWhpZ2hsaWdodGAsXG4gICAgICAgICAgZGF0YTogdGhpcy5zdGF0ZS5jbG9zZXN0UG9pbnRzLFxuICAgICAgICAgIGZwNjQ6IHRoaXMucHJvcHMuZnA2NFxuICAgICAgICB9KVxuICAgIF07XG4gIH1cbn1cblxuUGF0aE1hcmtlckxheWVyLmxheWVyTmFtZSA9ICdQYXRoTWFya2VyTGF5ZXInO1xuUGF0aE1hcmtlckxheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==