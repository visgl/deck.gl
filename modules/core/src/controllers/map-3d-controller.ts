// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import MapController, {MapState} from './map-controller';
import type {MjolnirGestureEvent} from 'mjolnir.js';
import type {InteractionState} from './controller';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
} as const;

/**
 * Map3DState extends MapState to support 3D picking and rotation pivots
 * Overrides rotateStart to accept altitude parameter
 */
class Map3DState extends MapState {
  /**
   * Start rotating with optional 3D altitude for pivot
   * @param {[Number, Number]} pos - position on screen where the center is
   * @param {Number} altitude - optional picked altitude at the rotation start point
   */
  rotateStart({pos, altitude}: {pos: [number, number]; altitude?: number}): Map3DState {
    return this._getUpdatedState({
      startRotatePos: pos,
      startRotateLngLat: this._unproject3D(pos, altitude),
      startBearing: this.getViewportProps().bearing,
      startPitch: this.getViewportProps().pitch,
      startRotateAltitude: altitude
    }) as Map3DState;
  }
}

/**
 * Map3DController extends MapController with 3D picking and rotation pivot features
 *
 * Features:
 * - Performs 3D picking at rotation start using pickPosition callback
 * - Maintains rotation pivot at picked 3D point
 * - Provides rotation pivot position for visual feedback
 *
 * Usage:
 * ```js
 * import {_Map3DController} from '@deck.gl/core';
 *
 * const view = new MapView({
 *   controller: _Map3DController
 * });
 * ```
 */
export default class Map3DController extends MapController {
  ControllerState = Map3DState;

  /**
   * Override _onPanStart to perform 3D picking for rotation pivot
   */
  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton || false;
    if (this.invertPan || this.dragMode === 'pan') {
      // invertPan is replaced by props.dragMode, keeping for backward compatibility
      alternateMode = !alternateMode;
    }

    // For rotation, pick the altitude at the interaction start point
    let pickedAltitude: number | undefined;
    if (!alternateMode && this.pickPosition) {
      const {x, y} = this.props;
      const pickResult = this.pickPosition(x + pos[0], y + pos[1]);
      if (pickResult && pickResult.coordinate && pickResult.coordinate.length >= 3) {
        pickedAltitude = pickResult.coordinate[2];
      }
    }

    const newControllerState = this.controllerState[alternateMode ? 'panStart' : 'rotateStart']({
      pos,
      altitude: pickedAltitude
    });
    this._panMove = alternateMode;

    // For rotation, extract the pivot position for visual feedback
    const interactionState: InteractionState = {isDragging: true};
    if (!alternateMode) {
      // Get the rotation pivot position from the state
      const pivotPos = newControllerState.getState().startRotateLngLat;
      if (pivotPos) {
        interactionState.rotationPivotPosition = pivotPos as [number, number, number];
      }
    }

    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, interactionState);
    return true;
  }

  /**
   * Override _onPanRotate to maintain rotation pivot visual feedback
   */
  protected _onPanRotate(event: MjolnirGestureEvent): boolean {
    if (!this.dragRotate) {
      return false;
    }

    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.rotate({pos});

    // Maintain the rotation pivot position during rotation
    const pivotPos = newControllerState.getState().startRotateLngLat;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true,
      rotationPivotPosition: pivotPos as [number, number, number] | undefined
    });
    return true;
  }

  /**
   * Override _onPanRotateEnd to clear rotation pivot visual feedback
   * The base implementation already handles clearing via interaction state
   */
  protected _onPanRotateEnd(event: MjolnirGestureEvent): boolean {
    const {inertia} = this;
    if (this.dragRotate && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos: [number, number] = [
        pos[0] + (event.velocityX * inertia) / 2,
        pos[1] + (event.velocityY * inertia) / 2
      ];
      const newControllerState = this.controllerState.rotate({pos: endPos}).rotateEnd();
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: this.constructor['INERTIA_EASING'] || ((t: number) => 1 - (1 - t) * (1 - t))
        },
        {
          isDragging: false,
          isRotating: true,
          rotationPivotPosition: undefined
        }
      );
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false,
        rotationPivotPosition: undefined
      });
    }
    return true;
  }
}
