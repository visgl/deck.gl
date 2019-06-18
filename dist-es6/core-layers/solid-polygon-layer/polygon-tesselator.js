var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import * as Polygon from './polygon';
import earcut from 'earcut';
import { experimental } from '../../core';
var fp64ify = experimental.fp64ify,
    flattenVertices = experimental.flattenVertices,
    fillArray = experimental.fillArray;

// Maybe deck.gl or luma.gl needs to export this

function getPickingColor(index) {
  return [(index + 1) % 256, Math.floor((index + 1) / 256) % 256, Math.floor((index + 1) / 256 / 256) % 256];
}

var DEFAULT_COLOR = [0, 0, 0, 255]; // Black

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export var PolygonTesselator = function () {
  function PolygonTesselator(_ref) {
    var polygons = _ref.polygons,
        _ref$fp = _ref.fp64,
        fp64 = _ref$fp === undefined ? false : _ref$fp;

    _classCallCheck(this, PolygonTesselator);

    // Normalize all polygons
    this.polygons = polygons.map(function (polygon) {
      return Polygon.normalize(polygon);
    });
    // Count all polygon vertices
    this.pointCount = getPointCount(this.polygons);
    this.fp64 = fp64;
  }

  _createClass(PolygonTesselator, [{
    key: 'indices',
    value: function indices() {
      var polygons = this.polygons,
          indexCount = this.indexCount;

      return calculateIndices({ polygons: polygons, indexCount: indexCount });
    }
  }, {
    key: 'positions',
    value: function positions() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculatePositions({ polygons: polygons, pointCount: pointCount, fp64: this.fp64 });
    }
  }, {
    key: 'normals',
    value: function normals() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculateNormals({ polygons: polygons, pointCount: pointCount });
    }
  }, {
    key: 'colors',
    value: function colors() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$getColor = _ref2.getColor,
          getColor = _ref2$getColor === undefined ? function (x) {
        return DEFAULT_COLOR;
      } : _ref2$getColor;

      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculateColors({ polygons: polygons, pointCount: pointCount, getColor: getColor });
    }
  }, {
    key: 'pickingColors',
    value: function pickingColors() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculatePickingColors({ polygons: polygons, pointCount: pointCount });
    }

    // getAttribute({size, accessor}) {
    //   const {polygons, pointCount} = this;
    //   return calculateAttribute({polygons, pointCount, size, accessor});
    // }

  }]);

  return PolygonTesselator;
}();

// Count number of points in a list of complex polygons
function getPointCount(polygons) {
  return polygons.reduce(function (points, polygon) {
    return points + Polygon.getVertexCount(polygon);
  }, 0);
}

// COunt number of triangles in a list of complex polygons
function getTriangleCount(polygons) {
  return polygons.reduce(function (triangles, polygon) {
    return triangles + Polygon.getTriangleCount(polygon);
  }, 0);
}

// Returns the offsets of each complex polygon in the combined array of all polygons
function getPolygonOffsets(polygons) {
  var offsets = new Array(polygons.length + 1);
  offsets[0] = 0;
  var offset = 0;
  polygons.forEach(function (polygon, i) {
    offset += Polygon.getVertexCount(polygon);
    offsets[i + 1] = offset;
  });
  return offsets;
}

// Returns the offset of each hole polygon in the flattened array for that polygon
function getHoleIndices(complexPolygon) {
  var holeIndices = null;
  if (complexPolygon.length > 1) {
    var polygonStartIndex = 0;
    holeIndices = [];
    complexPolygon.forEach(function (polygon) {
      polygonStartIndex += polygon.length;
      holeIndices.push(polygonStartIndex);
    });
    // Last element points to end of the flat array, remove it
    holeIndices.pop();
  }
  return holeIndices;
}

