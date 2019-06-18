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

import * as Polygon from './polygon';
import { experimental } from '../../core';
var fp64ify = experimental.fp64ify,
    fillArray = experimental.fillArray;

import earcut from 'earcut';

function getPickingColor(index) {
  return [index + 1 & 255, index + 1 >> 8 & 255, index + 1 >> 8 >> 8 & 255];
}

function arrayPush(array, values) {
  var length = values.length;
  var offset = array.length;

  for (var index = 0; index < length; index++) {
    array[offset++] = values[index];
  }
  return array;
}

function flatten(values, level) {
  var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (level > 1) {
    values.forEach(function (v) {
      return flatten(v, level - 1, result);
    });
  } else {
    arrayPush(result, values);
  }
  return result;
}

var DEFAULT_COLOR = [0, 0, 0, 255]; // Black

export var PolygonTesselatorExtruded = function () {
  function PolygonTesselatorExtruded(_ref) {
    var polygons = _ref.polygons,
        _ref$getHeight = _ref.getHeight,
        getHeight = _ref$getHeight === undefined ? function (x) {
      return 1000;
    } : _ref$getHeight,
        _ref$getColor = _ref.getColor,
        getColor = _ref$getColor === undefined ? function (x) {
      return DEFAULT_COLOR;
    } : _ref$getColor,
        _ref$wireframe = _ref.wireframe,
        wireframe = _ref$wireframe === undefined ? false : _ref$wireframe,
        _ref$fp = _ref.fp64,
        fp64 = _ref$fp === undefined ? false : _ref$fp;

    _classCallCheck(this, PolygonTesselatorExtruded);

    this.fp64 = fp64;

    // Expensive operation, convert all polygons to arrays
    polygons = polygons.map(function (complexPolygon, polygonIndex) {
      var height = getHeight(polygonIndex) || 0;
      return Polygon.normalize(complexPolygon).map(function (polygon) {
        return polygon.map(function (coord) {
          return [coord[0], coord[1], height];
        });
      });
    });

    var groupedVertices = polygons;
    this.groupedVertices = polygons;
    var pointCount = getPointCount(polygons);
    this.pointCount = pointCount;
    this.wireframe = wireframe;

    this.attributes = {};

    var positionsJS = calculatePositionsJS({ groupedVertices: groupedVertices, pointCount: pointCount, wireframe: wireframe });
    Object.assign(this.attributes, {
      positions: calculatePositions(positionsJS, this.fp64),
      indices: calculateIndices({ groupedVertices: groupedVertices, wireframe: wireframe }),
      normals: calculateNormals({ groupedVertices: groupedVertices, pointCount: pointCount, wireframe: wireframe }),
      // colors: calculateColors({groupedVertices, wireframe, getColor}),
      pickingColors: calculatePickingColors({ groupedVertices: groupedVertices, pointCount: pointCount, wireframe: wireframe })
    });
  }

  _createClass(PolygonTesselatorExtruded, [{
    key: 'indices',
    value: function indices() {
      return this.attributes.indices;
    }
  }, {
    key: 'positions',
    value: function positions() {
      return this.attributes.positions;
    }
  }, {
    key: 'normals',
    value: function normals() {
      return this.attributes.normals;
    }
  }, {
    key: 'colors',
    value: function colors() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$getColor = _ref2.getColor,
          getColor = _ref2$getColor === undefined ? function (x) {
        return DEFAULT_COLOR;
      } : _ref2$getColor;

      var groupedVertices = this.groupedVertices,
          pointCount = this.pointCount,
          wireframe = this.wireframe;

      return calculateColors({ groupedVertices: groupedVertices, pointCount: pointCount, wireframe: wireframe, getColor: getColor });
    }
  }, {
    key: 'pickingColors',
    value: function pickingColors() {
      return this.attributes.pickingColors;
    }

    // updateTriggers: {
    //   positions: ['getHeight'],
    //   colors: ['getColors']
    //   pickingColors: 'none'
    // }

  }]);

  return PolygonTesselatorExtruded;
}();

// Count number of points in a list of complex polygons
function getPointCount(polygons) {
  return polygons.reduce(function (points, polygon) {
    return points + Polygon.getVertexCount(polygon);
  }, 0);
}

function calculateIndices(_ref3) {
  var groupedVertices = _ref3.groupedVertices,
      _ref3$wireframe = _ref3.wireframe,
      wireframe = _ref3$wireframe === undefined ? false : _ref3$wireframe;

  // adjust index offset for multiple polygons
  var multiplier = wireframe ? 2 : 5;
  var offsets = [];
  groupedVertices.reduce(function (vertexIndex, vertices) {
    offsets.push(vertexIndex);
    return vertexIndex + Polygon.getVertexCount(vertices) * multiplier;
  }, 0);

  var indices = groupedVertices.map(function (vertices, polygonIndex) {
    return wireframe ?
    // 1. get sequentially ordered indices of each polygons wireframe
    // 2. offset them by the number of indices in previous polygons
    calculateContourIndices(vertices, offsets[polygonIndex]) :
    // 1. get triangulated indices for the internal areas
    // 2. offset them by the number of indices in previous polygons
    calculateSurfaceIndices(vertices, offsets[polygonIndex]);
  });

  return new Uint32Array(flatten(indices, 2));
}

