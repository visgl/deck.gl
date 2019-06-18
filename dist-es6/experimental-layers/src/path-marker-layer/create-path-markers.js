import { Vector2 } from 'math.gl';

function getLineLength(vPoints) {
  // calculate total length
  var lineLength = 0;
  for (var i = 0; i < vPoints.length - 1; i++) {
    lineLength += vPoints[i].distance(vPoints[i + 1]);
  }
  return lineLength;
}

var DEFAULT_COLOR = [0, 0, 0, 255];
var DEFAULT_DIRECTION = { forward: true, backward: false };

export default function createPathMarkers(_ref) {
  var data = _ref.data,
      _ref$getPath = _ref.getPath,
      getPath = _ref$getPath === undefined ? function (x) {
    return x.path;
  } : _ref$getPath,
      _ref$getDirection = _ref.getDirection,
      getDirection = _ref$getDirection === undefined ? function (x) {
    return x.direction;
  } : _ref$getDirection,
      _ref$getColor = _ref.getColor,
      getColor = _ref$getColor === undefined ? function (x) {
    return DEFAULT_COLOR;
  } : _ref$getColor,
      _ref$getMarkerPercent = _ref.getMarkerPercentages,
      getMarkerPercentages = _ref$getMarkerPercent === undefined ? function (x) {
    return [0.5];
  } : _ref$getMarkerPercent,
      projectFlat = _ref.projectFlat;

  var markers = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var object = _step.value;

      var path = getPath(object);
      var direction = getDirection(object) || DEFAULT_DIRECTION;
      var color = getColor(object);

      var vPoints = path.map(function (p) {
        return new Vector2(p);
      });
      var vPointsReverse = vPoints.slice(0).reverse();

      // calculate total length
      var lineLength = getLineLength(vPoints);

      // Ask for where to put markers
      var percentages = getMarkerPercentages(object, { lineLength: lineLength });

      // Create the markers
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = percentages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var percentage = _step2.value;


          if (direction.forward) {
            var marker = createMarkerAlongPath({ path: vPoints, percentage: percentage, lineLength: lineLength, color: color, object: object, projectFlat: projectFlat });
            markers.push(marker);
          }

          if (direction.backward) {
            var _marker = createMarkerAlongPath({ path: vPointsReverse, percentage: percentage, lineLength: lineLength, color: color, object: object, projectFlat: projectFlat });
            markers.push(_marker);
          }
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

  return markers;
}