function calculateIndices(_ref3) {
  var polygons = _ref3.polygons,
      _ref3$IndexType = _ref3.IndexType,
      IndexType = _ref3$IndexType === undefined ? Uint32Array : _ref3$IndexType;

  // Calculate length of index array (3 * number of triangles)
  var indexCount = 3 * getTriangleCount(polygons);
  var offsets = getPolygonOffsets(polygons);

  // Allocate the attribute
  // TODO it's not the index count but the vertex count that must be checked
  if (IndexType === Uint16Array && indexCount > 65535) {
    throw new Error('Vertex count exceeds browser\'s limit');
  }
  var attribute = new IndexType(indexCount);

  // 1. get triangulated indices for the internal areas
  // 2. offset them by the number of indices in previous polygons
  var i = 0;
  polygons.forEach(function (polygon, polygonIndex) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = calculateSurfaceIndices(polygon)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        attribute[i++] = index + offsets[polygonIndex];
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
  });

  return attribute;
}

/*
 * Get vertex indices for drawing complexPolygon mesh
 * @private
 * @param {[Number,Number,Number][][]} complexPolygon
 * @returns {[Number]} indices
 */
function calculateSurfaceIndices(complexPolygon) {
  // Prepare an array of hole indices as expected by earcut
  var holeIndices = getHoleIndices(complexPolygon);
  // Flatten the polygon as expected by earcut
  var verts = flattenVertices(complexPolygon);
  // Let earcut triangulate the polygon
  return earcut(verts, holeIndices, 3);
}

function calculatePositions(_ref4) {
  var polygons = _ref4.polygons,
      pointCount = _ref4.pointCount,
      fp64 = _ref4.fp64;

  // Flatten out all the vertices of all the sub subPolygons
  var attribute = new Float32Array(pointCount * 3);
  var attributeLow = void 0;
  if (fp64) {
    // We only need x, y component
    attributeLow = new Float32Array(pointCount * 2);
  }
  var i = 0;
  var j = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = polygons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var polygon = _step2.value;

      Polygon.forEachVertex(polygon, function (vertex) {
        // eslint-disable-line
        var x = vertex[0];
        var y = vertex[1];
        var z = vertex[2] || 0;
        attribute[i++] = x;
        attribute[i++] = y;
        attribute[i++] = z;
        if (fp64) {
          attributeLow[j++] = fp64ify(x)[1];
          attributeLow[j++] = fp64ify(y)[1];
        }
      });
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

  return { positions: attribute, positions64xyLow: attributeLow };
}

function calculateNormals(_ref5) {
  var polygons = _ref5.polygons,
      pointCount = _ref5.pointCount;

  // TODO - use generic vertex attribute?
  var attribute = new Float32Array(pointCount * 3);
  // normals is not used in flat polygon shader
  // fillArray({target: attribute, source: [0, 0, 1], start: 0, count: pointCount});
  return attribute;
}

function calculateColors(_ref6) {
  var polygons = _ref6.polygons,
      pointCount = _ref6.pointCount,
      getColor = _ref6.getColor;

  var attribute = new Uint8ClampedArray(pointCount * 4);
  var i = 0;
  polygons.forEach(function (complexPolygon, polygonIndex) {
    // Calculate polygon color
    var color = getColor(polygonIndex);
    color[3] = Number.isFinite(color[3]) ? color[3] : 255;

    var vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({ target: attribute, source: color, start: i, count: vertexCount });
    i += color.length * vertexCount;
  });
  return attribute;
}

