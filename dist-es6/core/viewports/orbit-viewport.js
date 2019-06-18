var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import Viewport from './viewport';

import { createMat4, transformVector } from '../utils/math-utils';

import mat4_multiply from 'gl-mat4/multiply';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_scale from 'gl-mat4/scale';
import mat4_perspective from 'gl-mat4/perspective';
import mat4_translate from 'gl-mat4/translate';
import mat4_rotateX from 'gl-mat4/rotateX';
import mat4_rotateY from 'gl-mat4/rotateY';
import mat4_rotateZ from 'gl-mat4/rotateZ';

var DEGREES_TO_RADIANS = Math.PI / 180;

/*
 * A deck.gl Viewport class used by OrbitController
 * Adds zoom and pixel translation on top of the PerspectiveViewport
 */

var OrbitViewport = function (_Viewport) {
  _inherits(OrbitViewport, _Viewport);

  function OrbitViewport(_ref) {
    var _ref$id = _ref.id,
        id = _ref$id === undefined ? 'orbit-viewport' : _ref$id,
        width = _ref.width,
        height = _ref.height,
        distance = _ref.distance,
        _ref$rotationX = _ref.rotationX,
        rotationX = _ref$rotationX === undefined ? 0 : _ref$rotationX,
        _ref$rotationOrbit = _ref.rotationOrbit,
        rotationOrbit = _ref$rotationOrbit === undefined ? 0 : _ref$rotationOrbit,
        _ref$orbitAxis = _ref.orbitAxis,
        orbitAxis = _ref$orbitAxis === undefined ? 'Z' : _ref$orbitAxis,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$fov = _ref.fov,
        fov = _ref$fov === undefined ? 75 : _ref$fov,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        _ref$zoom = _ref.zoom,
        zoom = _ref$zoom === undefined ? 1 : _ref$zoom;

    _classCallCheck(this, OrbitViewport);

    var rotationMatrix = mat4_rotateX([], createMat4(), -rotationX / 180 * Math.PI);
    if (orbitAxis === 'Z') {
      mat4_rotateZ(rotationMatrix, rotationMatrix, -rotationOrbit / 180 * Math.PI);
    } else {
      mat4_rotateY(rotationMatrix, rotationMatrix, -rotationOrbit / 180 * Math.PI);
    }

    var translateMatrix = createMat4();
    mat4_scale(translateMatrix, translateMatrix, [zoom, zoom, zoom]);
    mat4_translate(translateMatrix, translateMatrix, [-lookAt[0], -lookAt[1], -lookAt[2]]);

    var viewMatrix = mat4_lookAt([], [0, 0, distance], [0, 0, 0], up);
    var fovRadians = fov * DEGREES_TO_RADIANS;
    var aspect = width / height;
    var perspectiveMatrix = mat4_perspective([], fovRadians, aspect, near, far);

    var _this = _possibleConstructorReturn(this, (OrbitViewport.__proto__ || Object.getPrototypeOf(OrbitViewport)).call(this, {
      id: id,
      viewMatrix: mat4_multiply(viewMatrix, viewMatrix, mat4_multiply(rotationMatrix, rotationMatrix, translateMatrix)),
      projectionMatrix: perspectiveMatrix,
      width: width,
      height: height
    }));

    _this.width = width;
    _this.height = height;
    _this.distance = distance;
    _this.rotationX = rotationX;
    _this.rotationOrbit = rotationOrbit;
    _this.orbitAxis = orbitAxis;
    _this.lookAt = lookAt;
    _this.up = up;
    _this.fov = fov;
    _this.near = near;
    _this.far = far;
    _this.zoom = zoom;
    return _this;
  }

  _createClass(OrbitViewport, [{
    key: 'project',
    value: function project(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === undefined ? false : _ref2$topLeft;

      var v = transformVector(this.pixelProjectionMatrix, [].concat(_toConsumableArray(xyz), [1]));

      var _v = _slicedToArray(v, 3),
          x = _v[0],
          y = _v[1],
          z = _v[2];

      var y2 = topLeft ? this.height - y : y;
      return [x, y2, z];
    }
  }, {
    key: 'unproject',
    value: function unproject(xyz) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$topLeft = _ref3.topLeft,
          topLeft = _ref3$topLeft === undefined ? false : _ref3$topLeft;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? this.height - y : y;

      return transformVector(this.pixelUnprojectionMatrix, [x, y2, z, 1]);
    }

    /** Move camera to make a model bounding box centered at lookat position fit in the viewport.
     * @param {Array} sizes - [sizeX, sizeY, sizeZ]], define the dimensions of bounding box
     * @returns a new OrbitViewport object
     */

  }, {
    key: 'fitBounds',
    value: function fitBounds(sizes) {
      var width = this.width,
          height = this.height,
          rotationX = this.rotationX,
          rotationOrbit = this.rotationOrbit,
          orbitAxis = this.orbitAxis,
          lookAt = this.lookAt,
          up = this.up,
          fov = this.fov,
          near = this.near,
          far = this.far,
          zoom = this.zoom;

      var size = Math.max(sizes[0], sizes[1], sizes[2]) / 2;
      var newDistance = size / Math.tan(fov / 180 * Math.PI / 2);

      return new OrbitViewport({
        width: width,
        height: height,
        rotationX: rotationX,
        rotationOrbit: rotationOrbit,
        orbitAxis: orbitAxis,
        up: up,
        fov: fov,
        near: near,
        far: far,
        zoom: zoom,
        lookAt: lookAt,
        distance: newDistance
      });
    }
  }]);

  return OrbitViewport;
}(Viewport);