function createMarkerAlongPath(_ref2) {
  var path = _ref2.path,
      percentage = _ref2.percentage,
      lineLength = _ref2.lineLength,
      color = _ref2.color,
      object = _ref2.object,
      projectFlat = _ref2.projectFlat;

  var distanceAlong = lineLength * percentage;
  var currentDistance = 0;
  var previousDistance = 0;
  var i = 0;
  for (i = 0; i < path.length - 1; i++) {
    currentDistance += path[i].distance(path[i + 1]);
    if (currentDistance > distanceAlong) {
      break;
    }
    previousDistance = currentDistance;
  }

  var vDirection = path[i + 1].clone().subtract(path[i]).normalize();
  var along = distanceAlong - previousDistance;
  var vCenter = vDirection.clone().multiply(new Vector2(along, along)).add(path[i]);

  var vDirection2 = new Vector2(projectFlat(path[i + 1])).subtract(projectFlat(path[i]));
  var angle = -vDirection2.verticalAngle() * 180 / Math.PI;

  return { position: [vCenter.x, vCenter.y, 0], angle: angle, color: color, object: object };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9wYXRoLW1hcmtlci1sYXllci9jcmVhdGUtcGF0aC1tYXJrZXJzLmpzIl0sIm5hbWVzIjpbIlZlY3RvcjIiLCJnZXRMaW5lTGVuZ3RoIiwidlBvaW50cyIsImxpbmVMZW5ndGgiLCJpIiwibGVuZ3RoIiwiZGlzdGFuY2UiLCJERUZBVUxUX0NPTE9SIiwiREVGQVVMVF9ESVJFQ1RJT04iLCJmb3J3YXJkIiwiYmFja3dhcmQiLCJjcmVhdGVQYXRoTWFya2VycyIsImRhdGEiLCJnZXRQYXRoIiwieCIsInBhdGgiLCJnZXREaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJnZXRDb2xvciIsImdldE1hcmtlclBlcmNlbnRhZ2VzIiwicHJvamVjdEZsYXQiLCJtYXJrZXJzIiwib2JqZWN0IiwiY29sb3IiLCJtYXAiLCJwIiwidlBvaW50c1JldmVyc2UiLCJzbGljZSIsInJldmVyc2UiLCJwZXJjZW50YWdlcyIsInBlcmNlbnRhZ2UiLCJtYXJrZXIiLCJjcmVhdGVNYXJrZXJBbG9uZ1BhdGgiLCJwdXNoIiwiZGlzdGFuY2VBbG9uZyIsImN1cnJlbnREaXN0YW5jZSIsInByZXZpb3VzRGlzdGFuY2UiLCJ2RGlyZWN0aW9uIiwiY2xvbmUiLCJzdWJ0cmFjdCIsIm5vcm1hbGl6ZSIsImFsb25nIiwidkNlbnRlciIsIm11bHRpcGx5IiwiYWRkIiwidkRpcmVjdGlvbjIiLCJhbmdsZSIsInZlcnRpY2FsQW5nbGUiLCJNYXRoIiwiUEkiLCJwb3NpdGlvbiIsInkiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVFBLE9BQVIsUUFBc0IsU0FBdEI7O0FBRUEsU0FBU0MsYUFBVCxDQUF1QkMsT0FBdkIsRUFBZ0M7QUFDOUI7QUFDQSxNQUFJQyxhQUFhLENBQWpCO0FBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLFFBQVFHLE1BQVIsR0FBaUIsQ0FBckMsRUFBd0NELEdBQXhDLEVBQTZDO0FBQzNDRCxr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UUFBUVMsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FBWCxFQUFzQ0wsWUFBdEMsRUFBNkN2QixZQUE3QyxFQUFvREQsY0FBcEQsRUFBUDtBQUNEIiwiZmlsZSI6ImNyZWF0ZS1wYXRoLW1hcmtlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1ZlY3RvcjJ9IGZyb20gJ21hdGguZ2wnO1xuXG5mdW5jdGlvbiBnZXRMaW5lTGVuZ3RoKHZQb2ludHMpIHtcbiAgLy8gY2FsY3VsYXRlIHRvdGFsIGxlbmd0aFxuICBsZXQgbGluZUxlbmd0aCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdlBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBsaW5lTGVuZ3RoICs9IHZQb2ludHNbaV0uZGlzdGFuY2UodlBvaW50c1tpICsgMV0pO1xuICB9XG4gIHJldHVybiBsaW5lTGVuZ3RoO1xufVxuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5jb25zdCBERUZBVUxUX0RJUkVDVElPTiA9IHtmb3J3YXJkOiB0cnVlLCBiYWNrd2FyZDogZmFsc2V9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVQYXRoTWFya2Vycyh7XG4gIGRhdGEsXG4gIGdldFBhdGggPSB4ID0+IHgucGF0aCxcbiAgZ2V0RGlyZWN0aW9uID0geCA9PiB4LmRpcmVjdGlvbixcbiAgZ2V0Q29sb3IgPSB4ID0+IERFRkFVTFRfQ09MT1IsXG4gIGdldE1hcmtlclBlcmNlbnRhZ2VzID0geCA9PiBbMC41XSxcbiAgcHJvamVjdEZsYXRcbn0pIHtcbiAgY29uc3QgbWFya2VycyA9IFtdO1xuXG4gIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICBjb25zdCBwYXRoID0gZ2V0UGF0aChvYmplY3QpO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGdldERpcmVjdGlvbihvYmplY3QpIHx8IERFRkFVTFRfRElSRUNUSU9OO1xuICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3Iob2JqZWN0KTtcblxuICAgIGNvbnN0IHZQb2ludHMgPSBwYXRoLm1hcChwID0+IG5ldyBWZWN0b3IyKHApKTtcbiAgICBjb25zdCB2UG9pbnRzUmV2ZXJzZSA9IHZQb2ludHMuc2xpY2UoMCkucmV2ZXJzZSgpO1xuXG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIGxlbmd0aFxuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBnZXRMaW5lTGVuZ3RoKHZQb2ludHMpO1xuXG4gICAgLy8gQXNrIGZvciB3aGVyZSB0byBwdXQgbWFya2Vyc1xuICAgIGNvbnN0IHBlcmNlbnRhZ2VzID0gZ2V0TWFya2VyUGVyY2VudGFnZXMob2JqZWN0LCB7bGluZUxlbmd0aH0pO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBtYXJrZXJzXG4gICAgZm9yIChjb25zdCBwZXJjZW50YWdlIG9mIHBlcmNlbnRhZ2VzKSB7XG5cbiAgICAgIGlmIChkaXJlY3Rpb24uZm9yd2FyZCkge1xuICAgICAgICBjb25zdCBtYXJrZXIgPSBjcmVhdGVNYXJrZXJBbG9uZ1BhdGgoXG4gICAgICAgICAge3BhdGg6IHZQb2ludHMsIHBlcmNlbnRhZ2UsIGxpbmVMZW5ndGgsIGNvbG9yLCBvYmplY3QsIHByb2plY3RGbGF0fSk7XG4gICAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyZWN0aW9uLmJhY2t3YXJkKSB7XG4gICAgICAgIGNvbnN0IG1hcmtlciA9IGNyZWF0ZU1hcmtlckFsb25nUGF0aChcbiAgICAgICAgICB7cGF0aDogdlBvaW50c1JldmVyc2UsIHBlcmNlbnRhZ2UsIGxpbmVMZW5ndGgsIGNvbG9yLCBvYmplY3QsIHByb2plY3RGbGF0fSk7XG4gICAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hcmtlcnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hcmtlckFsb25nUGF0aCh7cGF0aCwgcGVyY2VudGFnZSwgbGluZUxlbmd0aCwgY29sb3IsIG9iamVjdCwgcHJvamVjdEZsYXR9KSB7XG4gIGNvbnN0IGRpc3RhbmNlQWxvbmcgPSBsaW5lTGVuZ3RoICogcGVyY2VudGFnZTtcbiAgbGV0IGN1cnJlbnREaXN0YW5jZSA9IDA7XG4gIGxldCBwcmV2aW91c0Rpc3RhbmNlID0gMDtcbiAgbGV0IGkgPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjdXJyZW50RGlzdGFuY2UgKz0gcGF0aFtpXS5kaXN0YW5jZShwYXRoW2kgKyAxXSk7XG4gICAgaWYgKGN1cnJlbnREaXN0YW5jZSA+IGRpc3RhbmNlQWxvbmcpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwcmV2aW91c0Rpc3RhbmNlID0gY3VycmVudERpc3RhbmNlO1xuICB9XG5cbiAgY29uc3QgdkRpcmVjdGlvbiA9IHBhdGhbaSArIDFdXG4gICAgLmNsb25lKClcbiAgICAuc3VidHJhY3QocGF0aFtpXSlcbiAgICAubm9ybWFsaXplKCk7XG4gIGNvbnN0IGFsb25nID0gZGlzdGFuY2VBbG9uZyAtIHByZXZpb3VzRGlzdGFuY2U7XG4gIGNvbnN0IHZDZW50ZXIgPSB2RGlyZWN0aW9uXG4gICAgLmNsb25lKClcbiAgICAubXVsdGlwbHkobmV3IFZlY3RvcjIoYWxvbmcsIGFsb25nKSlcbiAgICAuYWRkKHBhdGhbaV0pO1xuXG4gIGNvbnN0IHZEaXJlY3Rpb24yID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQocGF0aFtpICsgMV0pKVxuICAgIC5zdWJ0cmFjdChwcm9qZWN0RmxhdChwYXRoW2ldKSk7XG4gIGNvbnN0IGFuZ2xlID0gLXZEaXJlY3Rpb24yLnZlcnRpY2FsQW5nbGUoKSAqIDE4MCAvIE1hdGguUEk7XG5cbiAgcmV0dXJuIHtwb3NpdGlvbjogW3ZDZW50ZXIueCwgdkNlbnRlci55LCAwXSwgYW5nbGUsIGNvbG9yLCBvYmplY3R9O1xufVxuIl19