// Calculate a flat position array in JS - can be mapped to 32 or 64 bit typed arrays
// Remarks:
// * each top vertex is on 3 surfaces
// * each bottom vertex is on 2 surfaces
function calculatePositionsJS(_ref4) {
  var groupedVertices = _ref4.groupedVertices,
      pointCount = _ref4.pointCount,
      _ref4$wireframe = _ref4.wireframe,
      wireframe = _ref4$wireframe === undefined ? false : _ref4$wireframe;

  var multiplier = wireframe ? 2 : 5;
  var positions = new Float32Array(pointCount * 3 * multiplier);
  var vertexIndex = 0;

  groupedVertices.forEach(function (vertices) {
    var topVertices = flatten(vertices, 3);

    var baseVertices = topVertices.slice(0);
    var i = topVertices.length - 1;
    while (i > 0) {
      baseVertices[i] = 0;
      i -= 3;
    }
    var len = topVertices.length;

    if (wireframe) {
      fillArray({ target: positions, source: topVertices, start: vertexIndex });
      fillArray({ target: positions, source: baseVertices, start: vertexIndex + len });
    } else {
      fillArray({ target: positions, source: topVertices, start: vertexIndex, count: 3 });
      fillArray({ target: positions, source: baseVertices, start: vertexIndex + len * 3,
        count: 2 });
    }
    vertexIndex += len * multiplier;
  });

  return positions;
}

function calculatePositions(positionsJS, fp64) {
  var positionLow = void 0;
  if (fp64) {
    // We only need x, y component
    var vertexCount = positionsJS.length / 3;
    positionLow = new Float32Array(vertexCount * 2);
    for (var i = 0; i < vertexCount; i++) {
      positionLow[i * 2 + 0] = fp64ify(positionsJS[i * 3 + 0])[1];
      positionLow[i * 2 + 1] = fp64ify(positionsJS[i * 3 + 1])[1];
    }
  }
  return { positions: positionsJS, positions64xyLow: positionLow };
}

function calculateNormals(_ref5) {
  var groupedVertices = _ref5.groupedVertices,
      pointCount = _ref5.pointCount,
      wireframe = _ref5.wireframe;

  var up = [0, 0, 1];
  var multiplier = wireframe ? 2 : 5;

  var normals = new Float32Array(pointCount * 3 * multiplier);
  var vertexIndex = 0;

  if (wireframe) {
    return fillArray({ target: normals, source: up, count: pointCount * multiplier });
  }

  groupedVertices.map(function (vertices, polygonIndex) {
    var vertexCount = Polygon.getVertexCount(vertices);

    fillArray({ target: normals, source: up, start: vertexIndex, count: vertexCount });
    vertexIndex += vertexCount * 3;

    var sideNormalsForward = [];
    var sideNormalsBackward = [];

    vertices.forEach(function (polygon) {
      var sideNormals = calculateSideNormals(polygon);
      var firstNormal = sideNormals.slice(0, 3);

      arrayPush(sideNormalsForward, sideNormals);
      arrayPush(sideNormalsForward, firstNormal);

      arrayPush(sideNormalsBackward, firstNormal);
      arrayPush(sideNormalsBackward, sideNormals);
    });

    fillArray({ target: normals, start: vertexIndex, count: 2,
      source: sideNormalsForward.concat(sideNormalsBackward) });
    vertexIndex += vertexCount * 3 * 4;
  });

  return normals;
}

function calculateSideNormals(vertices) {
  var normals = [];

  var lastVertice = null;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = vertices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var vertice = _step.value;

      if (lastVertice) {
        // vertex[i-1], vertex[i]
        var n = getNormal(lastVertice, vertice);
        arrayPush(normals, n);
      }
      lastVertice = vertice;
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

  return normals;
}

function calculateColors(_ref6) {
  var groupedVertices = _ref6.groupedVertices,
      pointCount = _ref6.pointCount,
      getColor = _ref6.getColor,
      _ref6$wireframe = _ref6.wireframe,
      wireframe = _ref6$wireframe === undefined ? false : _ref6$wireframe;

  var multiplier = wireframe ? 2 : 5;
  var colors = new Uint8ClampedArray(pointCount * 4 * multiplier);
  var vertexIndex = 0;

  groupedVertices.forEach(function (complexPolygon, polygonIndex) {
    var color = getColor(polygonIndex);
    color[3] = Number.isFinite(color[3]) ? color[3] : 255;

    var numVertices = Polygon.getVertexCount(complexPolygon);

    fillArray({ target: colors, source: color, start: vertexIndex, count: numVertices * multiplier });
    vertexIndex += color.length * numVertices * multiplier;
  });

  return colors;
}

function calculatePickingColors(_ref7) {
  var groupedVertices = _ref7.groupedVertices,
      pointCount = _ref7.pointCount,
      _ref7$wireframe = _ref7.wireframe,
      wireframe = _ref7$wireframe === undefined ? false : _ref7$wireframe;

  var multiplier = wireframe ? 2 : 5;
  var colors = new Uint8ClampedArray(pointCount * 3 * multiplier);
  var vertexIndex = 0;

  groupedVertices.forEach(function (vertices, polygonIndex) {
    var numVertices = Polygon.getVertexCount(vertices);
    var color = getPickingColor(polygonIndex);

    fillArray({ target: colors, source: color, start: vertexIndex, count: numVertices * multiplier });
    vertexIndex += color.length * numVertices * multiplier;
  });
  return colors;
}

function calculateContourIndices(vertices, offset) {
  var stride = Polygon.getVertexCount(vertices);
  var indices = [];

  vertices.forEach(function (polygon) {
    indices.push(offset);
    var numVertices = polygon.length;

    // polygon top
    // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    for (var i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset);

    // polygon sides
    for (var _i = 0; _i < numVertices - 1; _i++) {
      indices.push(_i + offset, _i + stride + offset);
    }

    offset += numVertices;
  });

  return indices;
}

