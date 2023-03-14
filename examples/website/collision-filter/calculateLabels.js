import * as turf from '@turf/turf';

/* Utility to add rotated labels along lines and assign collision priorities */
export default function calculateLabels(data, pointSpacing) {
  const routes = data.features.filter(d => d.geometry.type !== 'Point');
  const result = [];

  function addPoint(lineLength, lineString, dAlong, name, priority) {
    let offset = 1;
    if (dAlong > 0.5 * lineLength) offset *= -1;
    const feature = turf.along(lineString, dAlong);
    const nextFeature = turf.along(lineString, dAlong + offset);
    const {coordinates} = feature.geometry;
    const next = nextFeature.geometry.coordinates;
    if (coordinates[0] === next[0] && coordinates[1] === next[1]) return;

    let angle = 90 - turf.rhumbBearing(coordinates, next);
    if (Math.abs(angle) > 90) angle += 180;

    result.push({position: coordinates, text: name, priority, angle});
  }

  // Add points along the lines
  for (const feature of routes) {
    const lineLength = Math.floor(turf.lineDistance(feature.geometry));
    const {name} = feature.properties;

    feature.geometry.coordinates.forEach(c => {
      const lineString = turf.lineString(c);

      // Add labels to minimize overlaps, pick odd values from each level
      //        1       <- depth 1
      //    1   2   3   <- depth 2
      //  1 2 3 4 5 6 7 <- depth 3
      let delta = 0.5 * lineLength; // Spacing between points at level
      let depth = 1;
      while (delta > pointSpacing) {
        for (let i = 1; i < 2 ** depth; i += 2) {
          addPoint(lineLength, lineString, i * delta, name, 100 - depth); // Top levels have highest priority
        }
        depth++;
        delta /= 2;
      }
    });
  }

  return result;
}
