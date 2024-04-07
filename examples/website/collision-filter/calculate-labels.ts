import {geomEach, along, rhumbBearing, lineDistance, lineString, booleanEqual} from '@turf/turf';
import type {FeatureCollection, Geometry, Feature, LineString} from 'geojson';

export type Label<FeatureProperties> = {
  position: number[];
  priority: number;
  angle: number;
  parent: FeatureProperties;
};

/* Utility to add rotated labels along lines and assign collision priorities */
export function calculateLabels<FeatureProperties>(
  geojson: FeatureCollection<Geometry, FeatureProperties> | undefined,
  filter: (properties: FeatureProperties) => boolean,
  pointSpacing: number
): Label<FeatureProperties>[] {
  if (!geojson) return [];

  const result: Label<FeatureProperties>[] = [];

  function addLabelsAlongLineString(coordinates: LineString["coordinates"], properties: FeatureProperties) {
    // Add labels to minimize overlaps, pick odd values from each level
    //        1       <- depth 1
    //    1   2   3   <- depth 2
    //  1 2 3 4 5 6 7 <- depth 3
    const feature = lineString(coordinates, properties);
    const lineLength = Math.floor(lineDistance(feature));
    let delta = lineLength / 2; // Spacing between points at level
    let depth = 1;
    while (delta > pointSpacing) {
      for (let i = 1; i < 2 ** depth; i += 2) {
        const label = getLabelAtPoint(feature, lineLength, i * delta, 100 - depth); // Top levels have highest priority
        result.push(label);
      }
      depth++;
      delta /= 2;
    }
  }

  // @ts-ignore turf type FeatureCollection is not compatible with geojson type
  geomEach(geojson, (geometry: Geometry, i, properties: FeatureProperties) => {
    if (!filter(properties)) return;

    switch (geometry.type) {
      case 'LineString':
        addLabelsAlongLineString(geometry.coordinates, properties);
        break;

      case 'MultiLineString':
        for (const coordinates of geometry.coordinates) {
          addLabelsAlongLineString(coordinates, properties);
        }
        break;

      default:
        // ignore
    }
  });

  return result;
}

function getLabelAtPoint<FeatureProperties>(
  line: Feature<LineString, FeatureProperties>,
  lineLength: number,
  dAlong: number,
  priority: number
): Label<FeatureProperties> {
  const offset = dAlong + 1 < lineLength ? 1 : -1;
  const point = along(line, dAlong);
  const nextPoint = along(line, dAlong + offset);
  if (booleanEqual(point, nextPoint)) return;

  let angle = 90 - rhumbBearing(point, nextPoint);
  if (Math.abs(angle) > 90) angle += 180;

  return {
    position: point.geometry.coordinates,
    priority,
    angle,
    parent: line.properties
  };
}
