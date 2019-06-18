import { Vector2 } from 'math.gl';

function getLineLength(vPoints) {
  // calculate total length
  let lineLength = 0;

  for (let i = 0; i < vPoints.length - 1; i++) {
    lineLength += vPoints[i].distance(vPoints[i + 1]);
  }

  return lineLength;
}

const DEFAULT_COLOR = [0, 0, 0, 255];
const DEFAULT_DIRECTION = {
  forward: true,
  backward: false
};
export default function createPathMarkers({
  data,
  getPath = x => x.path,
  getDirection = x => x.direction,
  getColor = x => DEFAULT_COLOR,
  getMarkerPercentages = x => [0.5],
  projectFlat
}) {
  const markers = [];

  for (const object of data) {
    const path = getPath(object);
    const direction = getDirection(object) || DEFAULT_DIRECTION;
    const color = getColor(object);
    const vPoints = path.map(p => new Vector2(p));
    const vPointsReverse = vPoints.slice(0).reverse(); // calculate total length

    const lineLength = getLineLength(vPoints); // Ask for where to put markers

    const percentages = getMarkerPercentages(object, {
      lineLength
    }); // Create the markers

    for (const percentage of percentages) {
      if (direction.forward) {
        const marker = createMarkerAlongPath({
          path: vPoints,
          percentage,
          lineLength,
          color,
          object,
          projectFlat
        });
        markers.push(marker);
      }

      if (direction.backward) {
        const marker = createMarkerAlongPath({
          path: vPointsReverse,
          percentage,
          lineLength,
          color,
          object,
          projectFlat
        });
        markers.push(marker);
      }
    }
  }

  return markers;
}

