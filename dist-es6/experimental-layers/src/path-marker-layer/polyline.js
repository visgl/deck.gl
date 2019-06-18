import { Vector3, clamp } from 'math.gl';

// Return the closest point on a line segment
export function getClosestPointOnLine(_ref) {
  var p = _ref.p,
      p1 = _ref.p1,
      p2 = _ref.p2,
      _ref$clampToLine = _ref.clampToLine,
      clampToLine = _ref$clampToLine === undefined ? true : _ref$clampToLine;

  var lineVector = new Vector3(p2).subtract(p1);
  var pointVector = new Vector3(p).subtract(p1);
  var dotProduct = lineVector.dot(pointVector);
  if (clampToLine) {
    dotProduct = clamp(dotProduct, 0, 1);
  }
  return lineVector.lerp(dotProduct);
}

// Return the closest point on a line segment
export function getClosestPointOnPolyline(_ref2) {
  var p = _ref2.p,
      points = _ref2.points;

  p = new Vector3(p);
  var pClosest = null;
  var distanceSquared = Infinity;
  var index = -1;
  for (var i = 0; i < points.length - 1; ++i) {
    var p1 = points[i];
    var p2 = points[i + 1];
    var pClosestOnLine = getClosestPointOnLine({ p: p, p1: p1, p2: p2 });
    var distanceToLineSquared = p.distanceSquared(pClosestOnLine);
    if (distanceToLineSquared < distanceSquared) {
      distanceSquared = distanceToLineSquared;
      pClosest = pClosestOnLine;
      index = i;
    }
  }
  return {
    point: pClosest,
    index: index,
    p1: points[index],
    p2: points[index + 1],
    distanceSquared: distanceSquared,
    distance: Math.sqrt(distanceSquared)
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9wYXRoLW1hcmtlci1sYXllci9wb2x5bGluZS5qcyJdLCJuYW1lcyI6WyJWZWN0b3IzIiwiY2xhbXAiLCJnZXRDbG9zZXN0UG9pbnRPbkxpbmUiLCJwIiwicDEiLCJwMiIsImNsYW1wVG9MaW5lIiwibGluZVZlY3RvciIsInN1YnRyYWN0IiwicG9pbnRWZWN0b3IiLCJkb3RQcm9kdWN0IiwiZG90IiwibGVycCIsImdldENsb3Nlc3RQb2ludE9uUG9seWxpbmUiLCJwb2ludHMiLCJwQ2xvc2VzdCIsImRpc3RhbmNlU3F1YXJlZCIsIkluZmluaXR5IiwiaW5kZXgiLCJpIiwibGVuZ3RoIiwicENsb3Nlc3RPbkxpbmUiLCJkaXN0YW5jZVRvTGluZVNxdWFyZWQiLCJwb2ludCIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVFBLE9BQVIsRUFBaUJDLEtBQWpCLFFBQTZCLFNBQTdCOztBQUVBO0FBQ0EsT0FBTyxTQUFTQyxxQkFBVCxPQUFnRTtBQUFBLE1BQWhDQyxDQUFnQyxRQUFoQ0EsQ0FBZ0M7QUFBQSxNQUE3QkMsRUFBNkIsUUFBN0JBLEVBQTZCO0FBQUEsTUFBekJDLEVBQXlCLFFBQXpCQSxFQUF5QjtBQUFBLDhCQUFyQkMsV0FBcUI7QUFBQSxNQUFyQkEsV0FBcUIsb0NBQVAsSUFBTzs7QUFDckUsTUFBTUMsYUFBYSxJQUFJUCxPQUFKLENBQVlLLEVBQVosRUFBZ0JHLFFBQWhCLENBQXlCSixFQUF6QixDQUFuQjtBQUNBLE1BQU1LLGNBQWMsSUFBSVQsT0FBSixDQUFZRyxDQUFaLEVBQWVLLFFBQWYsQ0FBd0JKLEVBQXhCLENBQXBCO0FBQ0EsTUFBSU0sYUFBYUgsV0FBV0ksR0FBWCxDQUFlRixXQUFmLENBQWpCO0FBQ0EsTUFBSUgsV0FBSixFQUFpQjtBQUNmSSxpQkFBYVQsTUFBTVMsVUFBTixFQUFrQixDQUFsQixFQUFxQixDQUFyQixDQUFiO0FBQ0Q7QUFDRCxTQUFPSCxXQUFXSyxJQUFYLENBQWdCRixVQUFoQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxPQUFPLFNBQVNHLHlCQUFULFFBQWdEO0FBQUEsTUFBWlYsQ0FBWSxTQUFaQSxDQUFZO0FBQUEsTUFBVFcsTUFBUyxTQUFUQSxNQUFTOztBQUNyRFgsTUFBSSxJQUFJSCxPQUFKLENBQVlHLENBQVosQ0FBSjtBQUNBLE1BQUlZLFdBQVcsSUFBZjtBQUNBLE1BQUlDLGtCQUFrQkMsUUFBdEI7QUFDQSxNQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJTCxPQUFPTSxNQUFQLEdBQWdCLENBQXBDLEVBQXVDLEVBQUVELENBQXpDLEVBQTRDO0FBQzFDLFFBQU1mLEtBQUtVLE9BQU9LLENBQVAsQ0FBWDtBQUNBLFFBQU1kLEtBQUtTLE9BQU9LLElBQUksQ0FBWCxDQUFYO0FBQ0EsUUFBTUUsaUJBQWlCbkIsc0JBQXNCLEVBQUNDLElBQUQsRUFBSUMsTUFBSixFQUFRQyxNQUFSLEVBQXRCLENBQXZCO0FBQ0EsUUFBTWlCLHdCQUF3Qm5CLEVBQUVhLGVBQUYsQ0FBa0JLLGNBQWxCLENBQTlCO0FBQ0EsUUFBSUMsd0JBQXdCTixlQUE1QixFQUE2QztBQUMzQ0Esd0JBQWtCTSxxQkFBbEI7QUFDQVAsaUJBQVdNLGNBQVg7QUFDQUgsY0FBUUMsQ0FBUjtBQUNEO0FBQ0Y7QUFDRCxTQUFPO0FBQ0xJLFdBQU9SLFFBREY7QUFFTEcsZ0JBRks7QUFHTGQsUUFBSVUsT0FBT0ksS0FBUCxDQUhDO0FBSUxiLFFBQUlTLE9BQU9JLFFBQVEsQ0FBZixDQUpDO0FBS0xGLG9DQUxLO0FBTUxRLGNBQVVDLEtBQUtDLElBQUwsQ0FBVVYsZUFBVjtBQU5MLEdBQVA7QUFRRCIsImZpbGUiOiJwb2x5bGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VmVjdG9yMywgY2xhbXB9IGZyb20gJ21hdGguZ2wnO1xuXG4vLyBSZXR1cm4gdGhlIGNsb3Nlc3QgcG9pbnQgb24gYSBsaW5lIHNlZ21lbnRcbmV4cG9ydCBmdW5jdGlvbiBnZXRDbG9zZXN0UG9pbnRPbkxpbmUoe3AsIHAxLCBwMiwgY2xhbXBUb0xpbmUgPSB0cnVlfSkge1xuICBjb25zdCBsaW5lVmVjdG9yID0gbmV3IFZlY3RvcjMocDIpLnN1YnRyYWN0KHAxKTtcbiAgY29uc3QgcG9pbnRWZWN0b3IgPSBuZXcgVmVjdG9yMyhwKS5zdWJ0cmFjdChwMSk7XG4gIGxldCBkb3RQcm9kdWN0ID0gbGluZVZlY3Rvci5kb3QocG9pbnRWZWN0b3IpO1xuICBpZiAoY2xhbXBUb0xpbmUpIHtcbiAgICBkb3RQcm9kdWN0ID0gY2xhbXAoZG90UHJvZHVjdCwgMCwgMSk7XG4gIH1cbiAgcmV0dXJuIGxpbmVWZWN0b3IubGVycChkb3RQcm9kdWN0KTtcbn1cblxuLy8gUmV0dXJuIHRoZSBjbG9zZXN0IHBvaW50IG9uIGEgbGluZSBzZWdtZW50XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdFBvaW50T25Qb2x5bGluZSh7cCwgcG9pbnRzfSkge1xuICBwID0gbmV3IFZlY3RvcjMocCk7XG4gIGxldCBwQ2xvc2VzdCA9IG51bGw7XG4gIGxldCBkaXN0YW5jZVNxdWFyZWQgPSBJbmZpbml0eTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7ICsraSkge1xuICAgIGNvbnN0IHAxID0gcG9pbnRzW2ldO1xuICAgIGNvbnN0IHAyID0gcG9pbnRzW2kgKyAxXTtcbiAgICBjb25zdCBwQ2xvc2VzdE9uTGluZSA9IGdldENsb3Nlc3RQb2ludE9uTGluZSh7cCwgcDEsIHAyfSk7XG4gICAgY29uc3QgZGlzdGFuY2VUb0xpbmVTcXVhcmVkID0gcC5kaXN0YW5jZVNxdWFyZWQocENsb3Nlc3RPbkxpbmUpO1xuICAgIGlmIChkaXN0YW5jZVRvTGluZVNxdWFyZWQgPCBkaXN0YW5jZVNxdWFyZWQpIHtcbiAgICAgIGRpc3RhbmNlU3F1YXJlZCA9IGRpc3RhbmNlVG9MaW5lU3F1YXJlZDtcbiAgICAgIHBDbG9zZXN0ID0gcENsb3Nlc3RPbkxpbmU7XG4gICAgICBpbmRleCA9IGk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgcG9pbnQ6IHBDbG9zZXN0LFxuICAgIGluZGV4LFxuICAgIHAxOiBwb2ludHNbaW5kZXhdLFxuICAgIHAyOiBwb2ludHNbaW5kZXggKyAxXSxcbiAgICBkaXN0YW5jZVNxdWFyZWQsXG4gICAgZGlzdGFuY2U6IE1hdGguc3FydChkaXN0YW5jZVNxdWFyZWQpXG4gIH07XG59XG4iXX0=