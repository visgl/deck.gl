// NOTE: Transform is not a public API so we should be careful to always lock
// down mapbox-gl to a specific major, minor, and patch version.
import Transform from 'mapbox-gl/js/geo/transform';
import LngLat from 'mapbox-gl/js/geo/lng_lat';

export default function projectMapViewStateToMatrix(mapViewState) {
  const transform = new Transform(0, 20);
  transform.width = mapViewState.width;
  transform.height = mapViewState.height;
  transform.zoom = mapViewState.zoom;
  transform.center = new LngLat(mapViewState.longitude, mapViewState.latitude);
  transform.angle = mapViewState.angle;
  transform.altitude = mapViewState.altitude || 1.5;
  transform.pitch = mapViewState.pitch;
  transform.bearing = mapViewState.bearing;
  return transform.projMatrix;
}
