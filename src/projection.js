// NOTE: Transform is not a public API so we should be careful to always lock
// down mapbox-gl to a specific major, minor, and patch version.
import Transform from './simple-transform';

export default function projectMapViewStateToMatrix(mapViewState) {
  const transform = new Transform({
    width: mapViewState.width,
    height: mapViewState.height,
    zoom: mapViewState.zoom,
    centerLng: mapViewState.longitude,
    centerLat: mapViewState.latitude,
    angle: mapViewState.angle,
    altitude: mapViewState.altitude,
    pitch: mapViewState.pitch,
    bearing: mapViewState.bearing
  });
  return transform.projMatrix;
}
