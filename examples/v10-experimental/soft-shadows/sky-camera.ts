// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {WebMercatorViewport, type MapViewState} from '@deck.gl/core';

export const SKY_FIELD_OF_VIEW = 50;
export const MAXIMUM_SKY_PITCH = 165;
const MINIMUM_CAMERA_HEIGHT = 20;

/** Keep the eye above ground while orbiting past the horizon to look up at the sky. */
export function getSkyCameraState<State extends MapViewState>(
  state: State,
  width: number,
  height: number
): State {
  const pitch = Math.max(0, Math.min(MAXIMUM_SKY_PITCH, state.pitch ?? 0));
  // Explicit clipping planes avoid the ground-intersection estimate's singularity at 90 degrees.
  const clipping = {nearZ: 0.01, farZ: 100};
  const viewport = new WebMercatorViewport({
    ...state,
    ...clipping,
    width,
    height,
    pitch,
    fovy: SKY_FIELD_OF_VIEW,
    position: [0, 0, 0]
  });
  const cameraHeight = viewport.cameraPosition[2] / viewport.getDistanceScales().unitsPerMeter[2];
  return {
    ...state,
    ...clipping,
    pitch,
    maxPitch: MAXIMUM_SKY_PITCH,
    position: [0, 0, Math.max(0, MINIMUM_CAMERA_HEIGHT - cameraHeight)]
  };
}
