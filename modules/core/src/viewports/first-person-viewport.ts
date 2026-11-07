// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport, {type ViewportOptions} from './viewport';
import {PROJECTION_MODE} from '../shaderlib/project/constants';
import {OSM_TILE_CRS, getMercatorScales} from './web-mercator-util';
import {getMeterZoom} from '@math.gl/web-mercator';
import {Matrix4, Vector3, SphericalCoordinates} from '@math.gl/core';

export type FirstPersonViewportOptions = {
  /** Subdivision intervals around the earth for nonlinear source CRS conversions. Default 0 disables subdivision. */
  resolution?: number;
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
  /** Meter offsets of the camera from the lng-lat-elevation anchor point. Default `[0, 0, 0]`. */
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
  static displayName = 'FirstPersonViewport';

  longitude?: number;
  latitude?: number;
  pitch: number;
  bearing: number;
  up: [number, number, number];

  constructor(props: FirstPersonViewportOptions) {
    // TODO - push direction handling into Matrix4.lookAt
    const {longitude, latitude, modelMatrix, bearing = 0, pitch = 0, up = [0, 0, 1]} = props;

    // Always calculate direction from bearing and pitch
    const spherical = new SphericalCoordinates({
      bearing,
      // Avoid "pixel project matrix not invertible" error
      pitch: pitch === -90 ? 0.0001 : 90 + pitch
    });
    const dir = new Vector3(spherical.toVector3()).normalize();

    // Direction is relative to model coordinates, of course
    const center = modelMatrix ? new Matrix4(modelMatrix).transformAsVector(dir) : dir;

    // Positioning is applied separately by the base viewport.
    const zoom = Number.isFinite(latitude) ? getMeterZoom({latitude: latitude as number}) : 0;
    const scale = Math.pow(2, zoom);
    const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 0], center, up}).scale(scale);

    const geospatial = Number.isFinite(longitude) && Number.isFinite(latitude);
    const scales = geospatial ? getMercatorScales(longitude!, latitude!) : undefined;
    // Target tile Y points south; common space keeps the shader's northward Mercator Y.
    const targetToCommonMatrix = scales
      ? new Matrix4().translate([0, 512, 0]).scale([1, -1, scales.unitsPerMeter[2]])
      : undefined;
    const viewportOptions: ViewportOptions = {
      ...props,
      crs: geospatial ? OSM_TILE_CRS : undefined,
      zoom,
      viewMatrix,
      fovy: props.fovy ?? 75,
      near: props.near ?? 0.1,
      far: props.far ?? 1000,
      targetToCommonMatrix,
      // Mercator's degree derivatives and ground-meter scales stay in math.gl.
      distanceScales: scales
        ? coordinateOrigin =>
            coordinateOrigin
              ? getMercatorScales(coordinateOrigin[0], coordinateOrigin[1], true)
              : scales
        : undefined
    };
    super(viewportOptions);
    this.latitude = latitude;
    this.longitude = longitude;
    this.pitch = pitch;
    this.bearing = bearing;
    this.up = up;
  }

  get projectionMode(): number {
    return this.crs
      ? this.zoom < 12
        ? PROJECTION_MODE.WEB_MERCATOR
        : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET
      : PROJECTION_MODE.IDENTITY;
  }

  protected _getCenter(options: FirstPersonViewportOptions, position: number[]): number[] {
    if (!this.crs) return Array.from(position);
    // The common-space camera retains east/north/up meter offsets from its WGS84 anchor.
    return new Vector3(this.projectPosition([options.longitude!, options.latitude!, 0])).add([
      position[0] * this.distanceScales.unitsPerMeter[0],
      position[1] * this.distanceScales.unitsPerMeter[1],
      position[2] * this.distanceScales.unitsPerMeter[2]
    ]);
  }
}
