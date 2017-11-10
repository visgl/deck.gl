import {Vector2} from 'math.gl';
import {COORDINATE_SYSTEM} from 'deck.gl';

function getLineLength(vPoints) {
  // calculate total length
  let lineLength = 0;
  for (let i = 0; i < vPoints.length - 1; i++) {
    lineLength += vPoints[i].distance(vPoints[i + 1]);
  }
  return lineLength;
}

const DEFAULT_COLOR = [0, 0, 0, 255];

export default function createPathMarkers({
  data,
  viewport,
  getPath = x => x.path,
  getDirection = x => true,
  getColor = x => DEFAULT_COLOR,
  getMarkerPercentages = x => [0.5],
  coordinateSystem,
  coordinateOrigin
}) {
  const markers = [];

  for (const object of data) {
    const path = getPath(object);
    const direction = getDirection(object);
    const color = getColor(object);

    const vPoints = path.map(p => new Vector2(p));
    if (!direction) {
      vPoints.reverse();
    }

    // calculate total length
    const lineLength = getLineLength(vPoints);

    // Ask for where to put markers
    const percentages = getMarkerPercentages(object, {lineLength});

    // Create the markers
    for (const percentage of percentages) {
      const marker = createMarkerAlongPath(
        {path: vPoints, percentage, lineLength, color, object, viewport, coordinateSystem, coordinateOrigin});
      markers.push(marker);
    }
  }

  return markers;
}

function createMarkerAlongPath({path, percentage, lineLength, color, object, viewport, coordinateSystem, coordinateOrigin}) {
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

  const vDirection = path[i + 1]
    .clone()
    .subtract(path[i])
    .normalize();
  const along = distanceAlong - previousDistance;
  const vCenter = vDirection
    .clone()
    .multiply(new Vector2(along, along))
    .add(path[i]);

  const projectFlat = coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS ?
   obj => {
    const [dx,dy] = viewport.metersToLngLatDelta(obj);
    const [x,y] = coordinateOrigin;
    console.log(obj, [x,y], [dx,dy]);
    return viewport.projectFlat([x-dx, dy+y]); // <<< TODO signs
  } : obj => console.log(obj) || viewport.projectFlat(obj);

  const vDirection2 = new Vector2(projectFlat(path[i + 1]))
    .subtract(projectFlat(path[i]));
  const angle = -vDirection2.verticalAngle() * 180 / Math.PI;
  console.log(">>>>>", angle);

  console.log("<><><><><><><===", viewport.metersToLngLatDelta([10,10]), viewport.metersToLngLatDelta([-10,-10]));

  return ({
    position: [vCenter.x, vCenter.y, 0], angle, color, object
  });
}
