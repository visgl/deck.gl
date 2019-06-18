var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import OrbitControllerJS from '../../core/pure-js/orbit-controller-js';
import OrbitViewport from '../../core/viewports/orbit-viewport';

var OrbitController = function (_PureComponent) {
  _inherits(OrbitController, _PureComponent);

  _createClass(OrbitController, null, [{
    key: 'getViewport',


    // Returns a deck.gl Viewport instance, to be used with the DeckGL component
    value: function getViewport(viewport) {
      return new OrbitViewport(viewport);
    }
  }]);

  function OrbitController(props) {
    _classCallCheck(this, OrbitController);

    var _this = _possibleConstructorReturn(this, (OrbitController.__proto__ || Object.getPrototypeOf(OrbitController)).call(this, props));

    _this.controller = null;
    return _this;
  }

  _createClass(OrbitController, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventCanvas = this.refs.eventCanvas;

      this.controller = new OrbitControllerJS(Object.assign({}, this.props, { canvas: eventCanvas }));
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

  return OrbitController;
}(PureComponent);

export default OrbitController;


OrbitController.displayName = 'OrbitController';
OrbitController.propTypes = OrbitControllerJS.propTypes;
OrbitController.defaultProps = OrbitControllerJS.defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZWFjdC9leHBlcmltZW50YWwvb3JiaXQtY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIk9yYml0Q29udHJvbGxlckpTIiwiT3JiaXRWaWV3cG9ydCIsIk9yYml0Q29udHJvbGxlciIsInZpZXdwb3J0IiwicHJvcHMiLCJjb250cm9sbGVyIiwiZXZlbnRDYW52YXMiLCJyZWZzIiwiT2JqZWN0IiwiYXNzaWduIiwiY2FudmFzIiwibmV4dFByb3BzIiwic2V0UHJvcHMiLCJmaW5hbGl6ZSIsIndpZHRoIiwiaGVpZ2h0IiwiZXZlbnRDYW52YXNTdHlsZSIsInBvc2l0aW9uIiwia2V5IiwicmVmIiwic3R5bGUiLCJjaGlsZHJlbiIsImRpc3BsYXlOYW1lIiwicHJvcFR5cGVzIiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQVFBLGFBQVIsRUFBdUJDLGFBQXZCLFFBQTJDLE9BQTNDO0FBQ0EsT0FBT0MsaUJBQVAsTUFBOEIsd0NBQTlCO0FBQ0EsT0FBT0MsYUFBUCxNQUEwQixxQ0FBMUI7O0lBRXFCQyxlOzs7Ozs7O0FBRW5CO2dDQUNtQkMsUSxFQUFVO0FBQzNCLGFBQU8sSUFBSUYsYUFBSixDQUFrQkUsUUFBbEIsQ0FBUDtBQUNEOzs7QUFFRCwyQkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLGtJQUNYQSxLQURXOztBQUVqQixVQUFLQyxVQUFMLEdBQWtCLElBQWxCO0FBRmlCO0FBR2xCOzs7O3dDQUVtQjtBQUFBLFVBQ1hDLFdBRFcsR0FDSSxLQUFLQyxJQURULENBQ1hELFdBRFc7O0FBRWxCLFdBQUtELFVBQUwsR0FBa0IsSUFBSUwsaUJBQUosQ0FBc0JRLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtMLEtBQXZCLEVBQThCLEVBQUNNLFFBQVFKLFdBQVQsRUFBOUIsQ0FBdEIsQ0FBbEI7QUFDRDs7O3dDQUVtQkssUyxFQUFXO0FBQzdCLFdBQUtOLFVBQUwsQ0FBZ0JPLFFBQWhCLENBQXlCRCxTQUF6QjtBQUNEOzs7MkNBRXNCO0FBQ3JCLFdBQUtOLFVBQUwsQ0FBZ0JRLFFBQWhCO0FBQ0Q7Ozs2QkFFUTtBQUFBLG1CQUNpQixLQUFLVCxLQUR0QjtBQUFBLFVBQ0FVLEtBREEsVUFDQUEsS0FEQTtBQUFBLFVBQ09DLE1BRFAsVUFDT0EsTUFEUDs7O0FBR1AsVUFBTUMsbUJBQW1CO0FBQ3ZCRixvQkFEdUI7QUFFdkJDLHNCQUZ1QjtBQUd2QkUsa0JBQVU7QUFIYSxPQUF6Qjs7QUFNQSxhQUNFbEIsY0FBYyxLQUFkLEVBQXFCO0FBQ25CbUIsYUFBSyxjQURjO0FBRW5CQyxhQUFLLGFBRmM7QUFHbkJDLGVBQU9KO0FBSFksT0FBckIsRUFLRSxLQUFLWixLQUFMLENBQVdpQixRQUxiLENBREY7QUFTRDs7OztFQTNDMEN2QixhOztlQUF4QkksZTs7O0FBOENyQkEsZ0JBQWdCb0IsV0FBaEIsR0FBOEIsaUJBQTlCO0FBQ0FwQixnQkFBZ0JxQixTQUFoQixHQUE0QnZCLGtCQUFrQnVCLFNBQTlDO0FBQ0FyQixnQkFBZ0JzQixZQUFoQixHQUErQnhCLGtCQUFrQndCLFlBQWpEIiwiZmlsZSI6Im9yYml0LWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1B1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBPcmJpdENvbnRyb2xsZXJKUyBmcm9tICcuLi8uLi9jb3JlL3B1cmUtanMvb3JiaXQtY29udHJvbGxlci1qcyc7XG5pbXBvcnQgT3JiaXRWaWV3cG9ydCBmcm9tICcuLi8uLi9jb3JlL3ZpZXdwb3J0cy9vcmJpdC12aWV3cG9ydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yYml0Q29udHJvbGxlciBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuXG4gIC8vIFJldHVybnMgYSBkZWNrLmdsIFZpZXdwb3J0IGluc3RhbmNlLCB0byBiZSB1c2VkIHdpdGggdGhlIERlY2tHTCBjb21wb25lbnRcbiAgc3RhdGljIGdldFZpZXdwb3J0KHZpZXdwb3J0KSB7XG4gICAgcmV0dXJuIG5ldyBPcmJpdFZpZXdwb3J0KHZpZXdwb3J0KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuY29udHJvbGxlciA9IG51bGw7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7ZXZlbnRDYW52YXN9ID0gdGhpcy5yZWZzO1xuICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBPcmJpdENvbnRyb2xsZXJKUyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7Y2FudmFzOiBldmVudENhbnZhc30pKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLnNldFByb3BzKG5leHRQcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZmluYWxpemUoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgZXZlbnRDYW52YXNTdHlsZSA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiAnbWFwLWNvbnRyb2xzJyxcbiAgICAgICAgcmVmOiAnZXZlbnRDYW52YXMnLFxuICAgICAgICBzdHlsZTogZXZlbnRDYW52YXNTdHlsZVxuICAgICAgfSxcbiAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuT3JiaXRDb250cm9sbGVyLmRpc3BsYXlOYW1lID0gJ09yYml0Q29udHJvbGxlcic7XG5PcmJpdENvbnRyb2xsZXIucHJvcFR5cGVzID0gT3JiaXRDb250cm9sbGVySlMucHJvcFR5cGVzO1xuT3JiaXRDb250cm9sbGVyLmRlZmF1bHRQcm9wcyA9IE9yYml0Q29udHJvbGxlckpTLmRlZmF1bHRQcm9wcztcbiJdfQ==