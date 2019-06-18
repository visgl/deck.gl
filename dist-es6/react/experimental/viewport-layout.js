var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { createElement, cloneElement } from 'react';
import { flatten } from '../../core/utils/flatten';

var ViewportLayout = function (_React$Component) {
  _inherits(ViewportLayout, _React$Component);

  function ViewportLayout(props) {
    _classCallCheck(this, ViewportLayout);

    return _possibleConstructorReturn(this, (ViewportLayout.__proto__ || Object.getPrototypeOf(ViewportLayout)).call(this, props));
  }

  // Iterate over viewport descriptors and render viewports at specified positions


  _createClass(ViewportLayout, [{
    key: '_renderChildrenUnderViewports',
    value: function _renderChildrenUnderViewports() {
      // Flatten out nested viewports array
      var viewports = flatten(this.props.viewports, { filter: Boolean });

      // Build a viewport id to viewport index
      var viewportMap = {};
      viewports.forEach(function (viewportOrDescriptor) {
        var viewport = viewportOrDescriptor.viewport || viewportOrDescriptor;
        if (viewport.id) {
          viewportMap[viewport.id] = viewport;
        }
      });

      var originalChildren = React.Children.toArray(this.props.children);
      var lastElement = originalChildren.pop();

      var children = originalChildren.map(function (child, i) {
        // If viewportId is provided, match with viewport
        if (child.props.viewportId) {
          var viewport = viewportMap[child.props.viewportId];

          // TODO - this is too react-map-gl specific
          var newProps = Object.assign({}, child.props, {
            visible: viewport.isMapSynched(),
            width: viewport.width,
            height: viewport.height
          }, viewport.getMercatorParams());

          var clone = cloneElement(child, newProps);

          var _style = {
            position: 'absolute',
            left: viewport.x,
            top: viewport.y,
            width: viewport.width,
            height: viewport.height
          };

          child = createElement('div', { key: 'viewport-component-' + i, style: _style }, clone);
        }

        return child;
      });

      var style = { position: 'absolute', left: 0, top: 0 };
      children.push(createElement('div', { key: 'children', style: style }, lastElement));

      return children;
    }
  }, {
    key: 'render',
    value: function render() {
      // Render the background elements (typically react-map-gl instances)
      // using the viewport descriptors
      var children = this._renderChildrenUnderViewports();
      return createElement('div', {}, children);
    }
  }]);

  return ViewportLayout;
}(React.Component);

