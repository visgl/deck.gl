var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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

import { COORDINATE_SYSTEM, Layer, experimental } from '../../core';
var fp64ify = experimental.fp64ify,
    enable64bitSupport = experimental.enable64bitSupport;

import { GL, Model, Geometry } from 'luma.gl';

import vs from './path-layer-vertex.glsl';
import vs64 from './path-layer-vertex-64.glsl';
import fs from './path-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  widthScale: 1, // stroke width in meters
  widthMinPixels: 0, //  min stroke width in pixels
  widthMaxPixels: Number.MAX_SAFE_INTEGER, // max stroke width in pixels
  rounded: false,
  miterLimit: 4,
  fp64: false,
  dashJustified: false,

  getPath: function getPath(object) {
    return object.path;
  },
  getColor: function getColor(object) {
    return object.color || DEFAULT_COLOR;
  },
  getWidth: function getWidth(object) {
    return object.width || 1;
  },
  getDashArray: null
};

var isClosed = function isClosed(path) {
  var firstPoint = path[0];
  var lastPoint = path[path.length - 1];
  return firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1] && firstPoint[2] === lastPoint[2];
};

var PathLayer = function (_Layer) {
  _inherits(PathLayer, _Layer);

  function PathLayer() {
    _classCallCheck(this, PathLayer);

    return _possibleConstructorReturn(this, (PathLayer.__proto__ || Object.getPrototypeOf(PathLayer)).apply(this, arguments));
  }

  _createClass(PathLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'picking'] } : { vs: vs, fs: fs, modules: ['picking'] }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instanceStartPositions: { size: 3, update: this.calculateStartPositions },
        instanceEndPositions: { size: 3, update: this.calculateEndPositions },
        instanceLeftDeltas: { size: 3, update: this.calculateLeftDeltas },
        instanceRightDeltas: { size: 3, update: this.calculateRightDeltas },
        instanceStrokeWidths: { size: 1, accessor: 'getWidth', update: this.calculateStrokeWidths },
        instanceDashArrays: { size: 2, accessor: 'getDashArray', update: this.calculateDashArrays },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors },
        instancePickingColors: { size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors }
      });
      /* eslint-enable max-len */
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.addInstanced({
            instanceStartEndPositions64xyLow: {
              size: 4,
              update: this.calculateInstanceStartEndPositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instanceStartEndPositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      _get(PathLayer.prototype.__proto__ || Object.getPrototypeOf(PathLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

      var getPath = this.props.getPath;
      var attributeManager = this.state.attributeManager;

      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });

      var geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPath);

      if (geometryChanged) {
        // this.state.paths only stores point positions in each path
        var paths = props.data.map(getPath);
        var numInstances = paths.reduce(function (count, path) {
          return count + path.length - 1;
        }, 0);

        this.setState({ paths: paths, numInstances: numInstances });
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var _props = this.props,
          rounded = _props.rounded,
          miterLimit = _props.miterLimit,
          widthScale = _props.widthScale,
          widthMinPixels = _props.widthMinPixels,
          widthMaxPixels = _props.widthMaxPixels,
          dashJustified = _props.dashJustified;


      this.state.model.render(Object.assign({}, uniforms, {
        jointType: Number(rounded),
        alignMode: Number(dashJustified),
        widthScale: widthScale,
        miterLimit: miterLimit,
        widthMinPixels: widthMinPixels,
        widthMaxPixels: widthMaxPixels
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      /*
       *       _
       *        "-_ 1                   3                       5
       *     _     "o---------------------o-------------------_-o
       *       -   / ""--..__              '.             _.-' /
       *   _     "@- - - - - ""--..__- - - - x - - - -_.@'    /
       *    "-_  /                   ""--..__ '.  _,-` :     /
       *       "o----------------------------""-o'    :     /
       *      0,2                            4 / '.  :     /
       *                                      /   '.:     /
       *                                     /     :'.   /
       *                                    /     :  ', /
       *                                   /     :     o
       */

      var SEGMENT_INDICES = [
      // start corner
      0, 2, 1,
      // body
      1, 2, 4, 1, 4, 3,
      // end corner
      3, 4, 5];

      // [0] position on segment - 0: start, 1: end
      // [1] side of path - -1: left, 0: center, 1: right
      // [2] role - 0: offset point 1: joint point
      var SEGMENT_POSITIONS = [
      // bevel start corner
      0, 0, 1,
      // start inner corner
      0, -1, 0,
      // start outer corner
      0, 1, 0,
      // end inner corner
      1, -1, 0,
      // end outer corner
      1, 1, 0,
      // bevel end corner
      1, 0, 1];

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          attributes: {
            indices: new Uint16Array(SEGMENT_INDICES),
            positions: new Float32Array(SEGMENT_POSITIONS)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateStartPositions',
    value: function calculateStartPositions(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateEndPositions',
    value: function calculateEndPositions(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateInstanceStartEndPositions64xyLow',
    value: function calculateInstanceStartEndPositions64xyLow(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var startPoint = path[ptIndex];
          var endPoint = path[ptIndex + 1];
          value[i++] = fp64ify(startPoint[0])[1];
          value[i++] = fp64ify(startPoint[1])[1];
          value[i++] = fp64ify(endPoint[0])[1];
          value[i++] = fp64ify(endPoint[1])[1];
        }
      });
    }
  }, {
    key: 'calculateLeftDeltas',
    value: function calculateLeftDeltas(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        var prevPoint = isClosed(path) ? path[path.length - 2] : path[0];

        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0] - prevPoint[0];
          value[i++] = point[1] - prevPoint[1];
          value[i++] = point[2] - prevPoint[2] || 0;
          prevPoint = point;
        }
      });
    }
  }, {
    key: 'calculateRightDeltas',
    value: function calculateRightDeltas(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          var point = path[ptIndex];
          var nextPoint = path[ptIndex + 1];
          if (!nextPoint) {
            nextPoint = isClosed(path) ? path[1] : point;
          }

          value[i++] = nextPoint[0] - point[0];
          value[i++] = nextPoint[1] - point[1];
          value[i++] = nextPoint[2] - point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateStrokeWidths',
    value: function calculateStrokeWidths(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getWidth = _props2.getWidth;
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var width = getWidth(data[index], index);
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = width;
        }
      });
    }
  }, {
    key: 'calculateDashArrays',
    value: function calculateDashArrays(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getDashArray = _props3.getDashArray;

      if (!getDashArray) {
        return;
      }

      var paths = this.state.paths;
      var value = attribute.value;

      var i = 0;
      paths.forEach(function (path, index) {
        var dashArray = getDashArray(data[index], index);
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = dashArray[0];
          value[i++] = dashArray[1];
        }
      });
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var pointColor = getColor(data[index], index);
        if (isNaN(pointColor[3])) {
          pointColor[3] = 255;
        }
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = pointColor[0];
          value[i++] = pointColor[1];
          value[i++] = pointColor[2];
          value[i++] = pointColor[3];
        }
      });
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      var _this2 = this;

      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var pickingColor = _this2.encodePickingColor(index);
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = pickingColor[0];
          value[i++] = pickingColor[1];
          value[i++] = pickingColor[2];
        }
      });
    }
  }]);

  return PathLayer;
}(Layer);

