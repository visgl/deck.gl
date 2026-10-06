// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {FirstPersonController, type FirstPersonViewState} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';

// Scale camera AND scene into practical navigation units, without changing source-space LOD.
const WORLD_SCALE = 1000;
const AUTHORED_TARGET = [0.0226670563, 0.0141479052, 0.1886351632];
const AUTHORED_EYE = [-0.0858, 0.1128, 0.2203];
/** Source-local to deck Cartesian world. */
export const MODEL_MATRIX = new Matrix4().scale(WORLD_SCALE).rotateX(-Math.PI / 2);
/** Authored pivot retained as a visual reference, not a movement constraint. */
export const TARGET = AUTHORED_TARGET.map(value => value * WORLD_SCALE) as [number, number, number];
/** Fixed world-space lens and clipping distances, independent of camera movement. */
export const CAMERA_PROPS = {fovy: 75, near: 2, far: 100_000};

/** Reproduce the authored view with an explicit eye and orientation. */
export function getInitialViewState(): FirstPersonViewState {
  const direction = AUTHORED_TARGET.map((value, index) => value - AUTHORED_EYE[index]);
  return {
    position: AUTHORED_EYE.map(value => value * WORLD_SCALE) as [number, number, number],
    bearing: (Math.atan2(direction[0], direction[1]) * 180) / Math.PI,
    pitch: (-Math.asin(direction[2] / Math.hypot(...direction)) * 180) / Math.PI
  };
}

/** First-person deck input with camera-axis dolly, as in Spark PointerControls.
 * Stock first-person wheel movement is horizontal; inspection needs the full pitch.
 * Input still flows through deck's controller and one canonical view state.
 */
export class SplatCameraController extends FirstPersonController {
  constructor(options: ConstructorParameters<typeof FirstPersonController>[0]) {
    super(options);
    const BaseState = this.ControllerState;
    this.ControllerState = class SplatCameraState extends BaseState {
      _getUpdatedState(newProps: Record<string, any>): SplatCameraState {
        return new SplatCameraState({
          ...this.getViewportProps(),
          ...this.getState(),
          ...newProps,
          makeViewport: this.makeViewport
        });
      }

      zoom({scale}: {pos: [number, number]; scale: number}) {
        return this._move(
          this.getDirection(),
          Math.log2(scale) * 20,
          this.getState().startZoomPosition || this.getViewportProps().position
        );
      }
      zoomIn(speed = 2) {
        return this.zoom({pos: [0, 0], scale: speed});
      }
      zoomOut(speed = 2) {
        return this.zoom({pos: [0, 0], scale: 1 / speed});
      }
    };
  }
}
