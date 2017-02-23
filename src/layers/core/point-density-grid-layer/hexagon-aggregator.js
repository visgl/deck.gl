import {hexbin} from 'd3-hexbin';

export function pointToHexbin(points, cellSize, getPosition, projectFlat) {
  const newHexbin = hexbin().radius(20);

  const screenPoints = points.map(pt => projectFlat(getPosition(pt)));
  console.log(screenPoints);
}
