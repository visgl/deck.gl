// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from '../viewports/viewport';

import {Matrix4} from '@math.gl/core';
import {pixelsToWorld, fovyToAltitude} from '@math.gl/web-mercator';

const DEGREES_TO_RADIANS = Math.PI / 180;

function getViewMatrix({
  height,
  focalDistance,
  orbitAxis,
  rotationX,
  rotationOrbit,
  zoom
}: {
  height: number;
  focalDistance: number;
  orbitAxis: 'Y' | 'Z';
  rotationX: number;
  rotationOrbit: number;
  zoom: number;
}): Matrix4 {
  // We position the camera so that one common space unit (world space unit scaled by zoom)
  // at the target maps to one screen pixel.
  // This is a similar technique to that used in web mercator projection
  // By doing so we are able to convert between common space and screen space sizes efficiently
  // in the vertex shader.
  const up = orbitAxis === 'Z' ? [0, 0, 1] : [0, 1, 0];
  const eye = orbitAxis === 'Z' ? [0, -focalDistance, 0] : [0, 0, focalDistance];

  const viewMatrix = new Matrix4().lookAt({eye, up});

  viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
  if (orbitAxis === 'Z') {
    viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
  } else {
    viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
  }

  // When height increases, we need to increase the distance from the camera to the target to
  // keep the 1:1 mapping. However, this also changes the projected depth of each position by
  // moving them further away between the near/far plane.
  // Without modifying the default near/far planes, we instead scale down the common space to
  // remove the distortion to the depth field.
  const projectionScale = Math.pow(2, zoom) / height;
  viewMatrix.scale(projectionScale);

  return viewMatrix;
}

export type OrbitViewportOptions = {
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
  /** Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`. */
  orbitAxis?: 'Y' | 'Z';
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target?: [number, number, number];
  /** The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`. */
  zoom?: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationOrbit?: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationX?: number;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Field of view covered by camera, in the perspective case. In degrees. Default `50`. */
  fovy?: number;
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection). */
  orthographic?: boolean;
};

export default class OrbitViewport extends Viewport {
  projectedCenter: number[];

  constructor(props: OrbitViewportOptions) {
    const {
      height,

      projectionMatrix,

      fovy = 50, // For setting camera position
      orbitAxis = 'Z', // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'
      target = [0, 0, 0], // Which point is camera looking at, default origin

      rotationX = 0, // Rotating angle around X axis
      rotationOrbit = 0, // Rotating angle around orbit axis

      zoom = 0
    } = props;

    const focalDistance = projectionMatrix ? projectionMatrix[5] / 2 : fovyToAltitude(fovy);

    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: undefined,
      viewMatrix: getViewMatrix({
        height: height || 1,
        focalDistance,
        orbitAxis,
        rotationX,
        rotationOrbit,
        zoom
      }),
      fovy,
      focalDistance,
      position: target,
      zoom
    });

    this.projectedCenter = this.project(this.center);
  }

  unproject(xyz: number[], {topLeft = true}: {topLeft?: boolean} = {}): [number, number, number] {
    const [x, y, z = this.projectedCenter[2]] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const [X, Y, Z] = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix);
    return [X, Y, Z];
  }

  panByPosition(coords: number[], pixel: number[]): OrbitViewportOptions {
    const p0 = this.project(coords);
    const nextCenter = [
      this.width / 2 + p0[0] - pixel[0],
      this.height / 2 + p0[1] - pixel[1],
      this.projectedCenter[2]
    ];
    return {
      target: this.unproject(nextCenter)
    };
  }
}