export default OrbitViewport;


OrbitViewport.displayName = 'OrbitViewport';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy9vcmJpdC12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydCIsImNyZWF0ZU1hdDQiLCJ0cmFuc2Zvcm1WZWN0b3IiLCJtYXQ0X211bHRpcGx5IiwibWF0NF9sb29rQXQiLCJtYXQ0X3NjYWxlIiwibWF0NF9wZXJzcGVjdGl2ZSIsIm1hdDRfdHJhbnNsYXRlIiwibWF0NF9yb3RhdGVYIiwibWF0NF9yb3RhdGVZIiwibWF0NF9yb3RhdGVaIiwiREVHUkVFU19UT19SQURJQU5TIiwiTWF0aCIsIlBJIiwiT3JiaXRWaWV3cG9ydCIsImlkIiwid2lkdGgiLCJoZWlnaHQiLCJkaXN0YW5jZSIsInJvdGF0aW9uWCIsInJvdGF0aW9uT3JiaXQiLCJvcmJpdEF4aXMiLCJsb29rQXQiLCJ1cCIsImZvdiIsIm5lYXIiLCJmYXIiLCJ6b29tIiwicm90YXRpb25NYXRyaXgiLCJ0cmFuc2xhdGVNYXRyaXgiLCJ2aWV3TWF0cml4IiwiZm92UmFkaWFucyIsImFzcGVjdCIsInBlcnNwZWN0aXZlTWF0cml4IiwicHJvamVjdGlvbk1hdHJpeCIsInh5eiIsInRvcExlZnQiLCJ2IiwicGl4ZWxQcm9qZWN0aW9uTWF0cml4IiwieCIsInkiLCJ6IiwieTIiLCJwaXhlbFVucHJvamVjdGlvbk1hdHJpeCIsInNpemVzIiwic2l6ZSIsIm1heCIsIm5ld0Rpc3RhbmNlIiwidGFuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU9BLFFBQVAsTUFBcUIsWUFBckI7O0FBRUEsU0FBUUMsVUFBUixFQUFvQkMsZUFBcEIsUUFBMEMscUJBQTFDOztBQUVBLE9BQU9DLGFBQVAsTUFBMEIsa0JBQTFCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxVQUFQLE1BQXVCLGVBQXZCO0FBQ0EsT0FBT0MsZ0JBQVAsTUFBNkIscUJBQTdCO0FBQ0EsT0FBT0MsY0FBUCxNQUEyQixtQkFB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UDtBQWNEOzs7O0VBNUd3Qy9DLFE7O2VBQXRCYyxhOzs7QUErR3JCQSxjQUFjbUMsV0FBZCxHQUE0QixlQUE1QiIsImZpbGUiOiJvcmJpdC12aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0JztcblxuaW1wb3J0IHtjcmVhdGVNYXQ0LCB0cmFuc2Zvcm1WZWN0b3J9IGZyb20gJy4uL3V0aWxzL21hdGgtdXRpbHMnO1xuXG5pbXBvcnQgbWF0NF9tdWx0aXBseSBmcm9tICdnbC1tYXQ0L211bHRpcGx5JztcbmltcG9ydCBtYXQ0X2xvb2tBdCBmcm9tICdnbC1tYXQ0L2xvb2tBdCc7XG5pbXBvcnQgbWF0NF9zY2FsZSBmcm9tICdnbC1tYXQ0L3NjYWxlJztcbmltcG9ydCBtYXQ0X3BlcnNwZWN0aXZlIGZyb20gJ2dsLW1hdDQvcGVyc3BlY3RpdmUnO1xuaW1wb3J0IG1hdDRfdHJhbnNsYXRlIGZyb20gJ2dsLW1hdDQvdHJhbnNsYXRlJztcbmltcG9ydCBtYXQ0X3JvdGF0ZVggZnJvbSAnZ2wtbWF0NC9yb3RhdGVYJztcbmltcG9ydCBtYXQ0X3JvdGF0ZVkgZnJvbSAnZ2wtbWF0NC9yb3RhdGVZJztcbmltcG9ydCBtYXQ0X3JvdGF0ZVogZnJvbSAnZ2wtbWF0NC9yb3RhdGVaJztcblxuY29uc3QgREVHUkVFU19UT19SQURJQU5TID0gTWF0aC5QSSAvIDE4MDtcblxuLypcbiAqIEEgZGVjay5nbCBWaWV3cG9ydCBjbGFzcyB1c2VkIGJ5IE9yYml0Q29udHJvbGxlclxuICogQWRkcyB6b29tIGFuZCBwaXhlbCB0cmFuc2xhdGlvbiBvbiB0b3Agb2YgdGhlIFBlcnNwZWN0aXZlVmlld3BvcnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXRWaWV3cG9ydCBleHRlbmRzIFZpZXdwb3J0IHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGlkID0gJ29yYml0LXZpZXdwb3J0JyxcbiAgICAvLyB2aWV3cG9ydCBhcmd1bWVudHNcbiAgICB3aWR0aCwgLy8gV2lkdGggb2Ygdmlld3BvcnRcbiAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuICAgIC8vIHZpZXcgbWF0cml4IGFyZ3VtZW50c1xuICAgIGRpc3RhbmNlLCAvLyBGcm9tIGV5ZSBwb3NpdGlvbiB0byBsb29rQXRcbiAgICByb3RhdGlvblggPSAwLCAvLyBSb3RhdGluZyBhbmdsZSBhcm91bmQgWCBheGlzXG4gICAgcm90YXRpb25PcmJpdCA9IDAsIC8vIFJvdGF0aW5nIGFuZ2xlIGFyb3VuZCBvcmJpdCBheGlzXG4gICAgb3JiaXRBeGlzID0gJ1onLCAvLyBPcmJpdCBheGlzIHdpdGggMzYwIGRlZ3JlZXMgcm90YXRpbmcgZnJlZWRvbSwgY2FuIG9ubHkgYmUgJ1knIG9yICdaJ1xuICAgIGxvb2tBdCA9IFswLCAwLCAwXSwgLy8gV2hpY2ggcG9pbnQgaXMgY2FtZXJhIGxvb2tpbmcgYXQsIGRlZmF1bHQgb3JpZ2luXG4gICAgdXAgPSBbMCwgMSwgMF0sIC8vIERlZmluZXMgdXAgZGlyZWN0aW9uLCBkZWZhdWx0IHBvc2l0aXZlIHkgYXhpc1xuICAgIC8vIHByb2plY3Rpb24gbWF0cml4IGFyZ3VtZW50c1xuICAgIGZvdiA9IDc1LCAvLyBGaWVsZCBvZiB2aWV3IGNvdmVyZWQgYnkgY2FtZXJhXG4gICAgbmVhciA9IDEsIC8vIERpc3RhbmNlIG9mIG5lYXIgY2xpcHBpbmcgcGxhbmVcbiAgICBmYXIgPSAxMDAsIC8vIERpc3RhbmNlIG9mIGZhciBjbGlwcGluZyBwbGFuZVxuICAgIHpvb20gPSAxXG4gIH0pIHtcbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IG1hdDRfcm90YXRlWChbXSwgY3JlYXRlTWF0NCgpLCAtcm90YXRpb25YIC8gMTgwICogTWF0aC5QSSk7XG4gICAgaWYgKG9yYml0QXhpcyA9PT0gJ1onKSB7XG4gICAgICBtYXQ0X3JvdGF0ZVoocm90YXRpb25NYXRyaXgsIHJvdGF0aW9uTWF0cml4LCAtcm90YXRpb25PcmJpdCAvIDE4MCAqIE1hdGguUEkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXQ0X3JvdGF0ZVkocm90YXRpb25NYXRyaXgsIHJvdGF0aW9uTWF0cml4LCAtcm90YXRpb25PcmJpdCAvIDE4MCAqIE1hdGguUEkpO1xuICAgIH1cblxuICAgIGNvbnN0IHRyYW5zbGF0ZU1hdHJpeCA9IGNyZWF0ZU1hdDQoKTtcbiAgICBtYXQ0X3NjYWxlKHRyYW5zbGF0ZU1hdHJpeCwgdHJhbnNsYXRlTWF0cml4LCBbem9vbSwgem9vbSwgem9vbV0pO1xuICAgIG1hdDRfdHJhbnNsYXRlKHRyYW5zbGF0ZU1hdHJpeCwgdHJhbnNsYXRlTWF0cml4LCBbLWxvb2tBdFswXSwgLWxvb2tBdFsxXSwgLWxvb2tBdFsyXV0pO1xuXG4gICAgY29uc3Qgdmlld01hdHJpeCA9IG1hdDRfbG9va0F0KFtdLCBbMCwgMCwgZGlzdGFuY2VdLCBbMCwgMCwgMF0sIHVwKTtcbiAgICBjb25zdCBmb3ZSYWRpYW5zID0gZm92ICogREVHUkVFU19UT19SQURJQU5TO1xuICAgIGNvbnN0IGFzcGVjdCA9IHdpZHRoIC8gaGVpZ2h0O1xuICAgIGNvbnN0IHBlcnNwZWN0aXZlTWF0cml4ID0gbWF0NF9wZXJzcGVjdGl2ZShbXSwgZm92UmFkaWFucywgYXNwZWN0LCBuZWFyLCBmYXIpO1xuXG4gICAgc3VwZXIoe1xuICAgICAgaWQsXG4gICAgICB2aWV3TWF0cml4OiBtYXQ0X211bHRpcGx5KHZpZXdNYXRyaXgsIHZpZXdNYXRyaXgsXG4gICAgICAgIG1hdDRfbXVsdGlwbHkocm90YXRpb25NYXRyaXgsIHJvdGF0aW9uTWF0cml4LCB0cmFuc2xhdGVNYXRyaXgpKSxcbiAgICAgIHByb2plY3Rpb25NYXRyaXg6IHBlcnNwZWN0aXZlTWF0cml4LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KTtcblxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdGhpcy5yb3RhdGlvblggPSByb3RhdGlvblg7XG4gICAgdGhpcy5yb3RhdGlvbk9yYml0ID0gcm90YXRpb25PcmJpdDtcbiAgICB0aGlzLm9yYml0QXhpcyA9IG9yYml0QXhpcztcbiAgICB0aGlzLmxvb2tBdCA9IGxvb2tBdDtcbiAgICB0aGlzLnVwID0gdXA7XG4gICAgdGhpcy5mb3YgPSBmb3Y7XG4gICAgdGhpcy5uZWFyID0gbmVhcjtcbiAgICB0aGlzLmZhciA9IGZhcjtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICB9XG5cbiAgcHJvamVjdCh4eXosIHt0b3BMZWZ0ID0gZmFsc2V9ID0ge30pIHtcbiAgICBjb25zdCB2ID0gdHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4LCBbLi4ueHl6LCAxXSk7XG5cbiAgICBjb25zdCBbeCwgeSwgel0gPSB2O1xuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHRoaXMuaGVpZ2h0IC0geSA6IHk7XG4gICAgcmV0dXJuIFt4LCB5Miwgel07XG4gIH1cblxuICB1bnByb2plY3QoeHl6LCB7dG9wTGVmdCA9IGZhbHNlfSA9IHt9KSB7XG4gICAgY29uc3QgW3gsIHksIHpdID0geHl6O1xuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHRoaXMuaGVpZ2h0IC0geSA6IHk7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsIFt4LCB5MiwgeiwgMV0pO1xuICB9XG5cbiAgLyoqIE1vdmUgY2FtZXJhIHRvIG1ha2UgYSBtb2RlbCBib3VuZGluZyBib3ggY2VudGVyZWQgYXQgbG9va2F0IHBvc2l0aW9uIGZpdCBpbiB0aGUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB7QXJyYXl9IHNpemVzIC0gW3NpemVYLCBzaXplWSwgc2l6ZVpdXSwgZGVmaW5lIHRoZSBkaW1lbnNpb25zIG9mIGJvdW5kaW5nIGJveFxuICAgKiBAcmV0dXJucyBhIG5ldyBPcmJpdFZpZXdwb3J0IG9iamVjdFxuICAgKi9cbiAgZml0Qm91bmRzKHNpemVzKSB7XG4gICAgY29uc3Qge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICByb3RhdGlvblgsXG4gICAgICByb3RhdGlvbk9yYml0LFxuICAgICAgb3JiaXRBeGlzLFxuICAgICAgbG9va0F0LFxuICAgICAgdXAsXG4gICAgICBmb3YsXG4gICAgICBuZWFyLFxuICAgICAgZmFyLFxuICAgICAgem9vbVxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heChzaXplc1swXSwgc2l6ZXNbMV0sIHNpemVzWzJdKSAvIDI7XG4gICAgY29uc3QgbmV3RGlzdGFuY2UgPSBzaXplIC8gTWF0aC50YW4oZm92IC8gMTgwICogTWF0aC5QSSAvIDIpO1xuXG4gICAgcmV0dXJuIG5ldyBPcmJpdFZpZXdwb3J0KHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcm90YXRpb25YLFxuICAgICAgcm90YXRpb25PcmJpdCxcbiAgICAgIG9yYml0QXhpcyxcbiAgICAgIHVwLFxuICAgICAgZm92LFxuICAgICAgbmVhcixcbiAgICAgIGZhcixcbiAgICAgIHpvb20sXG4gICAgICBsb29rQXQsXG4gICAgICBkaXN0YW5jZTogbmV3RGlzdGFuY2VcbiAgICB9KTtcbiAgfVxufVxuXG5PcmJpdFZpZXdwb3J0LmRpc3BsYXlOYW1lID0gJ09yYml0Vmlld3BvcnQnO1xuXG4iXX0=