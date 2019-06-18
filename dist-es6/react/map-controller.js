var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import MapControllerJS from '../core/pure-js/map-controller-js';

var MapController = function (_PureComponent) {
  _inherits(MapController, _PureComponent);

  function MapController(props) {
    _classCallCheck(this, MapController);

    var _this = _possibleConstructorReturn(this, (MapController.__proto__ || Object.getPrototypeOf(MapController)).call(this, props));

    _this.controller = null;
    return _this;
  }

  _createClass(MapController, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventCanvas = this.refs.eventCanvas;

      this.controller = new MapControllerJS(Object.assign({}, this.props, { canvas: eventCanvas }));
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this.controller.setProps(nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.controller.finalize();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative'
      };

      return createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      }, this.props.children);
    }
  }]);

  return MapController;
}(PureComponent);

export default MapController;


MapController.displayName = 'MapController';
MapController.propTypes = MapControllerJS.propTypes;
MapController.defaultProps = MapControllerJS.defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdC9tYXAtY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIk1hcENvbnRyb2xsZXJKUyIsIk1hcENvbnRyb2xsZXIiLCJwcm9wcyIsImNvbnRyb2xsZXIiLCJldmVudENhbnZhcyIsInJlZnMiLCJPYmplY3QiLCJhc3NpZ24iLCJjYW52YXMiLCJuZXh0UHJvcHMiLCJzZXRQcm9wcyIsImZpbmFsaXplIiwid2lkdGgiLCJoZWlnaHQiLCJldmVudENhbnZhc1N0eWxlIiwicG9zaXRpb24iLCJrZXkiLCJyZWYiLCJzdHlsZSIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiLCJwcm9wVHlwZXMiLCJkZWZhdWx0UHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBUUEsYUFBUixFQUF1QkMsYUFBdkIsUUFBMkMsT0FBM0M7QUFDQSxPQUFPQyxlQUFQLE1BQTRCLG1DQUE1Qjs7SUFFcUJDLGE7OztBQUVuQix5QkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLDhIQUNYQSxLQURXOztBQUVqQixVQUFLQyxVQUFMLEdBQWtCLElBQWxCO0FBRmlCO0FBR2xCOzs7O3dDQUVtQjtBQUFBLFVBQ1hDLFdBRFcsR0FDSSxLQUFLQyxJQURULENBQ1hELFdBRFc7O0FBRWxCLFdBQUtELFVBQUwsR0FBa0IsSUFBSUgsZUFBSixDQUFvQk0sT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS0wsS0FBdkIsRUFBOEIsRUFBQ00sUUFBUUosV0FBVCxFQUE5QixDQUFwQixDQUFsQjtBQUNEOzs7d0NBRW1CSyxTLEVBQVc7QUFDN0IsV0FBS04sVUFBTCxDQUFnQk8sUUFBaEIsQ0FBeUJELFNBQXpCO0FBQ0Q7OzsyQ0FFc0I7QUFDckIsV0FBS04sVUFBTCxDQUFnQlEsUUFBaEI7QUFDRDs7OzZCQUVRO0FBQUEsbUJBQ2lCLEtBQUtULEtBRHRCO0FBQUEsVUFDQVUsS0FEQSxVQUNBQSxLQURBO0FBQUEsVUFDT0MsTUFEUCxVQUNPQSxNQURQOzs7QUFHUCxVQUFNQyxtQkFBbUI7QUFDdkJGLG9CQUR1QjtBQUV2QkMsc0JBRnVCO0FBR3ZCRSxrQkFBVTtBQUhhLE9BQXpCOztBQU1BLGFBQ0VoQixjQUFjLEtBQWQsRUFBcUI7QUFDbkJpQixhQUFLLGNBRGM7QUFFbkJDLGFBQUssYUFGYztBQUduQkMsZUFBT0o7QUFIWSxPQUFyQixFQUtFLEtBQUtaLEtBQUwsQ0FBV2lCLFFBTGIsQ0FERjtBQVNEOzs7O0VBdEN3Q3JCLGE7O2VBQXRCRyxhOzs7QUF5Q3JCQSxjQUFjbUIsV0FBZCxHQUE0QixlQUE1QjtBQUNBbkIsY0FBY29CLFNBQWQsR0FBMEJyQixnQkFBZ0JxQixTQUExQztBQUNBcEIsY0FBY3FCLFlBQWQsR0FBNkJ0QixnQkFBZ0JzQixZQUE3QyIsImZpbGUiOiJtYXAtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IE1hcENvbnRyb2xsZXJKUyBmcm9tICcuLi9jb3JlL3B1cmUtanMvbWFwLWNvbnRyb2xsZXItanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBDb250cm9sbGVyIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5jb250cm9sbGVyID0gbnVsbDtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHtldmVudENhbnZhc30gPSB0aGlzLnJlZnM7XG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IE1hcENvbnRyb2xsZXJKUyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7Y2FudmFzOiBldmVudENhbnZhc30pKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLnNldFByb3BzKG5leHRQcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZmluYWxpemUoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgZXZlbnRDYW52YXNTdHlsZSA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiAnbWFwLWNvbnRyb2xzJyxcbiAgICAgICAgcmVmOiAnZXZlbnRDYW52YXMnLFxuICAgICAgICBzdHlsZTogZXZlbnRDYW52YXNTdHlsZVxuICAgICAgfSxcbiAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuTWFwQ29udHJvbGxlci5kaXNwbGF5TmFtZSA9ICdNYXBDb250cm9sbGVyJztcbk1hcENvbnRyb2xsZXIucHJvcFR5cGVzID0gTWFwQ29udHJvbGxlckpTLnByb3BUeXBlcztcbk1hcENvbnRyb2xsZXIuZGVmYXVsdFByb3BzID0gTWFwQ29udHJvbGxlckpTLmRlZmF1bHRQcm9wcztcbiJdfQ==