function createMarkerAlongPath({
  path,
  percentage,
  lineLength,
  color,
  object,
  projectFlat
}) {
  const distanceAlong = lineLength * percentage;
  let currentDistance = 0;
  let previousDistance = 0;
  let i = 0;

  for (i = 0; i < path.length - 1; i++) {
    currentDistance += path[i].distance(path[i + 1]);

    if (currentDistance > distanceAlong) {
      break;
    }

    previousDistance = currentDistance;
  }

  const vDirection = path[i + 1].clone().subtract(path[i]).normalize();
  const along = distanceAlong - previousDistance;
  const vCenter = vDirection.clone().multiply(new Vector2(along, along)).add(path[i]);
  const vDirection2 = new Vector2(projectFlat(path[i + 1])).subtract(projectFlat(path[i]));
  const angle = -vDirection2.verticalAngle() * 180 / Math.PI;
  return {
    position: [vCenter.x, vCenter.y, 0],
    angle,
    color,
    object
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRoLW1hcmtlci1sYXllci9jcmVhdGUtcGF0aC1tYXJrZXJzLmpzIl0sIm5hbWVzIjpbIlZlY3RvcjIiLCJnZXRMaW5lTGVuZ3RoIiwidlBvaW50cyIsImxpbmVMZW5ndGgiLCJpIiwibGVuZ3RoIiwiZGlzdGFuY2UiLCJERUZBVUxUX0NPTE9SIiwiREVGQVVMVF9ESVJFQ1RJT04iLCJmb3J3YXJkIiwiYmFja3dhcmQiLCJjcmVhdGVQYXRoTWFya2VycyIsImRhdGEiLCJnZXRQYXRoIiwieCIsInBhdGgiLCJnZXREaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJnZXRDb2xvciIsImdldE1hcmtlclBlcmNlbnRhZ2VzIiwicHJvamVjdEZsYXQiLCJtYXJrZXJzIiwib2JqZWN0IiwiY29sb3IiLCJtYXAiLCJwIiwidlBvaW50c1JldmVyc2UiLCJzbGljZSIsInJldmVyc2UiLCJwZXJjZW50YWdlcyIsInBlcmNlbnRhZ2UiLCJtYXJrZXIiLCJjcmVhdGVNYXJrZXJBbG9uZ1BhdGgiLCJwdXNoIiwiZGlzdGFuY2VBbG9uZyIsImN1cnJlbnREaXN0YW5jZSIsInByZXZpb3VzRGlzdGFuY2UiLCJ2RGlyZWN0aW9uIiwiY2xvbmUiLCJzdWJ0cmFjdCIsIm5vcm1hbGl6ZSIsImFsb25nIiwidkNlbnRlciIsIm11bHRpcGx5IiwiYWRkIiwidkRpcmVjdGlvbjIiLCJhbmdsZSIsInZlcnRpY2FsQW5nbGUiLCJNYXRoIiwiUEkiLCJwb3NpdGlvbiIsInkiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVFBLE9BQVIsUUFBc0IsU0FBdEI7O0FBRUEsU0FBU0MsYUFBVCxDQUF1QkMsT0FBdkIsRUFBZ0M7QUFDOUI7QUFDQSxNQUFJQyxhQUFhLENBQWpCOztBQUNBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRixRQUFRRyxNQUFSLEdBQWlCLENBQXJDLEVBQXdDRCxHQUF4QyxFQUE2QztBQUMzQ0Qsa0JBQWNELFFBQVFFLENBQVIsRUFBV0UsUUFBWCxD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U0FIZ0IsRUFBbkI7QUFJQSxRQUFNQyxRQUFRUCxnQkFBZ0JFLGdCQUE5QjtBQUNBLFFBQU1NLFVBQVVMLFdBQ2JDLEtBRGEsR0FFYkssUUFGYSxDQUVKLElBQUkzQyxPQUFKLENBQVl5QyxLQUFaLEVBQW1CQSxLQUFuQixDQUZJLEVBR2JHLEdBSGEsQ0FHVDdCLEtBQUtYLENBQUwsQ0FIUyxDQUFoQjtBQUtBLFFBQU15QyxjQUFjLElBQUk3QyxPQUFKLENBQVlvQixZQUFZTCxLQUFLWCxJQUFJLENBQVQsQ0FBWixDQUFaLEVBQXNDbUMsUUFBdEMsQ0FBK0NuQixZQUFZTCxLQUFLWCxDQUFMLENBQVosQ0FBL0MsQ0FBcEI7QUFDQSxRQUFNMEMsUUFBUyxDQUFDRCxZQUFZRSxhQUFaLEVBQUQsR0FBK0IsR0FBaEMsR0FBdUNDLEtBQUtDLEVBQTFEO0FBRUEsU0FBTztBQUFDQyxjQUFVLENBQUNSLFFBQVE1QixDQUFULEVBQVk0QixRQUFRUyxDQUFwQixFQUF1QixDQUF2QixDQUFYO0FBQXNDTCxTQUF0QztBQUE2Q3ZCLFNBQTdDO0FBQW9ERDtBQUFwRCxHQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1ZlY3RvcjJ9IGZyb20gJ21hdGguZ2wnO1xuXG5mdW5jdGlvbiBnZXRMaW5lTGVuZ3RoKHZQb2ludHMpIHtcbiAgLy8gY2FsY3VsYXRlIHRvdGFsIGxlbmd0aFxuICBsZXQgbGluZUxlbmd0aCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdlBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBsaW5lTGVuZ3RoICs9IHZQb2ludHNbaV0uZGlzdGFuY2UodlBvaW50c1tpICsgMV0pO1xuICB9XG4gIHJldHVybiBsaW5lTGVuZ3RoO1xufVxuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5jb25zdCBERUZBVUxUX0RJUkVDVElPTiA9IHtmb3J3YXJkOiB0cnVlLCBiYWNrd2FyZDogZmFsc2V9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVQYXRoTWFya2Vycyh7XG4gIGRhdGEsXG4gIGdldFBhdGggPSB4ID0+IHgucGF0aCxcbiAgZ2V0RGlyZWN0aW9uID0geCA9PiB4LmRpcmVjdGlvbixcbiAgZ2V0Q29sb3IgPSB4ID0+IERFRkFVTFRfQ09MT1IsXG4gIGdldE1hcmtlclBlcmNlbnRhZ2VzID0geCA9PiBbMC41XSxcbiAgcHJvamVjdEZsYXRcbn0pIHtcbiAgY29uc3QgbWFya2VycyA9IFtdO1xuXG4gIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICBjb25zdCBwYXRoID0gZ2V0UGF0aChvYmplY3QpO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGdldERpcmVjdGlvbihvYmplY3QpIHx8IERFRkFVTFRfRElSRUNUSU9OO1xuICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3Iob2JqZWN0KTtcblxuICAgIGNvbnN0IHZQb2ludHMgPSBwYXRoLm1hcChwID0+IG5ldyBWZWN0b3IyKHApKTtcbiAgICBjb25zdCB2UG9pbnRzUmV2ZXJzZSA9IHZQb2ludHMuc2xpY2UoMCkucmV2ZXJzZSgpO1xuXG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIGxlbmd0aFxuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBnZXRMaW5lTGVuZ3RoKHZQb2ludHMpO1xuXG4gICAgLy8gQXNrIGZvciB3aGVyZSB0byBwdXQgbWFya2Vyc1xuICAgIGNvbnN0IHBlcmNlbnRhZ2VzID0gZ2V0TWFya2VyUGVyY2VudGFnZXMob2JqZWN0LCB7bGluZUxlbmd0aH0pO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBtYXJrZXJzXG4gICAgZm9yIChjb25zdCBwZXJjZW50YWdlIG9mIHBlcmNlbnRhZ2VzKSB7XG4gICAgICBpZiAoZGlyZWN0aW9uLmZvcndhcmQpIHtcbiAgICAgICAgY29uc3QgbWFya2VyID0gY3JlYXRlTWFya2VyQWxvbmdQYXRoKHtcbiAgICAgICAgICBwYXRoOiB2UG9pbnRzLFxuICAgICAgICAgIHBlcmNlbnRhZ2UsXG4gICAgICAgICAgbGluZUxlbmd0aCxcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBvYmplY3QsXG4gICAgICAgICAgcHJvamVjdEZsYXRcbiAgICAgICAgfSk7XG4gICAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyZWN0aW9uLmJhY2t3YXJkKSB7XG4gICAgICAgIGNvbnN0IG1hcmtlciA9IGNyZWF0ZU1hcmtlckFsb25nUGF0aCh7XG4gICAgICAgICAgcGF0aDogdlBvaW50c1JldmVyc2UsXG4gICAgICAgICAgcGVyY2VudGFnZSxcbiAgICAgICAgICBsaW5lTGVuZ3RoLFxuICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgIG9iamVjdCxcbiAgICAgICAgICBwcm9qZWN0RmxhdFxuICAgICAgICB9KTtcbiAgICAgICAgbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hcmtlcnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hcmtlckFsb25nUGF0aCh7cGF0aCwgcGVyY2VudGFnZSwgbGluZUxlbmd0aCwgY29sb3IsIG9iamVjdCwgcHJvamVjdEZsYXR9KSB7XG4gIGNvbnN0IGRpc3RhbmNlQWxvbmcgPSBsaW5lTGVuZ3RoICogcGVyY2VudGFnZTtcbiAgbGV0IGN1cnJlbnREaXN0YW5jZSA9IDA7XG4gIGxldCBwcmV2aW91c0Rpc3RhbmNlID0gMDtcbiAgbGV0IGkgPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjdXJyZW50RGlzdGFuY2UgKz0gcGF0aFtpXS5kaXN0YW5jZShwYXRoW2kgKyAxXSk7XG4gICAgaWYgKGN1cnJlbnREaXN0YW5jZSA+IGRpc3RhbmNlQWxvbmcpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwcmV2aW91c0Rpc3RhbmNlID0gY3VycmVudERpc3RhbmNlO1xuICB9XG5cbiAgY29uc3QgdkRpcmVjdGlvbiA9IHBhdGhbaSArIDFdXG4gICAgLmNsb25lKClcbiAgICAuc3VidHJhY3QocGF0aFtpXSlcbiAgICAubm9ybWFsaXplKCk7XG4gIGNvbnN0IGFsb25nID0gZGlzdGFuY2VBbG9uZyAtIHByZXZpb3VzRGlzdGFuY2U7XG4gIGNvbnN0IHZDZW50ZXIgPSB2RGlyZWN0aW9uXG4gICAgLmNsb25lKClcbiAgICAubXVsdGlwbHkobmV3IFZlY3RvcjIoYWxvbmcsIGFsb25nKSlcbiAgICAuYWRkKHBhdGhbaV0pO1xuXG4gIGNvbnN0IHZEaXJlY3Rpb24yID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQocGF0aFtpICsgMV0pKS5zdWJ0cmFjdChwcm9qZWN0RmxhdChwYXRoW2ldKSk7XG4gIGNvbnN0IGFuZ2xlID0gKC12RGlyZWN0aW9uMi52ZXJ0aWNhbEFuZ2xlKCkgKiAxODApIC8gTWF0aC5QSTtcblxuICByZXR1cm4ge3Bvc2l0aW9uOiBbdkNlbnRlci54LCB2Q2VudGVyLnksIDBdLCBhbmdsZSwgY29sb3IsIG9iamVjdH07XG59XG4iXX0=