export default ViewportLayout;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZWFjdC9leHBlcmltZW50YWwvdmlld3BvcnQtbGF5b3V0LmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsImNsb25lRWxlbWVudCIsImZsYXR0ZW4iLCJWaWV3cG9ydExheW91dCIsInByb3BzIiwidmlld3BvcnRzIiwiZmlsdGVyIiwiQm9vbGVhbiIsInZpZXdwb3J0TWFwIiwiZm9yRWFjaCIsInZpZXdwb3J0Iiwidmlld3BvcnRPckRlc2NyaXB0b3IiLCJpZCIsIm9yaWdpbmFsQ2hpbGRyZW4iLCJDaGlsZHJlbiIsInRvQXJyYXkiLCJjaGlsZHJlbiIsImxhc3RFbGVtZW50IiwicG9wIiwibWFwIiwiY2hpbGQiLCJpIiwidmlld3BvcnRJZCIsIm5ld1Byb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwidmlzaWJsZSIsImlzTWFwU3luY2hlZCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0TWVyY2F0b3JQYXJhbXMiLCJjbG9uZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwieCIsInRvcCIsInkiLCJrZXkiLCJwdXNoIiwiX3JlbmRlckNoaWxkcmVuVW5kZXJWaWV3cG9ydHMiLCJDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsT0FBT0EsS0FBUCxJQUFlQyxhQUFmLEVBQThCQyxZQUE5QixRQUFpRCxPQUFqRDtBQUNBLFNBQVFDLE9BQVIsUUFBc0IsMEJBQXRCOztJQUVxQkMsYzs7O0FBRW5CLDBCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsMkhBQ1hBLEtBRFc7QUFFbEI7O0FBRUQ7Ozs7O29EQUNnQztBQUM5QjtBQUNBLFVBQU1DLFlBQVlILFFBQVEsS0FBS0UsS0FBTCxDQUFXQyxTQUFuQixFQUE4QixFQUFDQyxRQUFRQyxPQUFULEVBQTlCLENBQWxCOztBQUVBO0FBQ0EsVUFBTUMsY0FBYyxFQUFwQjtBQUNBSCxnQkFBVUksT0FBVixDQUFrQixnQ0FBd0I7QUFDeEMsWUFBTUMsV0FBV0MscUJBQXFCRCxRQUFyQixJQUFpQ0Msb0JBQWxEO0FBQ0EsWUFBSUQsU0FBU0UsRUFBYixFQUFpQjtBQUNmSixzQkFBWUUsU0FBU0UsRUFBckIsSUFBMkJGLFFBQTNCO0FBQ0Q7QUFDRixPQUxEOztBQU9BLFVBQU1HLG1CQUFtQmQsTUFBTWUsUUFBTixDQUFlQyxPQUFmLENBQXVCLEtBQUtYLEtBQUwsQ0FBV1ksUUFBbEMsQ0FBekI7QUFDQSxVQUFNQyxjQUFjSixpQkFBaUJLLEdBQWpCLEVBQXBCOztBQUVBLFVBQU1GLFdBQVdILGlCQUFpQk0sR0FBakIsQ0FBcUIsVUFBQ0MsS0FBRCxFQUFRQyxDQUFSLEVBQWM7QUFDbEQ7QUFDQSxZQUFJRCxNQUFNaEIsS0FBTixDQUFZa0IsVUFBaEIsRUFBNEI7QUFDMUIsY0FBTVosV0FBV0YsWUFBWVksTUFBTWhCLEtBQU4sQ0FBWWtCLFVBQXhCLENBQWpCOztBQUVBO0FBQ0EsY0FBTUMsV0FBV0MsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JMLE1BQU1oQixLQUF4QixFQUErQjtBQUM5Q3NCLHFCQUFTaEIsU0FBU2lCLFlBQVQsRUFEcUM7QUFFOUNDLG1CQUFPbEIsU0FBU2tCLEtBRjhCO0FBRzlDQyxvQkFBUW5CLFNBQVNtQjtBQUg2QixXQUEvQixFQUlkbkIsU0FBU29CLGlCQUFULEVBSmMsQ0FBakI7O0FBTUEsY0FBTUMsUUFBUTlCLGFBQWFtQixLQUFiLEVBQW9CRyxRQUFwQixDQUFkOztBQUVBLGNBQU1TLFNBQVE7QUFDWkMsc0JBQVUsVUFERTtBQUVaQyxrQkFBTXhCLFNBQVN5QixDQUZIO0FBR1pDLGlCQUFLMUIsU0FBUzJCLENBSEY7QUFJWlQsbUJBQU9sQixTQUFTa0IsS0FKSjtBQUtaQyxvQkFBUW5CLFNBQVNtQjtBQUxMLFdBQWQ7O0FBUUFULGtCQUFRcEIsY0FBYyxLQUFkLEVBQXFCLEVBQUNzQyw2QkFBMkJqQixDQUE1QixFQUFpQ1csYUFBakMsRUFBckIsRUFBOERELEtBQTlELENBQVI7QUFDRDs7QUFFRCxlQUFPWCxLQUFQO0FBQ0QsT0ExQmdCLENBQWpCOztBQTRCQSxVQUFNWSxRQUFRLEVBQUNDLFVBQVUsVUFBWCxFQUF1QkMsTUFBTSxDQUE3QixFQUFnQ0UsS0FBSyxDQUFyQyxFQUFkO0FBQ0FwQixlQUFTdUIsSUFBVCxDQUFjdkMsY0FBYyxLQUFkLEVBQXFCLEVBQUNzQyxLQUFLLFVBQU4sRUFBa0JOLFlBQWxCLEVBQXJCLEVBQStDZixXQUEvQyxDQUFkOztBQUVBLGFBQU9ELFFBQVA7QUFDRDs7OzZCQUVRO0FBQ1A7QUFDQTtBQUNBLFVBQU1BLFdBQVcsS0FBS3dCLDZCQUFMLEVBQWpCO0FBQ0EsYUFBT3hDLGNBQWMsS0FBZCxFQUFxQixFQUFyQixFQUF5QmdCLFFBQXpCLENBQVA7QUFDRDs7OztFQTlEeUNqQixNQUFNMEMsUzs7ZUFBN0J0QyxjIiwiZmlsZSI6InZpZXdwb3J0LWxheW91dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge2NyZWF0ZUVsZW1lbnQsIGNsb25lRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtmbGF0dGVufSBmcm9tICcuLi8uLi9jb3JlL3V0aWxzL2ZsYXR0ZW4nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3cG9ydExheW91dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICAvLyBJdGVyYXRlIG92ZXIgdmlld3BvcnQgZGVzY3JpcHRvcnMgYW5kIHJlbmRlciB2aWV3cG9ydHMgYXQgc3BlY2lmaWVkIHBvc2l0aW9uc1xuICBfcmVuZGVyQ2hpbGRyZW5VbmRlclZpZXdwb3J0cygpIHtcbiAgICAvLyBGbGF0dGVuIG91dCBuZXN0ZWQgdmlld3BvcnRzIGFycmF5XG4gICAgY29uc3Qgdmlld3BvcnRzID0gZmxhdHRlbih0aGlzLnByb3BzLnZpZXdwb3J0cywge2ZpbHRlcjogQm9vbGVhbn0pO1xuXG4gICAgLy8gQnVpbGQgYSB2aWV3cG9ydCBpZCB0byB2aWV3cG9ydCBpbmRleFxuICAgIGNvbnN0IHZpZXdwb3J0TWFwID0ge307XG4gICAgdmlld3BvcnRzLmZvckVhY2godmlld3BvcnRPckRlc2NyaXB0b3IgPT4ge1xuICAgICAgY29uc3Qgdmlld3BvcnQgPSB2aWV3cG9ydE9yRGVzY3JpcHRvci52aWV3cG9ydCB8fCB2aWV3cG9ydE9yRGVzY3JpcHRvcjtcbiAgICAgIGlmICh2aWV3cG9ydC5pZCkge1xuICAgICAgICB2aWV3cG9ydE1hcFt2aWV3cG9ydC5pZF0gPSB2aWV3cG9ydDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IG9yaWdpbmFsQ2hpbGRyZW4gPSBSZWFjdC5DaGlsZHJlbi50b0FycmF5KHRoaXMucHJvcHMuY2hpbGRyZW4pO1xuICAgIGNvbnN0IGxhc3RFbGVtZW50ID0gb3JpZ2luYWxDaGlsZHJlbi5wb3AoKTtcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gb3JpZ2luYWxDaGlsZHJlbi5tYXAoKGNoaWxkLCBpKSA9PiB7XG4gICAgICAvLyBJZiB2aWV3cG9ydElkIGlzIHByb3ZpZGVkLCBtYXRjaCB3aXRoIHZpZXdwb3J0XG4gICAgICBpZiAoY2hpbGQucHJvcHMudmlld3BvcnRJZCkge1xuICAgICAgICBjb25zdCB2aWV3cG9ydCA9IHZpZXdwb3J0TWFwW2NoaWxkLnByb3BzLnZpZXdwb3J0SWRdO1xuXG4gICAgICAgIC8vIFRPRE8gLSB0aGlzIGlzIHRvbyByZWFjdC1tYXAtZ2wgc3BlY2lmaWNcbiAgICAgICAgY29uc3QgbmV3UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBjaGlsZC5wcm9wcywge1xuICAgICAgICAgIHZpc2libGU6IHZpZXdwb3J0LmlzTWFwU3luY2hlZCgpLFxuICAgICAgICAgIHdpZHRoOiB2aWV3cG9ydC53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodFxuICAgICAgICB9LCB2aWV3cG9ydC5nZXRNZXJjYXRvclBhcmFtcygpKTtcblxuICAgICAgICBjb25zdCBjbG9uZSA9IGNsb25lRWxlbWVudChjaGlsZCwgbmV3UHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIGxlZnQ6IHZpZXdwb3J0LngsXG4gICAgICAgICAgdG9wOiB2aWV3cG9ydC55LFxuICAgICAgICAgIHdpZHRoOiB2aWV3cG9ydC53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodFxuICAgICAgICB9O1xuXG4gICAgICAgIGNoaWxkID0gY3JlYXRlRWxlbWVudCgnZGl2Jywge2tleTogYHZpZXdwb3J0LWNvbXBvbmVudC0ke2l9YCwgc3R5bGV9LCBjbG9uZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0eWxlID0ge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAwLCB0b3A6IDB9O1xuICAgIGNoaWxkcmVuLnB1c2goY3JlYXRlRWxlbWVudCgnZGl2Jywge2tleTogJ2NoaWxkcmVuJywgc3R5bGV9LCBsYXN0RWxlbWVudCkpO1xuXG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vIFJlbmRlciB0aGUgYmFja2dyb3VuZCBlbGVtZW50cyAodHlwaWNhbGx5IHJlYWN0LW1hcC1nbCBpbnN0YW5jZXMpXG4gICAgLy8gdXNpbmcgdGhlIHZpZXdwb3J0IGRlc2NyaXB0b3JzXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9yZW5kZXJDaGlsZHJlblVuZGVyVmlld3BvcnRzKCk7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHt9LCBjaGlsZHJlbik7XG4gIH1cbn1cbiJdfQ==