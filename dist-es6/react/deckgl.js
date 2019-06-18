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

import React, { createElement, cloneElement } from 'react';
import autobind from './utils/autobind';
import { experimental } from '../core';
var DeckGLJS = experimental.DeckGLJS,
    log = experimental.log;

var DeckGL = function (_React$Component) {
  _inherits(DeckGL, _React$Component);

  function DeckGL(props) {
    _classCallCheck(this, DeckGL);

    var _this = _possibleConstructorReturn(this, (DeckGL.__proto__ || Object.getPrototypeOf(DeckGL)).call(this, props));

    _this.state = {};
    autobind(_this);
    return _this;
  }

  _createClass(DeckGL, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.deck = new DeckGLJS(Object.assign({}, this.props, { canvas: this.refs.overlay }));
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.deck) {
        this.deck.setProps(nextProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.deck.finalize();
    }

    // Public API

  }, {
    key: 'queryObject',
    value: function queryObject(opts) {
      log.deprecated('queryObject', 'pickObject');
      return this.deck.pickObject(opts);
    }
  }, {
    key: 'pickObject',
    value: function pickObject(_ref) {
      var x = _ref.x,
          y = _ref.y,
          _ref$radius = _ref.radius,
          radius = _ref$radius === undefined ? 0 : _ref$radius,
          _ref$layerIds = _ref.layerIds,
          layerIds = _ref$layerIds === undefined ? null : _ref$layerIds;

      return this.deck.pickObject({ x: x, y: y, radius: radius, layerIds: layerIds });
    }
  }, {
    key: 'queryVisibleObjects',
    value: function queryVisibleObjects(opts) {
      log.deprecated('queryVisibleObjects', 'pickObjects');
      return this.pickObjects(opts);
    }
  }, {
    key: 'pickObjects',
    value: function pickObjects(_ref2) {
      var x = _ref2.x,
          y = _ref2.y,
          _ref2$width = _ref2.width,
          width = _ref2$width === undefined ? 1 : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === undefined ? 1 : _ref2$height,
          _ref2$layerIds = _ref2.layerIds,
          layerIds = _ref2$layerIds === undefined ? null : _ref2$layerIds;

      return this.deck.pickObjects({ x: x, y: y, width: width, height: height, layerIds: layerIds });
    }

    // Private Helpers

    // Iterate over viewport descriptors and render children associate with viewports
    // at the specified positions
    // TODO - Can we supply a similar function for the non-React case?

  }, {
    key: '_renderChildrenUnderViewports',
    value: function _renderChildrenUnderViewports() {
      var _this2 = this;

      // Flatten out nested viewports array
      var viewports = this.deck ? this.deck.getViewports() : [];

      // Build a viewport id to viewport index
      var viewportMap = {};
      viewports.forEach(function (viewport) {
        if (viewport.id) {
          viewportMap[viewport.id] = viewport;
        }
      });

      return React.Children.toArray(this.props.children).map(
      // If child specifies props.viewportId, position under viewport, otherwise render as normal
      function (child, i) {
        return child.props.viewportId ? _this2._positionChild({ child: child, viewportMap: viewportMap, i: i }) : child;
      });
    }
  }, {
    key: '_positionChild',
    value: function _positionChild(_ref3) {
      var child = _ref3.child,
          viewportMap = _ref3.viewportMap,
          i = _ref3.i;
      var viewportId = child.props.viewportId;

      var viewport = viewportId && viewportMap[viewportId];

      // Drop (aut-hide) elements with viewportId that are not matched by any current viewport
      if (!viewport) {
        return null;
      }

      // Resolve potentially relative dimensions using the deck.gl container size
      var x = viewport.x,
          y = viewport.y,
          width = viewport.width,
          height = viewport.height;

      // Clone the element with width and height set per viewport

      var newProps = Object.assign({}, child.props, { width: width, height: height });

      // Inject map properties
      // TODO - this is too react-map-gl specific
      Object.assign(newProps, viewport.getMercatorParams(), {
        visible: viewport.isMapSynched()
      });

      var clone = cloneElement(child, newProps);

      // Wrap it in an absolutely positioning div
      var style = { position: 'absolute', left: x, top: y, width: width, height: height };
      var key = 'viewport-child-' + viewportId + '-' + i;
      return createElement('div', { key: key, id: key, style: style }, clone);
    }
  }, {
    key: 'render',
    value: function render() {
      // Render the background elements (typically react-map-gl instances)
      // using the viewport descriptors
      var children = this._renderChildrenUnderViewports();

      // Render deck.gl as last child
      var _props = this.props,
          id = _props.id,
          width = _props.width,
          height = _props.height,
          style = _props.style;

      var deck = createElement('canvas', {
        ref: 'overlay',
        key: 'overlay',
        id: id,
        style: Object.assign({}, style, { position: 'absolute', left: 0, top: 0, width: width, height: height })
      });
      children.push(deck);

      return createElement('div', { id: 'deckgl-wrapper' }, children);
    }
  }]);

  return DeckGL;
}(React.Component);

