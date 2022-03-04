import Viewport from '../viewports/viewport';
import {getMeterZoom} from '@math.gl/web-mercator';
import {Matrix4, _SphericalCoordinates as SphericalCoordinates} from '@math.gl/core';

export type FirstPersonViewportOptions = {
  /** Name of the viewport */
  id?: string;
  /** Left offset from the canvas edge, in pixels */
  x?: number;
  /** Top offset from the canvas edge, in pixels */
  y?: number;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** Longitude of the camera, in the geospatial case. */
  longitude?: number;
  /** Latitude of the camera, in the geospatial case. */
  latitude?: number;
  /** Meter offsets of the camera from the lng-lat anchor point. Default `[0, 0, 0]`. */
  position?: [number, number, number];
  /** Bearing (heading) of the camera in degrees. Default `0` (north). */
  bearing?: number;
  /** Pitch (tilt) of the camera in degrees. Default `0` (horizontal). */
  pitch?: number;
  /** Transform applied to the camera position and direction */
  modelMatrix?: number[] | null;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** The up direction, default positive z axis. */
  up?: [number, number, number];
  /** Field of view covered by camera, in degrees. Default `75`. */
  fovy?: number;
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Modifier of viewport scale. Corresponds to the number of pixels per meter. Default `1`. */
  focalDistance?: number;
};

export default class FirstPersonViewport extends Viewport {
  longitude?: number;
  latitude?: number;

  constructor(props: FirstPersonViewportOptions) {
    // TODO - push direction handling into Matrix4.lookAt
    const {longitude, latitude, modelMatrix, bearing = 0, pitch = 0, up = [0, 0, 1]} = props;

    // Always calculate direction from bearing and pitch
    const spherical = new SphericalCoordinates({
      bearing,
      // Avoid "pixel project matrix not invertible" error
      pitch: pitch === -90 ? 0.0001 : 90 + pitch
    });
    const dir = spherical.toVector3().normalize();

    // Direction is relative to model coordinates, of course
    const center = modelMatrix ? new Matrix4(modelMatrix).transformAsVector(dir) : dir;

    // Just the direction. All the positioning is done in viewport.js
    const zoom = Number.isFinite(latitude) ? getMeterZoom({latitude: latitude as number}) : 0;
    const scale = Math.pow(2, zoom);
    const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 0], center, up}).scale(scale);

    super({
      ...props,
      zoom,
      viewMatrix
    });

    this.latitude = latitude;
    this.longitude = longitude;
  }
}
