# PathMarkerLayer

Create small markers along a path (defaults to arrows showing "direction").


// TODO - Move to Nebula
//
// import {ArrowStyles, DEFAULT_STYLE} from '../../style';
//
// createMarkers(paths) {
//   const allPoints = [];
//   const arrowStyles = [];
//   const colors = [];
//   for (const segment of segments) {
//     const feature = this.toNebulaFeature(segment);
//     const arrowStyle = feature.style.arrowStyle || ArrowStyles.NONE;
//     if (arrowStyle !== ArrowStyles.NONE) {
//       const points = feature.getCoords().map(realm.project);
//       const color = feature.style.arrowColor || DEFAULT_STYLE.arrowColor;
//       allPoints.push(points);
//       arrowStyles.push(arrowStyle || DEFAULT_STYLE.arrowStyle);
//       colors.push(color);
//     }
//   }
//   const mesh = this._createMarkersAlongPaths(allPoints, arrowStyles, colors);
// }