export default DeckGL;


DeckGL.propTypes = DeckGLJS.propTypes;
DeckGL.defaultProps = DeckGLJS.defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdC9kZWNrZ2wuanMiXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiY2xvbmVFbGVtZW50IiwiYXV0b2JpbmQiLCJleHBlcmltZW50YWwiLCJEZWNrR0xKUyIsImxvZyIsIkRlY2tHTCIsInByb3BzIiwic3RhdGUiLCJkZWNrIiwiT2JqZWN0IiwiYXNzaWduIiwiY2FudmFzIiwicmVmcyIsIm92ZXJsYXkiLCJuZXh0UHJvcHMiLCJzZXRQcm9wcyIsImZpbmFsaXplIiwib3B0cyIsImRlcHJlY2F0ZWQiLCJwaWNrT2JqZWN0IiwieCIsInkiLCJyYWRpdXMiLCJsYXllcklkcyIsInBpY2tPYmplY3RzIiwid2lkdGgiLCJoZWlnaHQiLCJ2aWV3cG9ydHMiLCJnZXRWaWV3cG9ydHMiLCJ2aWV3cG9ydE1hcCIsImZvckVhY2giLCJ2aWV3cG9ydCIsImlkIiwiQ2hpbGRyZW4iLCJ0b0FycmF5IiwiY2hpbGRyZW4iLCJtYXAiLCJjaGlsZCIsImkiLCJ2aWV3cG9ydElkIiwiX3Bvc2l0aW9uQ2hpbGQiLCJuZXdQcm9wcyIsImdldE1lcmNhdG9yUGFyYW1zIiwidmlzaWJsZSIsImlzTWFwU3luY2hlZCIsImNsb25lIiwic3R5bGUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJrZXkiLCJfcmVuZGVyQ2hpbGRyZW5VbmRlclZpZXdwb3J0cyIsInJlZiIsInB1c2giLCJDb21wb25lbnQiLCJwcm9wVHlwZXMiLCJkZWZhdWx0UHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBUCxJQUFlQyxhQUFmLEVBQThCQyxZQUE5QixRQUFpRCxPQUFqRDtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsa0JBQXJCO0FBQ0EsU0FBUUMsWUFBUixRQUEyQixT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Q0FBUDtBQUNEOzs7NkJBRVE7QUFDUDtBQUNBO0FBQ0EsVUFBTVYsV0FBVyxLQUFLZ0IsNkJBQUwsRUFBakI7O0FBRUE7QUFMTyxtQkFNNEIsS0FBSzdDLEtBTmpDO0FBQUEsVUFNQTBCLEVBTkEsVUFNQUEsRUFOQTtBQUFBLFVBTUlQLEtBTkosVUFNSUEsS0FOSjtBQUFBLFVBTVdDLE1BTlgsVUFNV0EsTUFOWDtBQUFBLFVBTW1Cb0IsS0FObkIsVUFNbUJBLEtBTm5COztBQU9QLFVBQU10QyxPQUFPVCxjQUFjLFFBQWQsRUFBd0I7QUFDbkNxRCxhQUFLLFNBRDhCO0FBRW5DRixhQUFLLFNBRjhCO0FBR25DbEIsY0FIbUM7QUFJbkNjLGVBQU9yQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQm9DLEtBQWxCLEVBQXlCLEVBQUNDLFVBQVUsVUFBWCxFQUF1QkMsTUFBTSxDQUE3QixFQUFnQ0MsS0FBSyxDQUFyQyxFQUF3Q3hCLFlBQXhDLEVBQStDQyxjQUEvQyxFQUF6QjtBQUo0QixPQUF4QixDQUFiO0FBTUFTLGVBQVNrQixJQUFULENBQWM3QyxJQUFkOztBQUVBLGFBQU9ULGNBQWMsS0FBZCxFQUFxQixFQUFDaUMsSUFBSSxnQkFBTCxFQUFyQixFQUE2Q0csUUFBN0MsQ0FBUDtBQUVEOzs7O0VBOUdpQ3JDLE1BQU13RCxTOztlQUFyQmpELE07OztBQWlIckJBLE9BQU9rRCxTQUFQLEdBQW1CcEQsU0FBU29ELFNBQTVCO0FBQ0FsRCxPQUFPbUQsWUFBUCxHQUFzQnJELFNBQVNxRCxZQUEvQiIsImZpbGUiOiJkZWNrZ2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlRWxlbWVudCwgY2xvbmVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi91dGlscy9hdXRvYmluZCc7XG5pbXBvcnQge2V4cGVyaW1lbnRhbH0gZnJvbSAnLi4vY29yZSc7XG5jb25zdCB7RGVja0dMSlMsIGxvZ30gPSBleHBlcmltZW50YWw7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlY2tHTCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5kZWNrID0gbmV3IERlY2tHTEpTKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtjYW52YXM6IHRoaXMucmVmcy5vdmVybGF5fSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICBpZiAodGhpcy5kZWNrKSB7XG4gICAgICB0aGlzLmRlY2suc2V0UHJvcHMobmV4dFByb3BzKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLmRlY2suZmluYWxpemUoKTtcbiAgfVxuXG4gIC8vIFB1YmxpYyBBUElcblxuICBxdWVyeU9iamVjdChvcHRzKSB7XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ3F1ZXJ5T2JqZWN0JywgJ3BpY2tPYmplY3QnKTtcbiAgICByZXR1cm4gdGhpcy5kZWNrLnBpY2tPYmplY3Qob3B0cyk7XG4gIH1cblxuICBwaWNrT2JqZWN0KHt4LCB5LCByYWRpdXMgPSAwLCBsYXllcklkcyA9IG51bGx9KSB7XG4gICAgcmV0dXJuIHRoaXMuZGVjay5waWNrT2JqZWN0KHt4LCB5LCByYWRpdXMsIGxheWVySWRzfSk7XG4gIH1cblxuICBxdWVyeVZpc2libGVPYmplY3RzKG9wdHMpIHtcbiAgICBsb2cuZGVwcmVjYXRlZCgncXVlcnlWaXNpYmxlT2JqZWN0cycsICdwaWNrT2JqZWN0cycpO1xuICAgIHJldHVybiB0aGlzLnBpY2tPYmplY3RzKG9wdHMpO1xuICB9XG5cbiAgcGlja09iamVjdHMoe3gsIHksIHdpZHRoID0gMSwgaGVpZ2h0ID0gMSwgbGF5ZXJJZHMgPSBudWxsfSkge1xuICAgIHJldHVybiB0aGlzLmRlY2sucGlja09iamVjdHMoe3gsIHksIHdpZHRoLCBoZWlnaHQsIGxheWVySWRzfSk7XG4gIH1cblxuICAvLyBQcml2YXRlIEhlbHBlcnNcblxuICAvLyBJdGVyYXRlIG92ZXIgdmlld3BvcnQgZGVzY3JpcHRvcnMgYW5kIHJlbmRlciBjaGlsZHJlbiBhc3NvY2lhdGUgd2l0aCB2aWV3cG9ydHNcbiAgLy8gYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbnNcbiAgLy8gVE9ETyAtIENhbiB3ZSBzdXBwbHkgYSBzaW1pbGFyIGZ1bmN0aW9uIGZvciB0aGUgbm9uLVJlYWN0IGNhc2U/XG4gIF9yZW5kZXJDaGlsZHJlblVuZGVyVmlld3BvcnRzKCkge1xuICAgIC8vIEZsYXR0ZW4gb3V0IG5lc3RlZCB2aWV3cG9ydHMgYXJyYXlcbiAgICBjb25zdCB2aWV3cG9ydHMgPSB0aGlzLmRlY2sgPyB0aGlzLmRlY2suZ2V0Vmlld3BvcnRzKCkgOiBbXTtcblxuICAgIC8vIEJ1aWxkIGEgdmlld3BvcnQgaWQgdG8gdmlld3BvcnQgaW5kZXhcbiAgICBjb25zdCB2aWV3cG9ydE1hcCA9IHt9O1xuICAgIHZpZXdwb3J0cy5mb3JFYWNoKHZpZXdwb3J0ID0+IHtcbiAgICAgIGlmICh2aWV3cG9ydC5pZCkge1xuICAgICAgICB2aWV3cG9ydE1hcFt2aWV3cG9ydC5pZF0gPSB2aWV3cG9ydDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBSZWFjdC5DaGlsZHJlbi50b0FycmF5KHRoaXMucHJvcHMuY2hpbGRyZW4pLm1hcChcbiAgICAgIC8vIElmIGNoaWxkIHNwZWNpZmllcyBwcm9wcy52aWV3cG9ydElkLCBwb3NpdGlvbiB1bmRlciB2aWV3cG9ydCwgb3RoZXJ3aXNlIHJlbmRlciBhcyBub3JtYWxcbiAgICAgIChjaGlsZCwgaSkgPT4gY2hpbGQucHJvcHMudmlld3BvcnRJZCA/IHRoaXMuX3Bvc2l0aW9uQ2hpbGQoe2NoaWxkLCB2aWV3cG9ydE1hcCwgaX0pIDogY2hpbGQpO1xuICB9XG5cbiAgX3Bvc2l0aW9uQ2hpbGQoe2NoaWxkLCB2aWV3cG9ydE1hcCwgaX0pIHtcbiAgICBjb25zdCB7dmlld3BvcnRJZH0gPSBjaGlsZC5wcm9wcztcbiAgICBjb25zdCB2aWV3cG9ydCA9IHZpZXdwb3J0SWQgJiYgdmlld3BvcnRNYXBbdmlld3BvcnRJZF07XG5cbiAgICAvLyBEcm9wIChhdXQtaGlkZSkgZWxlbWVudHMgd2l0aCB2aWV3cG9ydElkIHRoYXQgYXJlIG5vdCBtYXRjaGVkIGJ5IGFueSBjdXJyZW50IHZpZXdwb3J0XG4gICAgaWYgKCF2aWV3cG9ydCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVzb2x2ZSBwb3RlbnRpYWxseSByZWxhdGl2ZSBkaW1lbnNpb25zIHVzaW5nIHRoZSBkZWNrLmdsIGNvbnRhaW5lciBzaXplXG4gICAgY29uc3Qge3gsIHksIHdpZHRoLCBoZWlnaHR9ID0gdmlld3BvcnQ7XG5cbiAgICAvLyBDbG9uZSB0aGUgZWxlbWVudCB3aXRoIHdpZHRoIGFuZCBoZWlnaHQgc2V0IHBlciB2aWV3cG9ydFxuICAgIGNvbnN0IG5ld1Byb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgY2hpbGQucHJvcHMsIHt3aWR0aCwgaGVpZ2h0fSk7XG5cbiAgICAvLyBJbmplY3QgbWFwIHByb3BlcnRpZXNcbiAgICAvLyBUT0RPIC0gdGhpcyBpcyB0b28gcmVhY3QtbWFwLWdsIHNwZWNpZmljXG4gICAgT2JqZWN0LmFzc2lnbihuZXdQcm9wcywgdmlld3BvcnQuZ2V0TWVyY2F0b3JQYXJhbXMoKSwge1xuICAgICAgdmlzaWJsZTogdmlld3BvcnQuaXNNYXBTeW5jaGVkKClcbiAgICB9KTtcblxuICAgIGNvbnN0IGNsb25lID0gY2xvbmVFbGVtZW50KGNoaWxkLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBXcmFwIGl0IGluIGFuIGFic29sdXRlbHkgcG9zaXRpb25pbmcgZGl2XG4gICAgY29uc3Qgc3R5bGUgPSB7cG9zaXRpb246ICdhYnNvbHV0ZScsIGxlZnQ6IHgsIHRvcDogeSwgd2lkdGgsIGhlaWdodH07XG4gICAgY29uc3Qga2V5ID0gYHZpZXdwb3J0LWNoaWxkLSR7dmlld3BvcnRJZH0tJHtpfWA7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXksIGlkOiBrZXksIHN0eWxlfSwgY2xvbmUpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vIFJlbmRlciB0aGUgYmFja2dyb3VuZCBlbGVtZW50cyAodHlwaWNhbGx5IHJlYWN0LW1hcC1nbCBpbnN0YW5jZXMpXG4gICAgLy8gdXNpbmcgdGhlIHZpZXdwb3J0IGRlc2NyaXB0b3JzXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9yZW5kZXJDaGlsZHJlblVuZGVyVmlld3BvcnRzKCk7XG5cbiAgICAvLyBSZW5kZXIgZGVjay5nbCBhcyBsYXN0IGNoaWxkXG4gICAgY29uc3Qge2lkLCB3aWR0aCwgaGVpZ2h0LCBzdHlsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGRlY2sgPSBjcmVhdGVFbGVtZW50KCdjYW52YXMnLCB7XG4gICAgICByZWY6ICdvdmVybGF5JyxcbiAgICAgIGtleTogJ292ZXJsYXknLFxuICAgICAgaWQsXG4gICAgICBzdHlsZTogT2JqZWN0LmFzc2lnbih7fSwgc3R5bGUsIHtwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogMCwgdG9wOiAwLCB3aWR0aCwgaGVpZ2h0fSlcbiAgICB9KTtcbiAgICBjaGlsZHJlbi5wdXNoKGRlY2spO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtpZDogJ2RlY2tnbC13cmFwcGVyJ30sIGNoaWxkcmVuKTtcblxuICB9XG59XG5cbkRlY2tHTC5wcm9wVHlwZXMgPSBEZWNrR0xKUy5wcm9wVHlwZXM7XG5EZWNrR0wuZGVmYXVsdFByb3BzID0gRGVja0dMSlMuZGVmYXVsdFByb3BzO1xuIl19