export default PathLayer;


PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9wYXRoLWxheWVyL3BhdGgtbGF5ZXIuanMiXSwibmFtZXMiOlsiQ09PUkRJTkFURV9TWVNURU0iLCJMYXllciIsImV4cGVyaW1lbnRhbCIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJ3aWR0aFNjYWxlIiwid2lkdGhNaW5QaXhlbHMiLCJ3aWR0aE1heFBpeGVscyIsIk51bWJlciIsIk1BWF9TQUZFX0lOVEVHRVIiLCJyb3VuZGVkIiwibWl0ZXJMaW1pdCIsImZwNjQiLCJkYXNoSnVzdGlmaWVkIiwiZ2V0UGF0aCIsIm9iamVjdCIsInBhdGgiLCJnZXRDb2xvciIsImNvbG9yIiwiZ2V0V2lkdGgiLCJ3aWR0aCIsImdldERhc2hBcnJheSIsImlzQ2xvc2VkIiwiZmlyc3RQb2ludCIsImxhc3RQb2ludCIsImxlbmd0aCIsIlBhdGhMYXllciIsInByb3BzIiwibW9kdWxlcyIsImdsIiwiY29udGV4dCIsInNldFN0YXRlIiwibW9kZWwiLCJfZ2V0TW9kZWwiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwic3RhdGUiLCJhZGRJbnN0YW5jZWQiLCJpbnN0YW5jZVN0YXJ0UG9zaXRpb25zIiwic2l6ZSIsInVwZGF0ZSIsImNhbGN1bGF0ZVN0YXJ0UG9zaXRpb25zIiwiaW5zdGFuY2VFbmRQb3NpdGlvbnMiLCJjYWxjdWxhdGVFbmRQb3NpdGlvbnMiLCJpbnN0YW5jZUxlZnREZWx0YXMiLCJjYWxjdWxhdGVMZWZ0RGVsdGFzIiwiaW5zdGFuY2VSaWdodERlbHRhcyIsImNhbGN1bGF0ZVJpZ2h0RGVsdGFzIiwiaW5zdGFuY2VTdHJva2VXaWR0aHMiLCJhY2Nlc3NvciIsImNhbGN1bGF0ZVN0cm9rZVdpZHRocyIsImluc3RhbmNlRGFzaEFycmF5cyIsImNhbGN1bGF0ZURhc2hBcnJheXMiLCJpbnN0YW5jZUNvbG9ycyIsInR5cGUiLCJVTlNJR05FRF9CWVRFIiwiY2FsY3VsYXRlQ29sb3JzIiwiaW5zdGFuY2VQaWNraW5nQ29sb3JzIiwiY2FsY3VsYXRlUGlja2luZ0NvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwiY29vcmRpbmF0ZVN5c3RlbSIsIkxOR0xBVCIsImluc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93IiwiY2FsY3VsYXRlSW5zdGFuY2VTdGFydEVuZFBvc2l0aW9uczY0eHlMb3ciLCJyZW1vdmUiLCJ1cGRhdGVBdHRyaWJ1dGUiLCJnZW9tZXRyeUNoYW5nZWQiLCJkYXRhQ2hhbmdlZCIsInVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCIsImFsbCIsInBhdGhzIiwiZGF0YSIsIm1hcCIsIm51bUluc3RhbmNlcyIsInJlZHVjZSIsImNvdW50IiwidW5pZm9ybXMiLCJyZW5kZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJqb2ludFR5cGUiLCJhbGlnbk1vZGUiLCJTRUdNRU5UX0lORElDRVMiLCJTRUdNRU5UX1BPU0lUSU9OUyIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRVMiLCJhdHRyaWJ1dGVzIiwiaW5kaWNlcyIsIlVpbnQxNkFycmF5IiwicG9zaXRpb25zIiwiRmxvYXQzMkFycmF5IiwiaXNJbnN0YW5jZWQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsInZhbHVlIiwiaSIsImZvckVhY2giLCJudW1TZWdtZW50cyIsInB0SW5kZXgiLCJwb2ludCIsInN0YXJ0UG9pbnQiLCJlbmRQb2ludCIsInByZXZQb2ludCIsIm5leHRQb2ludCIsImluZGV4IiwiZGFzaEFycmF5IiwicG9pbnRDb2xvciIsImlzTmFOIiwicGlja2luZ0NvbG9yIiwiZW5jb2RlUGlja2luZ0NvbG9yIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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TixJQUFhVyxXQUFXLENBQVgsQ0FBYjtBQUNBWixnQkFBTUMsR0FBTixJQUFhVyxXQUFXLENBQVgsQ0FBYjtBQUNBWixnQkFBTUMsR0FBTixJQUFhVyxXQUFXLENBQVgsQ0FBYjtBQUNEO0FBQ0YsT0FYRDtBQVlEOztBQUVEOzs7OzJDQUN1QmIsUyxFQUFXO0FBQUE7O0FBQUEsVUFDekIxQixLQUR5QixHQUNoQixLQUFLcEMsS0FEVyxDQUN6Qm9DLEtBRHlCO0FBQUEsVUFFekIyQixLQUZ5QixHQUVoQkQsU0FGZ0IsQ0FFekJDLEtBRnlCOzs7QUFJaEMsVUFBSUMsSUFBSSxDQUFSO0FBQ0E1QixZQUFNNkIsT0FBTixDQUFjLFVBQUNwRixJQUFELEVBQU80RixLQUFQLEVBQWlCO0FBQzdCLFlBQU1JLGVBQWUsT0FBS0Msa0JBQUwsQ0FBd0JMLEtBQXhCLENBQXJCO0FBQ0EsYUFBSyxJQUFJTixVQUFVLENBQW5CLEVBQXNCQSxVQUFVdEYsS0FBS1MsTUFBckMsRUFBNkM2RSxTQUE3QyxFQUF3RDtBQUN0REosZ0JBQU1DLEdBQU4sSUFBYWEsYUFBYSxDQUFiLENBQWI7QUFDQWQsZ0JBQU1DLEdBQU4sSUFBYWEsYUFBYSxDQUFiLENBQWI7QUFDQWQsZ0JBQU1DLEdBQU4sSUFBYWEsYUFBYSxDQUFiLENBQWI7QUFDRDtBQUNGLE9BUEQ7QUFRRDs7OztFQTFTb0N2SCxLOztlQUFsQmlDLFM7OztBQThTckJBLFVBQVV3RixTQUFWLEdBQXNCLFdBQXRCO0FBQ0F4RixVQUFVdEIsWUFBVixHQUF5QkEsWUFBekIiLCJmaWxlIjoicGF0aC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0NPT1JESU5BVEVfU1lTVEVNLCBMYXllciwgZXhwZXJpbWVudGFsfSBmcm9tICcuLi8uLi9jb3JlJztcbmNvbnN0IHtmcDY0aWZ5LCBlbmFibGU2NGJpdFN1cHBvcnR9ID0gZXhwZXJpbWVudGFsO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcblxuaW1wb3J0IHZzIGZyb20gJy4vcGF0aC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3BhdGgtbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vcGF0aC1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHdpZHRoU2NhbGU6IDEsIC8vIHN0cm9rZSB3aWR0aCBpbiBtZXRlcnNcbiAgd2lkdGhNaW5QaXhlbHM6IDAsIC8vICBtaW4gc3Ryb2tlIHdpZHRoIGluIHBpeGVsc1xuICB3aWR0aE1heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIC8vIG1heCBzdHJva2Ugd2lkdGggaW4gcGl4ZWxzXG4gIHJvdW5kZWQ6IGZhbHNlLFxuICBtaXRlckxpbWl0OiA0LFxuICBmcDY0OiBmYWxzZSxcbiAgZGFzaEp1c3RpZmllZDogZmFsc2UsXG5cbiAgZ2V0UGF0aDogb2JqZWN0ID0+IG9iamVjdC5wYXRoLFxuICBnZXRDb2xvcjogb2JqZWN0ID0+IG9iamVjdC5jb2xvciB8fCBERUZBVUxUX0NPTE9SLFxuICBnZXRXaWR0aDogb2JqZWN0ID0+IG9iamVjdC53aWR0aCB8fCAxLFxuICBnZXREYXNoQXJyYXk6IG51bGxcbn07XG5cbmNvbnN0IGlzQ2xvc2VkID0gcGF0aCA9PiB7XG4gIGNvbnN0IGZpcnN0UG9pbnQgPSBwYXRoWzBdO1xuICBjb25zdCBsYXN0UG9pbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gIHJldHVybiBmaXJzdFBvaW50WzBdID09PSBsYXN0UG9pbnRbMF0gJiYgZmlyc3RQb2ludFsxXSA9PT0gbGFzdFBvaW50WzFdICYmXG4gICAgZmlyc3RQb2ludFsyXSA9PT0gbGFzdFBvaW50WzJdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnLCAncGlja2luZyddfSA6XG4gICAgICB7dnMsIGZzLCBtb2R1bGVzOiBbJ3BpY2tpbmcnXX07IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlU3RhcnRQb3NpdGlvbnM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlU3RhcnRQb3NpdGlvbnN9LFxuICAgICAgaW5zdGFuY2VFbmRQb3NpdGlvbnM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlRW5kUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlTGVmdERlbHRhczoge3NpemU6IDMsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVMZWZ0RGVsdGFzfSxcbiAgICAgIGluc3RhbmNlUmlnaHREZWx0YXM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUmlnaHREZWx0YXN9LFxuICAgICAgaW5zdGFuY2VTdHJva2VXaWR0aHM6IHtzaXplOiAxLCBhY2Nlc3NvcjogJ2dldFdpZHRoJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVN0cm9rZVdpZHRoc30sXG4gICAgICBpbnN0YW5jZURhc2hBcnJheXM6IHtzaXplOiAyLCBhY2Nlc3NvcjogJ2dldERhc2hBcnJheScsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVEYXNoQXJyYXlzfSxcbiAgICAgIGluc3RhbmNlQ29sb3JzOiB7c2l6ZTogNCwgdHlwZTogR0wuVU5TSUdORURfQllURSwgYWNjZXNzb3I6ICdnZXRDb2xvcicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9LFxuICAgICAgaW5zdGFuY2VQaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgdHlwZTogR0wuVU5TSUdORURfQllURSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBpY2tpbmdDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMuY29vcmRpbmF0ZVN5c3RlbSA9PT0gQ09PUkRJTkFURV9TWVNURU0uTE5HTEFUKSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgICAgICBpbnN0YW5jZVN0YXJ0RW5kUG9zaXRpb25zNjR4eUxvdzoge1xuICAgICAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVN0YXJ0RW5kUG9zaXRpb25zNjR4eUxvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbXG4gICAgICAgICAgJ2luc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7b2xkUHJvcHMsIHByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBzdXBlci51cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuXG4gICAgY29uc3Qge2dldFBhdGh9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuXG4gICAgY29uc3QgZ2VvbWV0cnlDaGFuZ2VkID0gY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHxcbiAgICAgIChjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQgJiYgKFxuICAgICAgICBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQuYWxsIHx8XG4gICAgICAgIGNoYW5nZUZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZC5nZXRQYXRoKSk7XG5cbiAgICBpZiAoZ2VvbWV0cnlDaGFuZ2VkKSB7XG4gICAgICAvLyB0aGlzLnN0YXRlLnBhdGhzIG9ubHkgc3RvcmVzIHBvaW50IHBvc2l0aW9ucyBpbiBlYWNoIHBhdGhcbiAgICAgIGNvbnN0IHBhdGhzID0gcHJvcHMuZGF0YS5tYXAoZ2V0UGF0aCk7XG4gICAgICBjb25zdCBudW1JbnN0YW5jZXMgPSBwYXRocy5yZWR1Y2UoKGNvdW50LCBwYXRoKSA9PiBjb3VudCArIHBhdGgubGVuZ3RoIC0gMSwgMCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe3BhdGhzLCBudW1JbnN0YW5jZXN9KTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHJvdW5kZWQsIG1pdGVyTGltaXQsIHdpZHRoU2NhbGUsIHdpZHRoTWluUGl4ZWxzLCB3aWR0aE1heFBpeGVscywgZGFzaEp1c3RpZmllZFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5yZW5kZXIoT2JqZWN0LmFzc2lnbih7fSwgdW5pZm9ybXMsIHtcbiAgICAgIGpvaW50VHlwZTogTnVtYmVyKHJvdW5kZWQpLFxuICAgICAgYWxpZ25Nb2RlOiBOdW1iZXIoZGFzaEp1c3RpZmllZCksXG4gICAgICB3aWR0aFNjYWxlLFxuICAgICAgbWl0ZXJMaW1pdCxcbiAgICAgIHdpZHRoTWluUGl4ZWxzLFxuICAgICAgd2lkdGhNYXhQaXhlbHNcbiAgICB9KSk7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICAvKlxuICAgICAqICAgICAgIF9cbiAgICAgKiAgICAgICAgXCItXyAxICAgICAgICAgICAgICAgICAgIDMgICAgICAgICAgICAgICAgICAgICAgIDVcbiAgICAgKiAgICAgXyAgICAgXCJvLS0tLS0tLS0tLS0tLS0tLS0tLS0tby0tLS0tLS0tLS0tLS0tLS0tLS1fLW9cbiAgICAgKiAgICAgICAtICAgLyBcIlwiLS0uLl9fICAgICAgICAgICAgICAnLiAgICAgICAgICAgICBfLi0nIC9cbiAgICAgKiAgIF8gICAgIFwiQC0gLSAtIC0gLSBcIlwiLS0uLl9fLSAtIC0gLSB4IC0gLSAtIC1fLkAnICAgIC9cbiAgICAgKiAgICBcIi1fICAvICAgICAgICAgICAgICAgICAgIFwiXCItLS4uX18gJy4gIF8sLWAgOiAgICAgL1xuICAgICAqICAgICAgIFwiby0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIlwiLW8nICAgIDogICAgIC9cbiAgICAgKiAgICAgIDAsMiAgICAgICAgICAgICAgICAgICAgICAgICAgICA0IC8gJy4gIDogICAgIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgICcuOiAgICAgL1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gICAgIDonLiAgIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gICAgIDogICcsIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgICAgOiAgICAgb1xuICAgICAqL1xuXG4gICAgY29uc3QgU0VHTUVOVF9JTkRJQ0VTID0gW1xuICAgICAgLy8gc3RhcnQgY29ybmVyXG4gICAgICAwLCAyLCAxLFxuICAgICAgLy8gYm9keVxuICAgICAgMSwgMiwgNCwgMSwgNCwgMyxcbiAgICAgIC8vIGVuZCBjb3JuZXJcbiAgICAgIDMsIDQsIDVcbiAgICBdO1xuXG4gICAgLy8gWzBdIHBvc2l0aW9uIG9uIHNlZ21lbnQgLSAwOiBzdGFydCwgMTogZW5kXG4gICAgLy8gWzFdIHNpZGUgb2YgcGF0aCAtIC0xOiBsZWZ0LCAwOiBjZW50ZXIsIDE6IHJpZ2h0XG4gICAgLy8gWzJdIHJvbGUgLSAwOiBvZmZzZXQgcG9pbnQgMTogam9pbnQgcG9pbnRcbiAgICBjb25zdCBTRUdNRU5UX1BPU0lUSU9OUyA9IFtcbiAgICAgIC8vIGJldmVsIHN0YXJ0IGNvcm5lclxuICAgICAgMCwgMCwgMSxcbiAgICAgIC8vIHN0YXJ0IGlubmVyIGNvcm5lclxuICAgICAgMCwgLTEsIDAsXG4gICAgICAvLyBzdGFydCBvdXRlciBjb3JuZXJcbiAgICAgIDAsIDEsIDAsXG4gICAgICAvLyBlbmQgaW5uZXIgY29ybmVyXG4gICAgICAxLCAtMSwgMCxcbiAgICAgIC8vIGVuZCBvdXRlciBjb3JuZXJcbiAgICAgIDEsIDEsIDAsXG4gICAgICAvLyBiZXZlbCBlbmQgY29ybmVyXG4gICAgICAxLCAwLCAxXG4gICAgXTtcblxuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U2hhZGVycygpLCB7XG4gICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogR0wuVFJJQU5HTEVTLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgaW5kaWNlczogbmV3IFVpbnQxNkFycmF5KFNFR01FTlRfSU5ESUNFUyksXG4gICAgICAgICAgcG9zaXRpb25zOiBuZXcgRmxvYXQzMkFycmF5KFNFR01FTlRfUE9TSVRJT05TKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVN0YXJ0UG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gcGF0aC5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgcHRJbmRleCA9IDA7IHB0SW5kZXggPCBudW1TZWdtZW50czsgcHRJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcGF0aFtwdEluZGV4XTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzBdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFsyXSB8fCAwO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlRW5kUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRbMl0gfHwgMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gcGF0aC5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgcHRJbmRleCA9IDA7IHB0SW5kZXggPCBudW1TZWdtZW50czsgcHRJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBwYXRoW3B0SW5kZXhdO1xuICAgICAgICBjb25zdCBlbmRQb2ludCA9IHBhdGhbcHRJbmRleCArIDFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gZnA2NGlmeShzdGFydFBvaW50WzBdKVsxXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkoc3RhcnRQb2ludFsxXSlbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KGVuZFBvaW50WzBdKVsxXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkoZW5kUG9pbnRbMV0pWzFdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlTGVmdERlbHRhcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7cGF0aHN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIHBhdGhzLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICBjb25zdCBudW1TZWdtZW50cyA9IHBhdGgubGVuZ3RoIC0gMTtcbiAgICAgIGxldCBwcmV2UG9pbnQgPSBpc0Nsb3NlZChwYXRoKSA/IHBhdGhbcGF0aC5sZW5ndGggLSAyXSA6IHBhdGhbMF07XG5cbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAwOyBwdEluZGV4IDwgbnVtU2VnbWVudHM7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFswXSAtIHByZXZQb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzFdIC0gcHJldlBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gKHBvaW50WzJdIC0gcHJldlBvaW50WzJdKSB8fCAwO1xuICAgICAgICBwcmV2UG9pbnQgPSBwb2ludDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVJpZ2h0RGVsdGFzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIGxldCBuZXh0UG9pbnQgPSBwYXRoW3B0SW5kZXggKyAxXTtcbiAgICAgICAgaWYgKCFuZXh0UG9pbnQpIHtcbiAgICAgICAgICBuZXh0UG9pbnQgPSBpc0Nsb3NlZChwYXRoKSA/IHBhdGhbMV0gOiBwb2ludDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlW2krK10gPSBuZXh0UG9pbnRbMF0gLSBwb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IG5leHRQb2ludFsxXSAtIHBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gKG5leHRQb2ludFsyXSAtIHBvaW50WzJdKSB8fCAwO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlU3Ryb2tlV2lkdGhzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRXaWR0aH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHdpZHRoID0gZ2V0V2lkdGgoZGF0YVtpbmRleF0sIGluZGV4KTtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gd2lkdGg7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVEYXNoQXJyYXlzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXREYXNoQXJyYXl9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWdldERhc2hBcnJheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIHBhdGhzLmZvckVhY2goKHBhdGgsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBkYXNoQXJyYXkgPSBnZXREYXNoQXJyYXkoZGF0YVtpbmRleF0sIGluZGV4KTtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gZGFzaEFycmF5WzBdO1xuICAgICAgICB2YWx1ZVtpKytdID0gZGFzaEFycmF5WzFdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50Q29sb3IgPSBnZXRDb2xvcihkYXRhW2luZGV4XSwgaW5kZXgpO1xuICAgICAgaWYgKGlzTmFOKHBvaW50Q29sb3JbM10pKSB7XG4gICAgICAgIHBvaW50Q29sb3JbM10gPSAyNTU7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBwdEluZGV4ID0gMTsgcHRJbmRleCA8IHBhdGgubGVuZ3RoOyBwdEluZGV4KyspIHtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50Q29sb3JbMF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludENvbG9yWzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRDb2xvclsyXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50Q29sb3JbM107XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBPdmVycmlkZSB0aGUgZGVmYXVsdCBwaWNraW5nIGNvbG9ycyBjYWxjdWxhdGlvblxuICBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBpY2tpbmdDb2xvciA9IHRoaXMuZW5jb2RlUGlja2luZ0NvbG9yKGluZGV4KTtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gcGlja2luZ0NvbG9yWzBdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcGlja2luZ0NvbG9yWzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcGlja2luZ0NvbG9yWzJdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbn1cblxuUGF0aExheWVyLmxheWVyTmFtZSA9ICdQYXRoTGF5ZXInO1xuUGF0aExheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==