import {geomEach, along, rhumbBearing, lineDistance, lineString, booleanEqual} from '@turf/turf';
import type {FeatureCollection, Geometry, Feature, LineString} from 'geojson';

export type Label = {
  position: number[];
  text: string;
  priority: number;
  angle: number;
};

/* Utility to add rotated labels along lines and assign collision priorities */
export function calculateLabels<FeatureProperties>(
  geojson: FeatureCollection<Geometry, FeatureProperties> | undefined,
  getName: (properties: FeatureProperties) => string,
  getPriority: (properties: FeatureProperties) => number,
  pointSpacing: number
): Label[] {
  if (!geojson) return [];

  const result: Label[] = [];

  function addLabelsAlongLineString(coordinates: LineString["coordinates"], name: string, priority: number) {
    // Add labels to minimize overlaps, pick odd values from each level
    //        1       <- depth 1
    //    1   2   3   <- depth 2
    //  1 2 3 4 5 6 7 <- depth 3
    const feature = lineString(coordinates);
    const lineLength = Math.floor(lineDistance(feature));
    let delta = lineLength / 2; // Spacing between points at level
    let depth = 1;
    while (delta > pointSpacing) {
      for (let i = 1; i < 2 ** depth; i += 2) {
        const label = getLabelAtPoint(feature, lineLength, i * delta, name, 100 - depth + priority); // Top levels have highest priority
        result.push(label);
      }
      depth++;
      delta /= 2;
    }
  }

  // @ts-ignore turf type FeatureCollection is not compatible with geojson type
  geomEach(geojson, (geometry: Geometry, i, properties: FeatureProperties) => {
    const name = getName(properties);
    const priority = getPriority(properties);

    switch (geometry.type) {
      case 'LineString':
        addLabelsAlongLineString(geometry.coordinates, name, priority);
        break;

      case 'MultiLineString':
        for (const coordinates of geometry.coordinates) {
          addLabelsAlongLineString(coordinates, name, priority);
        }
        break;

      default:
        // ignore
    }
  });

  return result;
}

function getLabelAtPoint(line: Feature<LineString>, lineLength: number, dAlong: number, name: string, priority: number): Label {
  const offset = dAlong + 1 < lineLength ? 1 : -1;
  const point = along(line, dAlong);
  const nextPoint = along(line, dAlong + offset);
  if (booleanEqual(point, nextPoint)) return;

  let angle = 90 - rhumbBearing(point, nextPoint);
  if (Math.abs(angle) > 90) angle += 180;

  return {position: point.geometry.coordinates, text: name, priority, angle};
}