function calculatePickingColors(_ref7) {
  var polygons = _ref7.polygons,
      pointCount = _ref7.pointCount;

  var attribute = new Uint8ClampedArray(pointCount * 3);
  var i = 0;
  polygons.forEach(function (complexPolygon, polygonIndex) {
    var color = getPickingColor(polygonIndex);
    var vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({ target: attribute, source: color, start: i, count: vertexCount });
    i += color.length * vertexCount;
  });
  return attribute;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24tdGVzc2VsYXRvci5qcyJdLCJuYW1lcyI6WyJQb2x5Z29uIiwiZWFyY3V0IiwiZXhwZXJpbWVudGFsIiwiZnA2NGlmeSIsImZsYXR0ZW5WZXJ0aWNlcyIsImZpbGxBcnJheSIsImdldFBpY2tpbmdDb2xvciIsImluZGV4IiwiTWF0aCIsImZsb29yIiwiREVGQVVMVF9DT0xPUiIsIlBvbHlnb25UZXNzZWxhdG9yIiwicG9seWdvbnMiLCJmcDY0IiwibWFwIiwibm9ybWFsaXplIiwicG9seWdvbiIsInBvaW50Q291bnQiLCJnZXRQb2ludENvdW50IiwiaW5kZXhDb3VudCIsImNhbGN1bGF0ZUluZGljZXMiLCJjYWxjdWxhdGVQb3NpdGlvbnMiLCJjYWxjdWxhdGVOb3JtYWxzIiwiZ2V0Q29sb3IiLCJjYWxjdWxhdGVDb2xvcnMiLCJjYWxjdWxhdGVQaWNraW5nQ29sb3JzIiwicmVkdWNlIiwicG9pbnRzIiwiZ2V0VmVydGV4Q291bnQiLCJnZXRUcmlhbmdsZUNvdW50IiwidHJpYW5nbGVzIiwiZ2V0UG9seWdvbk9mZnNldHMiLCJvZmZzZXRzIiwiQXJyYXkiLCJsZW5ndGgiLCJvZmZzZXQiLCJmb3JFYWNoIiwiaSIsImdldEhvbGVJbmRpY2VzIiwiY29tcGxleFBvbHlnb24iLCJob2xlSW5kaWNlcyIsInBvbHlnb25TdGFydEluZGV4IiwicHVzaCIsInBvcCIsIkluZGV4VHlwZSIsIlVpbnQzMkFycmF5IiwiVWludDE2QXJyYXkiLCJFcnJvciIsImF0dHJpYnV0ZSIsInBvbHlnb25JbmRleCIsImNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzIiwidmVydHMiLCJGbG9hdDMyQXJyYXkiLCJhdHRyaWJ1dGVMb3ciLCJqIiwiZm9yRWFjaFZlcnRleCIsIngiLCJ2ZXJ0ZXgiLCJ5IiwieiIsInBvc2l0aW9ucyIsInBvc2l0aW9uczY0eHlMb3ciLCJVaW50OENsYW1wZWRBcnJheSIsImNvbG9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ2ZXJ0ZXhDb3VudCIsInRhcmdldCIsInNvdXJjZSIsInN0YXJ0IiwiY291bnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxLQUFLQSxPQUFaLE1BQXlCLFdBQXpCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjtBQUNBLFNBQVFDLFlBQVIsUUFBMkIsWUFBM0I7SUFDT0MsTyxHQUF1Q0QsWSxDQUF2Q0MsTztJQUFTQyxlLEdBQThCRixZLENBQTlCRSxlO0lBQWlCQyxTLEdBQWFILFksQ0FBYkcsUzs7QUFFakM7O0FBQ0EsU0FBU0MsZUFBVCxDQUF5QkMsS0FBekIsRUFBZ0M7QUFDOUIsU0FBTyxDQUNMLENBQUNBLFFBQVEsQ0FBVCxJQUFjLEdBRFQsRUFFTEMsS0FBS0MsS0FBTCxDQUFXLENBQUNGLFFBQVEsQ0FBVCxJQUFjLEdBQXpCLElBQWdDLEdBRjNCLEVBR0xDLEtBQUtDLEtBQUwsQ0FBVyxDQUFDRixRQUFRLENBQVQsSUFBYyxHQUFkLEdBQW9CLEdBQS9CLElBQXNDLEdBSGpDLENBQVA7QUFLRDs7QUFFRCxJQUFNRyxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWLENBQXRCLEMsQ0FBc0M7O0FBRXRDO0FBQ0E7QUFDQSxXQUFhQyxpQkFBYjtBQUNFLG1DQUFzQztBQUFBLFFBQXpCQyxRQUF5QixRQUF6QkEsUUFBeUI7QUFBQSx1QkFBZkMsSUFBZTtBQUFBLFFBQWZBLElBQWUsMkJBQVIsS0FBUTs7QUFBQTs7QUFDcEM7QUFDQSxTQUFLRCxRQUFMLEdBQWdCQSxTQUFTRSxHQUFULENBQWE7QUFBQSxhQUFXZCxRQUFRZSxTQUFSLENBQWtCQyxPQUFsQixDQUFYO0FBQUEsS0FB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QyxPQUFPSixXQUFwRCxFQUFWO0FBQ0E3QixTQUFLMEIsTUFBTTdCLE1BQU4sR0FBZWdDLFdBQXBCO0FBQ0QsR0FSRDtBQVNBLFNBQU9sQixTQUFQO0FBQ0Q7O0FBRUQsU0FBU3ZCLHNCQUFULFFBQXdEO0FBQUEsTUFBdkJiLFFBQXVCLFNBQXZCQSxRQUF1QjtBQUFBLE1BQWJLLFVBQWEsU0FBYkEsVUFBYTs7QUFDdEQsTUFBTStCLFlBQVksSUFBSWMsaUJBQUosQ0FBc0I3QyxhQUFhLENBQW5DLENBQWxCO0FBQ0EsTUFBSW9CLElBQUksQ0FBUjtBQUNBekIsV0FBU3dCLE9BQVQsQ0FBaUIsVUFBQ0csY0FBRCxFQUFpQlUsWUFBakIsRUFBa0M7QUFDakQsUUFBTWMsUUFBUXpELGdCQUFnQjJDLFlBQWhCLENBQWQ7QUFDQSxRQUFNaUIsY0FBY2xFLFFBQVE0QixjQUFSLENBQXVCVyxjQUF2QixDQUFwQjtBQUNBbEMsY0FBVSxFQUFDOEQsUUFBUW5CLFNBQVQsRUFBb0JvQixRQUFRTCxLQUE1QixFQUFtQ00sT0FBT2hDLENBQTFDLEVBQTZDaUMsT0FBT0osV0FBcEQsRUFBVjtBQUNBN0IsU0FBSzBCLE1BQU03QixNQUFOLEdBQWVnQyxXQUFwQjtBQUNELEdBTEQ7QUFNQSxTQUFPbEIsU0FBUDtBQUNEIiwiZmlsZSI6InBvbHlnb24tdGVzc2VsYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyBIYW5kbGVzIHRlc3NlbGF0aW9uIG9mIHBvbHlnb25zIHdpdGggaG9sZXNcbi8vIC0gMkQgc3VyZmFjZXNcbi8vIC0gMkQgb3V0bGluZXNcbi8vIC0gM0Qgc3VyZmFjZXMgKHRvcCBhbmQgc2lkZXMgb25seSlcbi8vIC0gM0Qgd2lyZWZyYW1lcyAobm90IHlldClcbmltcG9ydCAqIGFzIFBvbHlnb24gZnJvbSAnLi9wb2x5Z29uJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCB7ZXhwZXJpbWVudGFsfSBmcm9tICcuLi8uLi9jb3JlJztcbmNvbnN0IHtmcDY0aWZ5LCBmbGF0dGVuVmVydGljZXMsIGZpbGxBcnJheX0gPSBleHBlcmltZW50YWw7XG5cbi8vIE1heWJlIGRlY2suZ2wgb3IgbHVtYS5nbCBuZWVkcyB0byBleHBvcnQgdGhpc1xuZnVuY3Rpb24gZ2V0UGlja2luZ0NvbG9yKGluZGV4KSB7XG4gIHJldHVybiBbXG4gICAgKGluZGV4ICsgMSkgJSAyNTYsXG4gICAgTWF0aC5mbG9vcigoaW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgTWF0aC5mbG9vcigoaW5kZXggKyAxKSAvIDI1NiAvIDI1NikgJSAyNTZcbiAgXTtcbn1cblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdOyAvLyBCbGFja1xuXG4vLyBUaGlzIGNsYXNzIGlzIHNldCB1cCB0byBhbGxvdyBxdWVyeWluZyBvbmUgYXR0cmlidXRlIGF0IGEgdGltZVxuLy8gdGhlIHdheSB0aGUgQXR0cmlidXRlTWFuYWdlciBleHBlY3RzIGl0XG5leHBvcnQgY2xhc3MgUG9seWdvblRlc3NlbGF0b3Ige1xuICBjb25zdHJ1Y3Rvcih7cG9seWdvbnMsIGZwNjQgPSBmYWxzZX0pIHtcbiAgICAvLyBOb3JtYWxpemUgYWxsIHBvbHlnb25zXG4gICAgdGhpcy5wb2x5Z29ucyA9IHBvbHlnb25zLm1hcChwb2x5Z29uID0+IFBvbHlnb24ubm9ybWFsaXplKHBvbHlnb24pKTtcbiAgICAvLyBDb3VudCBhbGwgcG9seWdvbiB2ZXJ0aWNlc1xuICAgIHRoaXMucG9pbnRDb3VudCA9IGdldFBvaW50Q291bnQodGhpcy5wb2x5Z29ucyk7XG4gICAgdGhpcy5mcDY0ID0gZnA2NDtcbiAgfVxuXG4gIGluZGljZXMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBpbmRleENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZUluZGljZXMoe3BvbHlnb25zLCBpbmRleENvdW50fSk7XG4gIH1cblxuICBwb3NpdGlvbnMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBwb2ludENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBvc2l0aW9ucyh7cG9seWdvbnMsIHBvaW50Q291bnQsIGZwNjQ6IHRoaXMuZnA2NH0pO1xuICB9XG5cbiAgbm9ybWFscygpIHtcbiAgICBjb25zdCB7cG9seWdvbnMsIHBvaW50Q291bnR9ID0gdGhpcztcbiAgICByZXR1cm4gY2FsY3VsYXRlTm9ybWFscyh7cG9seWdvbnMsIHBvaW50Q291bnR9KTtcbiAgfVxuXG4gIGNvbG9ycyh7Z2V0Q29sb3IgPSB4ID0+IERFRkFVTFRfQ09MT1J9ID0ge30pIHtcbiAgICBjb25zdCB7cG9seWdvbnMsIHBvaW50Q291bnR9ID0gdGhpcztcbiAgICByZXR1cm4gY2FsY3VsYXRlQ29sb3JzKHtwb2x5Z29ucywgcG9pbnRDb3VudCwgZ2V0Q29sb3J9KTtcbiAgfVxuXG4gIHBpY2tpbmdDb2xvcnMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBwb2ludENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoe3BvbHlnb25zLCBwb2ludENvdW50fSk7XG4gIH1cblxuICAvLyBnZXRBdHRyaWJ1dGUoe3NpemUsIGFjY2Vzc29yfSkge1xuICAvLyAgIGNvbnN0IHtwb2x5Z29ucywgcG9pbnRDb3VudH0gPSB0aGlzO1xuICAvLyAgIHJldHVybiBjYWxjdWxhdGVBdHRyaWJ1dGUoe3BvbHlnb25zLCBwb2ludENvdW50LCBzaXplLCBhY2Nlc3Nvcn0pO1xuICAvLyB9XG59XG5cbi8vIENvdW50IG51bWJlciBvZiBwb2ludHMgaW4gYSBsaXN0IG9mIGNvbXBsZXggcG9seWdvbnNcbmZ1bmN0aW9uIGdldFBvaW50Q291bnQocG9seWdvbnMpIHtcbiAgcmV0dXJuIHBvbHlnb25zLnJlZHVjZSgocG9pbnRzLCBwb2x5Z29uKSA9PiBwb2ludHMgKyBQb2x5Z29uLmdldFZlcnRleENvdW50KHBvbHlnb24pLCAwKTtcbn1cblxuLy8gQ091bnQgbnVtYmVyIG9mIHRyaWFuZ2xlcyBpbiBhIGxpc3Qgb2YgY29tcGxleCBwb2x5Z29uc1xuZnVuY3Rpb24gZ2V0VHJpYW5nbGVDb3VudChwb2x5Z29ucykge1xuICByZXR1cm4gcG9seWdvbnMucmVkdWNlKCh0cmlhbmdsZXMsIHBvbHlnb24pID0+IHRyaWFuZ2xlcyArIFBvbHlnb24uZ2V0VHJpYW5nbGVDb3VudChwb2x5Z29uKSwgMCk7XG59XG5cbi8vIFJldHVybnMgdGhlIG9mZnNldHMgb2YgZWFjaCBjb21wbGV4IHBvbHlnb24gaW4gdGhlIGNvbWJpbmVkIGFycmF5IG9mIGFsbCBwb2x5Z29uc1xuZnVuY3Rpb24gZ2V0UG9seWdvbk9mZnNldHMocG9seWdvbnMpIHtcbiAgY29uc3Qgb2Zmc2V0cyA9IG5ldyBBcnJheShwb2x5Z29ucy5sZW5ndGggKyAxKTtcbiAgb2Zmc2V0c1swXSA9IDA7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBwb2x5Z29ucy5mb3JFYWNoKChwb2x5Z29uLCBpKSA9PiB7XG4gICAgb2Zmc2V0ICs9IFBvbHlnb24uZ2V0VmVydGV4Q291bnQocG9seWdvbik7XG4gICAgb2Zmc2V0c1tpICsgMV0gPSBvZmZzZXQ7XG4gIH0pO1xuICByZXR1cm4gb2Zmc2V0cztcbn1cblxuLy8gUmV0dXJucyB0aGUgb2Zmc2V0IG9mIGVhY2ggaG9sZSBwb2x5Z29uIGluIHRoZSBmbGF0dGVuZWQgYXJyYXkgZm9yIHRoYXQgcG9seWdvblxuZnVuY3Rpb24gZ2V0SG9sZUluZGljZXMoY29tcGxleFBvbHlnb24pIHtcbiAgbGV0IGhvbGVJbmRpY2VzID0gbnVsbDtcbiAgaWYgKGNvbXBsZXhQb2x5Z29uLmxlbmd0aCA+IDEpIHtcbiAgICBsZXQgcG9seWdvblN0YXJ0SW5kZXggPSAwO1xuICAgIGhvbGVJbmRpY2VzID0gW107XG4gICAgY29tcGxleFBvbHlnb24uZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgIHBvbHlnb25TdGFydEluZGV4ICs9IHBvbHlnb24ubGVuZ3RoO1xuICAgICAgaG9sZUluZGljZXMucHVzaChwb2x5Z29uU3RhcnRJbmRleCk7XG4gICAgfSk7XG4gICAgLy8gTGFzdCBlbGVtZW50IHBvaW50cyB0byBlbmQgb2YgdGhlIGZsYXQgYXJyYXksIHJlbW92ZSBpdFxuICAgIGhvbGVJbmRpY2VzLnBvcCgpO1xuICB9XG4gIHJldHVybiBob2xlSW5kaWNlcztcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlSW5kaWNlcyh7cG9seWdvbnMsIEluZGV4VHlwZSA9IFVpbnQzMkFycmF5fSkge1xuICAvLyBDYWxjdWxhdGUgbGVuZ3RoIG9mIGluZGV4IGFycmF5ICgzICogbnVtYmVyIG9mIHRyaWFuZ2xlcylcbiAgY29uc3QgaW5kZXhDb3VudCA9IDMgKiBnZXRUcmlhbmdsZUNvdW50KHBvbHlnb25zKTtcbiAgY29uc3Qgb2Zmc2V0cyA9IGdldFBvbHlnb25PZmZzZXRzKHBvbHlnb25zKTtcblxuICAvLyBBbGxvY2F0ZSB0aGUgYXR0cmlidXRlXG4gIC8vIFRPRE8gaXQncyBub3QgdGhlIGluZGV4IGNvdW50IGJ1dCB0aGUgdmVydGV4IGNvdW50IHRoYXQgbXVzdCBiZSBjaGVja2VkXG4gIGlmIChJbmRleFR5cGUgPT09IFVpbnQxNkFycmF5ICYmIGluZGV4Q291bnQgPiA2NTUzNSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVmVydGV4IGNvdW50IGV4Y2VlZHMgYnJvd3NlclxcJ3MgbGltaXQnKTtcbiAgfVxuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgSW5kZXhUeXBlKGluZGV4Q291bnQpO1xuXG4gIC8vIDEuIGdldCB0cmlhbmd1bGF0ZWQgaW5kaWNlcyBmb3IgdGhlIGludGVybmFsIGFyZWFzXG4gIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBwb2x5Z29uc1xuICBsZXQgaSA9IDA7XG4gIHBvbHlnb25zLmZvckVhY2goKHBvbHlnb24sIHBvbHlnb25JbmRleCkgPT4ge1xuICAgIGZvciAoY29uc3QgaW5kZXggb2YgY2FsY3VsYXRlU3VyZmFjZUluZGljZXMocG9seWdvbikpIHtcbiAgICAgIGF0dHJpYnV0ZVtpKytdID0gaW5kZXggKyBvZmZzZXRzW3BvbHlnb25JbmRleF07XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXR0cmlidXRlO1xufVxuXG4vKlxuICogR2V0IHZlcnRleCBpbmRpY2VzIGZvciBkcmF3aW5nIGNvbXBsZXhQb2x5Z29uIG1lc2hcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyLE51bWJlcl1bXVtdfSBjb21wbGV4UG9seWdvblxuICogQHJldHVybnMge1tOdW1iZXJdfSBpbmRpY2VzXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKGNvbXBsZXhQb2x5Z29uKSB7XG4gIC8vIFByZXBhcmUgYW4gYXJyYXkgb2YgaG9sZSBpbmRpY2VzIGFzIGV4cGVjdGVkIGJ5IGVhcmN1dFxuICBjb25zdCBob2xlSW5kaWNlcyA9IGdldEhvbGVJbmRpY2VzKGNvbXBsZXhQb2x5Z29uKTtcbiAgLy8gRmxhdHRlbiB0aGUgcG9seWdvbiBhcyBleHBlY3RlZCBieSBlYXJjdXRcbiAgY29uc3QgdmVydHMgPSBmbGF0dGVuVmVydGljZXMoY29tcGxleFBvbHlnb24pO1xuICAvLyBMZXQgZWFyY3V0IHRyaWFuZ3VsYXRlIHRoZSBwb2x5Z29uXG4gIHJldHVybiBlYXJjdXQodmVydHMsIGhvbGVJbmRpY2VzLCAzKTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb25zKHtwb2x5Z29ucywgcG9pbnRDb3VudCwgZnA2NH0pIHtcbiAgLy8gRmxhdHRlbiBvdXQgYWxsIHRoZSB2ZXJ0aWNlcyBvZiBhbGwgdGhlIHN1YiBzdWJQb2x5Z29uc1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAzKTtcbiAgbGV0IGF0dHJpYnV0ZUxvdztcbiAgaWYgKGZwNjQpIHtcbiAgICAvLyBXZSBvbmx5IG5lZWQgeCwgeSBjb21wb25lbnRcbiAgICBhdHRyaWJ1dGVMb3cgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAyKTtcbiAgfVxuICBsZXQgaSA9IDA7XG4gIGxldCBqID0gMDtcbiAgZm9yIChjb25zdCBwb2x5Z29uIG9mIHBvbHlnb25zKSB7XG4gICAgUG9seWdvbi5mb3JFYWNoVmVydGV4KHBvbHlnb24sIHZlcnRleCA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNvbnN0IHggPSB2ZXJ0ZXhbMF07XG4gICAgICBjb25zdCB5ID0gdmVydGV4WzFdO1xuICAgICAgY29uc3QgeiA9IHZlcnRleFsyXSB8fCAwO1xuICAgICAgYXR0cmlidXRlW2krK10gPSB4O1xuICAgICAgYXR0cmlidXRlW2krK10gPSB5O1xuICAgICAgYXR0cmlidXRlW2krK10gPSB6O1xuICAgICAgaWYgKGZwNjQpIHtcbiAgICAgICAgYXR0cmlidXRlTG93W2orK10gPSBmcDY0aWZ5KHgpWzFdO1xuICAgICAgICBhdHRyaWJ1dGVMb3dbaisrXSA9IGZwNjRpZnkoeSlbMV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtwb3NpdGlvbnM6IGF0dHJpYnV0ZSwgcG9zaXRpb25zNjR4eUxvdzogYXR0cmlidXRlTG93fTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlTm9ybWFscyh7cG9seWdvbnMsIHBvaW50Q291bnR9KSB7XG4gIC8vIFRPRE8gLSB1c2UgZ2VuZXJpYyB2ZXJ0ZXggYXR0cmlidXRlP1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAzKTtcbiAgLy8gbm9ybWFscyBpcyBub3QgdXNlZCBpbiBmbGF0IHBvbHlnb24gc2hhZGVyXG4gIC8vIGZpbGxBcnJheSh7dGFyZ2V0OiBhdHRyaWJ1dGUsIHNvdXJjZTogWzAsIDAsIDFdLCBzdGFydDogMCwgY291bnQ6IHBvaW50Q291bnR9KTtcbiAgcmV0dXJuIGF0dHJpYnV0ZTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlQ29sb3JzKHtwb2x5Z29ucywgcG9pbnRDb3VudCwgZ2V0Q29sb3J9KSB7XG4gIGNvbnN0IGF0dHJpYnV0ZSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShwb2ludENvdW50ICogNCk7XG4gIGxldCBpID0gMDtcbiAgcG9seWdvbnMuZm9yRWFjaCgoY29tcGxleFBvbHlnb24sIHBvbHlnb25JbmRleCkgPT4ge1xuICAgIC8vIENhbGN1bGF0ZSBwb2x5Z29uIGNvbG9yXG4gICAgY29uc3QgY29sb3IgPSBnZXRDb2xvcihwb2x5Z29uSW5kZXgpO1xuICAgIGNvbG9yWzNdID0gTnVtYmVyLmlzRmluaXRlKGNvbG9yWzNdKSA/IGNvbG9yWzNdIDogMjU1O1xuXG4gICAgY29uc3QgdmVydGV4Q291bnQgPSBQb2x5Z29uLmdldFZlcnRleENvdW50KGNvbXBsZXhQb2x5Z29uKTtcbiAgICBmaWxsQXJyYXkoe3RhcmdldDogYXR0cmlidXRlLCBzb3VyY2U6IGNvbG9yLCBzdGFydDogaSwgY291bnQ6IHZlcnRleENvdW50fSk7XG4gICAgaSArPSBjb2xvci5sZW5ndGggKiB2ZXJ0ZXhDb3VudDtcbiAgfSk7XG4gIHJldHVybiBhdHRyaWJ1dGU7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoe3BvbHlnb25zLCBwb2ludENvdW50fSkge1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkocG9pbnRDb3VudCAqIDMpO1xuICBsZXQgaSA9IDA7XG4gIHBvbHlnb25zLmZvckVhY2goKGNvbXBsZXhQb2x5Z29uLCBwb2x5Z29uSW5kZXgpID0+IHtcbiAgICBjb25zdCBjb2xvciA9IGdldFBpY2tpbmdDb2xvcihwb2x5Z29uSW5kZXgpO1xuICAgIGNvbnN0IHZlcnRleENvdW50ID0gUG9seWdvbi5nZXRWZXJ0ZXhDb3VudChjb21wbGV4UG9seWdvbik7XG4gICAgZmlsbEFycmF5KHt0YXJnZXQ6IGF0dHJpYnV0ZSwgc291cmNlOiBjb2xvciwgc3RhcnQ6IGksIGNvdW50OiB2ZXJ0ZXhDb3VudH0pO1xuICAgIGkgKz0gY29sb3IubGVuZ3RoICogdmVydGV4Q291bnQ7XG4gIH0pO1xuICByZXR1cm4gYXR0cmlidXRlO1xufVxuIl19