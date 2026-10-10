// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {WebMercatorViewport, _GlobeViewport, type Viewport} from '@deck.gl/core';
import {Matrix4, type NumberArray3} from '@math.gl/core';
import {createSkyObserver, getSkyGlobeRotation, type SkyObserver} from '@math.gl/sun';

/** Explicit observers stay fixed as the camera moves. Otherwise use the map's current location. */
export function getSkyObserver(
  viewport: Viewport,
  observer?: SkyObserver,
  coordinateOrigin: Readonly<NumberArray3> = [0, 0, 0]
): SkyObserver {
  if (observer) return observer;
  const origin = coordinateOrigin.some(value => value !== 0)
    ? coordinateOrigin
    : [
        viewport instanceof _GlobeViewport || viewport instanceof WebMercatorViewport
          ? viewport.longitude
          : 0,
        viewport instanceof _GlobeViewport || viewport instanceof WebMercatorViewport
          ? viewport.latitude
          : 0,
        0
      ];
  return createSkyObserver({longitude: origin[0], latitude: origin[1], elevation: origin[2]});
}

export function makeSkyRotationMatrix(rotation: readonly number[]): Matrix4 {
  return new Matrix4([
    rotation[0],
    rotation[1],
    rotation[2],
    0,
    rotation[3],
    rotation[4],
    rotation[5],
    0,
    rotation[6],
    rotation[7],
    rotation[8],
    0,
    0,
    0,
    0,
    1
  ]);
}

/** Infinite ENU directions: translation and zoom never change a body's angular position. */
export function getSkyProjectionMatrix(viewport: Viewport, observer: SkyObserver): Matrix4 {
  const coordinates =
    viewport instanceof _GlobeViewport
      ? makeSkyRotationMatrix(getSkyGlobeRotation(observer))
      : new Matrix4().scale(
          viewport.getDistanceScales([observer.longitude, observer.latitude, observer.elevation])
            .unitsPerMeter
        );
  return new Matrix4(viewport.projectionMatrix)
    .multiplyRight(viewport.viewMatrix)
    .multiplyRight(coordinates);
}