function drawSurfaceRectangle(targetArray, offset, stride) {
  targetArray.push(offset + stride, offset + stride * 3, offset + stride * 2 + 1, offset + stride * 2 + 1, offset + stride * 3, offset + stride * 4 + 1);
}

function calculateSurfaceIndices(vertices, offset) {
  var stride = Polygon.getVertexCount(vertices);

  var holes = null;
  var holeCount = vertices.length - 1;

  if (holeCount) {
    holes = [];
    var vertexIndex = 0;
    for (var i = 0; i < holeCount; i++) {
      vertexIndex += vertices[i].length;
      holes[i] = vertexIndex;
    }
  }

  var indices = earcut(flatten(vertices, 3), holes, 3).map(function (index) {
    return index + offset;
  });

  vertices.forEach(function (polygon) {
    var numVertices = polygon.length;

    // polygon sides
    for (var _i2 = 0; _i2 < numVertices - 1; _i2++) {
      drawSurfaceRectangle(indices, offset + _i2, stride);
    }

    offset += numVertices;
  });

  return indices;
}

// helpers

// get normal vector of line segment
function getNormal(p1, p2) {
  return [p1[1] - p2[1], p2[0] - p1[0], 0];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24tdGVzc2VsYXRvci1leHRydWRlZC5qcyJdLCJuYW1lcyI6WyJQb2x5Z29uIiwiZXhwZXJpbWVudGFsIiwiZnA2NGlmeSIsImZpbGxBcnJheSIsImVhcmN1dCIsImdldFBpY2tpbmdDb2xvciIsImluZGV4IiwiYXJyYXlQdXNoIiwiYXJyYXkiLCJ2YWx1ZXMiLCJsZW5ndGgiLCJvZmZzZXQiLCJmbGF0dGVuIiwibGV2ZWwiLCJyZXN1bHQiLCJmb3JFYWNoIiwidiIsIkRFRkFVTFRfQ09MT1IiLCJQb2x5Z29uVGVzc2VsYXRvckV4dHJ1ZGVkIiwicG9seWdvbnMiLCJnZXRIZWlnaHQiLCJnZXRDb2xvciIsIndpcmVmcmFtZSIsImZwNjQiLCJtYXAiLCJjb21wbGV4UG9seWdvbiIsInBvbHlnb25JbmRleCIsImhlaWdodCIsIm5vcm1hbGl6ZSIsInBvbHlnb24iLCJjb29yZCIsImdyb3VwZWRWZXJ0aWNlcyIsInBvaW50Q291bnQiLCJnZXRQb2ludENvdW50IiwiYXR0cmlidXRlcyIsInBvc2l0aW9uc0pTIiwiY2FsY3VsYXRlUG9zaXRpb25zSlMiLCJPYmplY3QiLCJhc3NpZ24iLCJwb3NpdGlvbnMiLCJjYWxjdWxhdGVQb3NpdGlvbnMiLCJpbmRpY2VzIiwiY2FsY3VsYXRlSW5kaWNlcyIsIm5vcm1hbHMiLCJjYWxjdWxhdGVOb3JtYWxzIiwicGlja2luZ0NvbG9ycyIsImNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMiLCJjYWxjdWxhdGVDb2xvcnMiLCJyZWR1Y2UiLCJwb2ludHMiLCJnZXRWZXJ0ZXhDb3VudCIsIm11bHRpcGxpZXIiLCJvZmZzZXRzIiwidmVydGV4SW5kZXgiLCJ2ZXJ0aWNlcyIsInB1c2giLCJjYWxjdWxhdGVDb250b3VySW5kaWNlcyIsImNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzIiwiVWludDMyQXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJ0b3BWZXJ0aWNlcyIsImJhc2VWZXJ0aWNlcyIsInNsaWNlIiwiaSIsImxlbiIsInRhcmdldCIsInNvdXJjZSIsInN0YXJ0IiwiY291bnQiLCJwb3NpdGlvbkxvdyIsInZlcnRleENvdW50IiwicG9zaXRpb25zNjR4eUxvdyIsInVwIiwic2lkZU5vcm1hbHNGb3J3YXJkIiwic2lkZU5vcm1hbHNCYWNrd2FyZCIsInNpZGVOb3JtYWxzIiwiY2FsY3VsYXRlU2lkZU5vcm1hbHMiLCJmaXJzdE5vcm1hbCIsImNvbmNhdCIsImxhc3RWZXJ0aWNlIiwidmVydGljZSIsIm4iLCJnZXROb3JtYWwiLCJjb2xvcnMiLCJVaW50OENsYW1wZWRBcnJheSIsImNvbG9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJudW1WZXJ0aWNlcyIsInN0cmlkZSIsImRyYXdTdXJmYWNlUmVjdGFuZ2xlIiwidGFyZ2V0QXJyYXkiLCJob2xlcyIsImhvbGVDb3VudCIsInAxIiwicDIiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPLEtBQUtBLE9BQVosTUFBeUIsV0FBekI7QUFDQSxTQUFRQyxZQUFSLFFBQTJCLFlBQTNCO0lBQ09DLE8sR0FBc0JELFksQ0FBdEJDLE87SUFBU0MsUyxHQUFhRixZLENBQWJFLFM7O0FBQ2hCLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkI7O0FBRUEsU0FBU0MsZUFBVCxDQUF5QkMsS0FBekIsRUFBZ0M7QUFDOUIsU0FBTyxDQUNKQSxRQUFRLENBQVQsR0FBYyxHQURULEVBRUhBLFFBQVEsQ0FBVCxJQUFlLENBQWhCLEdBQXFCLEdBRmhCLEVBR0ZBLFFBQVEsQ0FBVCxJQUFlLENBQWhCLElBQXNCLENBQXZCLEdBQTRCLEdBSHZCLENBQVA7QUFLRDs7QUFFRCxTQUFTQyxTQUFULENBQW1CQyxLQUFuQixFQUEwQkMsTUFBMUIsRUFBa0M7QUFDaEMsTUFB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O0FBQ0EsU0FBSyxJQUFJcUQsTUFBSSxDQUFiLEVBQWdCQSxNQUFJeUIsY0FBYyxDQUFsQyxFQUFxQ3pCLEtBQXJDLEVBQTBDO0FBQ3hDMkIsMkJBQXFCakQsT0FBckIsRUFBOEI5QixTQUFTb0QsR0FBdkMsRUFBMEMwQixNQUExQztBQUNEOztBQUVEOUUsY0FBVTZFLFdBQVY7QUFDRCxHQVREOztBQVdBLFNBQU8vQyxPQUFQO0FBQ0Q7O0FBRUQ7O0FBRUE7QUFDQSxTQUFTeUMsU0FBVCxDQUFtQlksRUFBbkIsRUFBdUJDLEVBQXZCLEVBQTJCO0FBQ3pCLFNBQU8sQ0FBQ0QsR0FBRyxDQUFILElBQVFDLEdBQUcsQ0FBSCxDQUFULEVBQWdCQSxHQUFHLENBQUgsSUFBUUQsR0FBRyxDQUFILENBQXhCLEVBQStCLENBQS9CLENBQVA7QUFDRCIsImZpbGUiOiJwb2x5Z29uLXRlc3NlbGF0b3ItZXh0cnVkZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0ICogYXMgUG9seWdvbiBmcm9tICcuL3BvbHlnb24nO1xuaW1wb3J0IHtleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2ZwNjRpZnksIGZpbGxBcnJheX0gPSBleHBlcmltZW50YWw7XG5pbXBvcnQgZWFyY3V0IGZyb20gJ2VhcmN1dCc7XG5cbmZ1bmN0aW9uIGdldFBpY2tpbmdDb2xvcihpbmRleCkge1xuICByZXR1cm4gW1xuICAgIChpbmRleCArIDEpICYgMjU1LFxuICAgICgoaW5kZXggKyAxKSA+PiA4KSAmIDI1NSxcbiAgICAoKChpbmRleCArIDEpID4+IDgpID4+IDgpICYgMjU1XG4gIF07XG59XG5cbmZ1bmN0aW9uIGFycmF5UHVzaChhcnJheSwgdmFsdWVzKSB7XG4gIGNvbnN0IGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gIGxldCBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIGFycmF5W29mZnNldCsrXSA9IHZhbHVlc1tpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKHZhbHVlcywgbGV2ZWwsIHJlc3VsdCA9IFtdKSB7XG4gIGlmIChsZXZlbCA+IDEpIHtcbiAgICB2YWx1ZXMuZm9yRWFjaCh2ID0+IGZsYXR0ZW4odiwgbGV2ZWwgLSAxLCByZXN1bHQpKTtcbiAgfSBlbHNlIHtcbiAgICBhcnJheVB1c2gocmVzdWx0LCB2YWx1ZXMpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MT1IgPSBbMCwgMCwgMCwgMjU1XTsgLy8gQmxhY2tcblxuZXhwb3J0IGNsYXNzIFBvbHlnb25UZXNzZWxhdG9yRXh0cnVkZWQge1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBwb2x5Z29ucyxcbiAgICBnZXRIZWlnaHQgPSB4ID0+IDEwMDAsXG4gICAgZ2V0Q29sb3IgPSB4ID0+IERFRkFVTFRfQ09MT1IsXG4gICAgd2lyZWZyYW1lID0gZmFsc2UsXG4gICAgZnA2NCA9IGZhbHNlXG4gIH0pIHtcbiAgICB0aGlzLmZwNjQgPSBmcDY0O1xuXG4gICAgLy8gRXhwZW5zaXZlIG9wZXJhdGlvbiwgY29udmVydCBhbGwgcG9seWdvbnMgdG8gYXJyYXlzXG4gICAgcG9seWdvbnMgPSBwb2x5Z29ucy5tYXAoKGNvbXBsZXhQb2x5Z29uLCBwb2x5Z29uSW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGhlaWdodCA9IGdldEhlaWdodChwb2x5Z29uSW5kZXgpIHx8IDA7XG4gICAgICByZXR1cm4gUG9seWdvbi5ub3JtYWxpemUoY29tcGxleFBvbHlnb24pLm1hcChcbiAgICAgICAgcG9seWdvbiA9PiBwb2x5Z29uLm1hcChjb29yZCA9PiBbY29vcmRbMF0sIGNvb3JkWzFdLCBoZWlnaHRdKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGdyb3VwZWRWZXJ0aWNlcyA9IHBvbHlnb25zO1xuICAgIHRoaXMuZ3JvdXBlZFZlcnRpY2VzID0gcG9seWdvbnM7XG4gICAgY29uc3QgcG9pbnRDb3VudCA9IGdldFBvaW50Q291bnQocG9seWdvbnMpO1xuICAgIHRoaXMucG9pbnRDb3VudCA9IHBvaW50Q291bnQ7XG4gICAgdGhpcy53aXJlZnJhbWUgPSB3aXJlZnJhbWU7XG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGNvbnN0IHBvc2l0aW9uc0pTID0gY2FsY3VsYXRlUG9zaXRpb25zSlMoe2dyb3VwZWRWZXJ0aWNlcywgcG9pbnRDb3VudCwgd2lyZWZyYW1lfSk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIHtcbiAgICAgIHBvc2l0aW9uczogY2FsY3VsYXRlUG9zaXRpb25zKHBvc2l0aW9uc0pTLCB0aGlzLmZwNjQpLFxuICAgICAgaW5kaWNlczogY2FsY3VsYXRlSW5kaWNlcyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWV9KSxcbiAgICAgIG5vcm1hbHM6IGNhbGN1bGF0ZU5vcm1hbHMoe2dyb3VwZWRWZXJ0aWNlcywgcG9pbnRDb3VudCwgd2lyZWZyYW1lfSksXG4gICAgICAvLyBjb2xvcnM6IGNhbGN1bGF0ZUNvbG9ycyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWUsIGdldENvbG9yfSksXG4gICAgICBwaWNraW5nQ29sb3JzOiBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKHtncm91cGVkVmVydGljZXMsIHBvaW50Q291bnQsIHdpcmVmcmFtZX0pXG4gICAgfSk7XG4gIH1cblxuICBpbmRpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXMuaW5kaWNlcztcbiAgfVxuXG4gIHBvc2l0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9ucztcbiAgfVxuXG4gIG5vcm1hbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcy5ub3JtYWxzO1xuICB9XG5cbiAgY29sb3JzKHtnZXRDb2xvciA9IHggPT4gREVGQVVMVF9DT0xPUn0gPSB7fSkge1xuICAgIGNvbnN0IHtncm91cGVkVmVydGljZXMsIHBvaW50Q291bnQsIHdpcmVmcmFtZX0gPSB0aGlzO1xuICAgIHJldHVybiBjYWxjdWxhdGVDb2xvcnMoe2dyb3VwZWRWZXJ0aWNlcywgcG9pbnRDb3VudCwgd2lyZWZyYW1lLCBnZXRDb2xvcn0pO1xuICB9XG5cbiAgcGlja2luZ0NvbG9ycygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzLnBpY2tpbmdDb2xvcnM7XG4gIH1cblxuICAvLyB1cGRhdGVUcmlnZ2Vyczoge1xuICAvLyAgIHBvc2l0aW9uczogWydnZXRIZWlnaHQnXSxcbiAgLy8gICBjb2xvcnM6IFsnZ2V0Q29sb3JzJ11cbiAgLy8gICBwaWNraW5nQ29sb3JzOiAnbm9uZSdcbiAgLy8gfVxufVxuXG4vLyBDb3VudCBudW1iZXIgb2YgcG9pbnRzIGluIGEgbGlzdCBvZiBjb21wbGV4IHBvbHlnb25zXG5mdW5jdGlvbiBnZXRQb2ludENvdW50KHBvbHlnb25zKSB7XG4gIHJldHVybiBwb2x5Z29ucy5yZWR1Y2UoKHBvaW50cywgcG9seWdvbikgPT4gcG9pbnRzICsgUG9seWdvbi5nZXRWZXJ0ZXhDb3VudChwb2x5Z29uKSwgMCk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUluZGljZXMoe2dyb3VwZWRWZXJ0aWNlcywgd2lyZWZyYW1lID0gZmFsc2V9KSB7XG4gIC8vIGFkanVzdCBpbmRleCBvZmZzZXQgZm9yIG11bHRpcGxlIHBvbHlnb25zXG4gIGNvbnN0IG11bHRpcGxpZXIgPSB3aXJlZnJhbWUgPyAyIDogNTtcbiAgY29uc3Qgb2Zmc2V0cyA9IFtdO1xuICBncm91cGVkVmVydGljZXMucmVkdWNlKCh2ZXJ0ZXhJbmRleCwgdmVydGljZXMpID0+IHtcbiAgICBvZmZzZXRzLnB1c2godmVydGV4SW5kZXgpO1xuICAgIHJldHVybiB2ZXJ0ZXhJbmRleCArIFBvbHlnb24uZ2V0VmVydGV4Q291bnQodmVydGljZXMpICogbXVsdGlwbGllcjtcbiAgfSwgMCk7XG5cbiAgY29uc3QgaW5kaWNlcyA9IGdyb3VwZWRWZXJ0aWNlcy5tYXAoKHZlcnRpY2VzLCBwb2x5Z29uSW5kZXgpID0+XG4gICAgd2lyZWZyYW1lID9cbiAgICAgIC8vIDEuIGdldCBzZXF1ZW50aWFsbHkgb3JkZXJlZCBpbmRpY2VzIG9mIGVhY2ggcG9seWdvbnMgd2lyZWZyYW1lXG4gICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgcG9seWdvbnNcbiAgICAgIGNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXRzW3BvbHlnb25JbmRleF0pIDpcbiAgICAgIC8vIDEuIGdldCB0cmlhbmd1bGF0ZWQgaW5kaWNlcyBmb3IgdGhlIGludGVybmFsIGFyZWFzXG4gICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgcG9seWdvbnNcbiAgICAgIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXRzW3BvbHlnb25JbmRleF0pXG4gICk7XG5cbiAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShmbGF0dGVuKGluZGljZXMsIDIpKTtcbn1cblxuLy8gQ2FsY3VsYXRlIGEgZmxhdCBwb3NpdGlvbiBhcnJheSBpbiBKUyAtIGNhbiBiZSBtYXBwZWQgdG8gMzIgb3IgNjQgYml0IHR5cGVkIGFycmF5c1xuLy8gUmVtYXJrczpcbi8vICogZWFjaCB0b3AgdmVydGV4IGlzIG9uIDMgc3VyZmFjZXNcbi8vICogZWFjaCBib3R0b20gdmVydGV4IGlzIG9uIDIgc3VyZmFjZXNcbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uc0pTKHtncm91cGVkVmVydGljZXMsIHBvaW50Q291bnQsIHdpcmVmcmFtZSA9IGZhbHNlfSkge1xuICBjb25zdCBtdWx0aXBsaWVyID0gd2lyZWZyYW1lID8gMiA6IDU7XG4gIGNvbnN0IHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkocG9pbnRDb3VudCAqIDMgKiBtdWx0aXBsaWVyKTtcbiAgbGV0IHZlcnRleEluZGV4ID0gMDtcblxuICBncm91cGVkVmVydGljZXMuZm9yRWFjaChcbiAgICB2ZXJ0aWNlcyA9PiB7XG4gICAgICBjb25zdCB0b3BWZXJ0aWNlcyA9IGZsYXR0ZW4odmVydGljZXMsIDMpO1xuXG4gICAgICBjb25zdCBiYXNlVmVydGljZXMgPSB0b3BWZXJ0aWNlcy5zbGljZSgwKTtcbiAgICAgIGxldCBpID0gdG9wVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICAgIHdoaWxlIChpID4gMCkge1xuICAgICAgICBiYXNlVmVydGljZXNbaV0gPSAwO1xuICAgICAgICBpIC09IDM7XG4gICAgICB9XG4gICAgICBjb25zdCBsZW4gPSB0b3BWZXJ0aWNlcy5sZW5ndGg7XG5cbiAgICAgIGlmICh3aXJlZnJhbWUpIHtcbiAgICAgICAgZmlsbEFycmF5KHt0YXJnZXQ6IHBvc2l0aW9ucywgc291cmNlOiB0b3BWZXJ0aWNlcywgc3RhcnQ6IHZlcnRleEluZGV4fSk7XG4gICAgICAgIGZpbGxBcnJheSh7dGFyZ2V0OiBwb3NpdGlvbnMsIHNvdXJjZTogYmFzZVZlcnRpY2VzLCBzdGFydDogdmVydGV4SW5kZXggKyBsZW59KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGxBcnJheSh7dGFyZ2V0OiBwb3NpdGlvbnMsIHNvdXJjZTogdG9wVmVydGljZXMsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCwgY291bnQ6IDN9KTtcbiAgICAgICAgZmlsbEFycmF5KHt0YXJnZXQ6IHBvc2l0aW9ucywgc291cmNlOiBiYXNlVmVydGljZXMsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCArIGxlbiAqIDMsXG4gICAgICAgICAgY291bnQ6IDJ9KTtcbiAgICAgIH1cbiAgICAgIHZlcnRleEluZGV4ICs9IGxlbiAqIG11bHRpcGxpZXI7XG4gICAgfVxuICApO1xuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9ucyhwb3NpdGlvbnNKUywgZnA2NCkge1xuICBsZXQgcG9zaXRpb25Mb3c7XG4gIGlmIChmcDY0KSB7XG4gICAgLy8gV2Ugb25seSBuZWVkIHgsIHkgY29tcG9uZW50XG4gICAgY29uc3QgdmVydGV4Q291bnQgPSBwb3NpdGlvbnNKUy5sZW5ndGggLyAzO1xuICAgIHBvc2l0aW9uTG93ID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhDb3VudCAqIDIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGV4Q291bnQ7IGkrKykge1xuICAgICAgcG9zaXRpb25Mb3dbaSAqIDIgKyAwXSA9IGZwNjRpZnkocG9zaXRpb25zSlNbaSAqIDMgKyAwXSlbMV07XG4gICAgICBwb3NpdGlvbkxvd1tpICogMiArIDFdID0gZnA2NGlmeShwb3NpdGlvbnNKU1tpICogMyArIDFdKVsxXTtcbiAgICB9XG5cbiAgfVxuICByZXR1cm4ge3Bvc2l0aW9uczogcG9zaXRpb25zSlMsIHBvc2l0aW9uczY0eHlMb3c6IHBvc2l0aW9uTG93fTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlTm9ybWFscyh7Z3JvdXBlZFZlcnRpY2VzLCBwb2ludENvdW50LCB3aXJlZnJhbWV9KSB7XG4gIGNvbnN0IHVwID0gWzAsIDAsIDFdO1xuICBjb25zdCBtdWx0aXBsaWVyID0gd2lyZWZyYW1lID8gMiA6IDU7XG5cbiAgY29uc3Qgbm9ybWFscyA9IG5ldyBGbG9hdDMyQXJyYXkocG9pbnRDb3VudCAqIDMgKiBtdWx0aXBsaWVyKTtcbiAgbGV0IHZlcnRleEluZGV4ID0gMDtcblxuICBpZiAod2lyZWZyYW1lKSB7XG4gICAgcmV0dXJuIGZpbGxBcnJheSh7dGFyZ2V0OiBub3JtYWxzLCBzb3VyY2U6IHVwLCBjb3VudDogcG9pbnRDb3VudCAqIG11bHRpcGxpZXJ9KTtcbiAgfVxuXG4gIGdyb3VwZWRWZXJ0aWNlcy5tYXAoKHZlcnRpY2VzLCBwb2x5Z29uSW5kZXgpID0+IHtcbiAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IFBvbHlnb24uZ2V0VmVydGV4Q291bnQodmVydGljZXMpO1xuXG4gICAgZmlsbEFycmF5KHt0YXJnZXQ6IG5vcm1hbHMsIHNvdXJjZTogdXAsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCwgY291bnQ6IHZlcnRleENvdW50fSk7XG4gICAgdmVydGV4SW5kZXggKz0gdmVydGV4Q291bnQgKiAzO1xuXG4gICAgY29uc3Qgc2lkZU5vcm1hbHNGb3J3YXJkID0gW107XG4gICAgY29uc3Qgc2lkZU5vcm1hbHNCYWNrd2FyZCA9IFtdO1xuXG4gICAgdmVydGljZXMuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgIGNvbnN0IHNpZGVOb3JtYWxzID0gY2FsY3VsYXRlU2lkZU5vcm1hbHMocG9seWdvbik7XG4gICAgICBjb25zdCBmaXJzdE5vcm1hbCA9IHNpZGVOb3JtYWxzLnNsaWNlKDAsIDMpO1xuXG4gICAgICBhcnJheVB1c2goc2lkZU5vcm1hbHNGb3J3YXJkLCBzaWRlTm9ybWFscyk7XG4gICAgICBhcnJheVB1c2goc2lkZU5vcm1hbHNGb3J3YXJkLCBmaXJzdE5vcm1hbCk7XG5cbiAgICAgIGFycmF5UHVzaChzaWRlTm9ybWFsc0JhY2t3YXJkLCBmaXJzdE5vcm1hbCk7XG4gICAgICBhcnJheVB1c2goc2lkZU5vcm1hbHNCYWNrd2FyZCwgc2lkZU5vcm1hbHMpO1xuICAgIH0pO1xuXG4gICAgZmlsbEFycmF5KHt0YXJnZXQ6IG5vcm1hbHMsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCwgY291bnQ6IDIsXG4gICAgICBzb3VyY2U6IHNpZGVOb3JtYWxzRm9yd2FyZC5jb25jYXQoc2lkZU5vcm1hbHNCYWNrd2FyZCl9KTtcbiAgICB2ZXJ0ZXhJbmRleCArPSB2ZXJ0ZXhDb3VudCAqIDMgKiA0O1xuICB9KTtcblxuICByZXR1cm4gbm9ybWFscztcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlU2lkZU5vcm1hbHModmVydGljZXMpIHtcbiAgY29uc3Qgbm9ybWFscyA9IFtdO1xuXG4gIGxldCBsYXN0VmVydGljZSA9IG51bGw7XG4gIGZvciAoY29uc3QgdmVydGljZSBvZiB2ZXJ0aWNlcykge1xuICAgIGlmIChsYXN0VmVydGljZSkge1xuICAgICAgLy8gdmVydGV4W2ktMV0sIHZlcnRleFtpXVxuICAgICAgY29uc3QgbiA9IGdldE5vcm1hbChsYXN0VmVydGljZSwgdmVydGljZSk7XG4gICAgICBhcnJheVB1c2gobm9ybWFscywgbik7XG4gICAgfVxuICAgIGxhc3RWZXJ0aWNlID0gdmVydGljZTtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxzO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVDb2xvcnMoe2dyb3VwZWRWZXJ0aWNlcywgcG9pbnRDb3VudCwgZ2V0Q29sb3IsIHdpcmVmcmFtZSA9IGZhbHNlfSkge1xuICBjb25zdCBtdWx0aXBsaWVyID0gd2lyZWZyYW1lID8gMiA6IDU7XG4gIGNvbnN0IGNvbG9ycyA9IG5ldyBVaW50OENsYW1wZWRBcnJheShwb2ludENvdW50ICogNCAqIG11bHRpcGxpZXIpO1xuICBsZXQgdmVydGV4SW5kZXggPSAwO1xuXG4gIGdyb3VwZWRWZXJ0aWNlcy5mb3JFYWNoKChjb21wbGV4UG9seWdvbiwgcG9seWdvbkluZGV4KSA9PiB7XG4gICAgY29uc3QgY29sb3IgPSBnZXRDb2xvcihwb2x5Z29uSW5kZXgpO1xuICAgIGNvbG9yWzNdID0gTnVtYmVyLmlzRmluaXRlKGNvbG9yWzNdKSA/IGNvbG9yWzNdIDogMjU1O1xuXG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBQb2x5Z29uLmdldFZlcnRleENvdW50KGNvbXBsZXhQb2x5Z29uKTtcblxuICAgIGZpbGxBcnJheSh7dGFyZ2V0OiBjb2xvcnMsIHNvdXJjZTogY29sb3IsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCwgY291bnQ6IG51bVZlcnRpY2VzICogbXVsdGlwbGllcn0pO1xuICAgIHZlcnRleEluZGV4ICs9IGNvbG9yLmxlbmd0aCAqIG51bVZlcnRpY2VzICogbXVsdGlwbGllcjtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbG9ycztcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUGlja2luZ0NvbG9ycyh7Z3JvdXBlZFZlcnRpY2VzLCBwb2ludENvdW50LCB3aXJlZnJhbWUgPSBmYWxzZX0pIHtcbiAgY29uc3QgbXVsdGlwbGllciA9IHdpcmVmcmFtZSA/IDIgOiA1O1xuICBjb25zdCBjb2xvcnMgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkocG9pbnRDb3VudCAqIDMgKiBtdWx0aXBsaWVyKTtcbiAgbGV0IHZlcnRleEluZGV4ID0gMDtcblxuICBncm91cGVkVmVydGljZXMuZm9yRWFjaCgodmVydGljZXMsIHBvbHlnb25JbmRleCkgPT4ge1xuICAgIGNvbnN0IG51bVZlcnRpY2VzID0gUG9seWdvbi5nZXRWZXJ0ZXhDb3VudCh2ZXJ0aWNlcyk7XG4gICAgY29uc3QgY29sb3IgPSBnZXRQaWNraW5nQ29sb3IocG9seWdvbkluZGV4KTtcblxuICAgIGZpbGxBcnJheSh7dGFyZ2V0OiBjb2xvcnMsIHNvdXJjZTogY29sb3IsIHN0YXJ0OiB2ZXJ0ZXhJbmRleCwgY291bnQ6IG51bVZlcnRpY2VzICogbXVsdGlwbGllcn0pO1xuICAgIHZlcnRleEluZGV4ICs9IGNvbG9yLmxlbmd0aCAqIG51bVZlcnRpY2VzICogbXVsdGlwbGllcjtcbiAgfSk7XG4gIHJldHVybiBjb2xvcnM7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXQpIHtcbiAgY29uc3Qgc3RyaWRlID0gUG9seWdvbi5nZXRWZXJ0ZXhDb3VudCh2ZXJ0aWNlcyk7XG4gIGNvbnN0IGluZGljZXMgPSBbXTtcblxuICB2ZXJ0aWNlcy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgIGluZGljZXMucHVzaChvZmZzZXQpO1xuICAgIGNvbnN0IG51bVZlcnRpY2VzID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgICAvLyBwb2x5Z29uIHRvcFxuICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIEdMLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMucHVzaChpICsgb2Zmc2V0LCBpICsgb2Zmc2V0KTtcbiAgICB9XG4gICAgaW5kaWNlcy5wdXNoKG9mZnNldCk7XG5cbiAgICAvLyBwb2x5Z29uIHNpZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgaW5kaWNlcy5wdXNoKGkgKyBvZmZzZXQsIGkgKyBzdHJpZGUgKyBvZmZzZXQpO1xuICAgIH1cblxuICAgIG9mZnNldCArPSBudW1WZXJ0aWNlcztcbiAgfSk7XG5cbiAgcmV0dXJuIGluZGljZXM7XG59XG5cbmZ1bmN0aW9uIGRyYXdTdXJmYWNlUmVjdGFuZ2xlKHRhcmdldEFycmF5LCBvZmZzZXQsIHN0cmlkZSkge1xuICB0YXJnZXRBcnJheS5wdXNoKFxuICAgIG9mZnNldCArIHN0cmlkZSxcbiAgICBvZmZzZXQgKyBzdHJpZGUgKiAzLFxuICAgIG9mZnNldCArIHN0cmlkZSAqIDIgKyAxLFxuICAgIG9mZnNldCArIHN0cmlkZSAqIDIgKyAxLFxuICAgIG9mZnNldCArIHN0cmlkZSAqIDMsXG4gICAgb2Zmc2V0ICsgc3RyaWRlICogNCArIDFcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlU3VyZmFjZUluZGljZXModmVydGljZXMsIG9mZnNldCkge1xuICBjb25zdCBzdHJpZGUgPSBQb2x5Z29uLmdldFZlcnRleENvdW50KHZlcnRpY2VzKTtcblxuICBsZXQgaG9sZXMgPSBudWxsO1xuICBjb25zdCBob2xlQ291bnQgPSB2ZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gIGlmIChob2xlQ291bnQpIHtcbiAgICBob2xlcyA9IFtdO1xuICAgIGxldCB2ZXJ0ZXhJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob2xlQ291bnQ7IGkrKykge1xuICAgICAgdmVydGV4SW5kZXggKz0gdmVydGljZXNbaV0ubGVuZ3RoO1xuICAgICAgaG9sZXNbaV0gPSB2ZXJ0ZXhJbmRleDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBpbmRpY2VzID0gZWFyY3V0KGZsYXR0ZW4odmVydGljZXMsIDMpLCBob2xlcywgMykubWFwKGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0KTtcblxuICB2ZXJ0aWNlcy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgIGNvbnN0IG51bVZlcnRpY2VzID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgICAvLyBwb2x5Z29uIHNpZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgZHJhd1N1cmZhY2VSZWN0YW5nbGUoaW5kaWNlcywgb2Zmc2V0ICsgaSwgc3RyaWRlKTtcbiAgICB9XG5cbiAgICBvZmZzZXQgKz0gbnVtVmVydGljZXM7XG4gIH0pO1xuXG4gIHJldHVybiBpbmRpY2VzO1xufVxuXG4vLyBoZWxwZXJzXG5cbi8vIGdldCBub3JtYWwgdmVjdG9yIG9mIGxpbmUgc2VnbWVudFxuZnVuY3Rpb24gZ2V0Tm9ybWFsKHAxLCBwMikge1xuICByZXR1cm4gW3AxWzFdIC0gcDJbMV0sIHAyWzBdIC0gcDFbMF0sIDBdO1xufVxuIl19