// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import {OrbitState} from './orbit-controller';
import LinearInterpolator from '../transitions/linear-interpolator';

import type {MjolnirGestureEvent} from 'mjolnir.js';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
} as const;

class OrthographicState extends OrbitState {
  zoomAxis: 'X' | 'Y' | 'all';

  constructor(props) {
    super(props);

    this.zoomAxis = props.zoomAxis || 'all';
  }

  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this.getViewportProps();
    if (startZoom === undefined) {
      startZoom = this.getViewportProps().zoom;
    }
    let deltaZoom = Math.log2(scale);
    if (Array.isArray(startZoom)) {
      let [newZoomX, newZoomY] = startZoom;
      switch (this.zoomAxis) {
        case 'X':
          // Scale x only
          newZoomX = clamp(newZoomX + deltaZoom, minZoom, maxZoom);
          break;
        case 'Y':
          // Scale y only
          newZoomY = clamp(newZoomY + deltaZoom, minZoom, maxZoom);
          break;
        default:
          // Lock aspect ratio
          let z = Math.min(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z < minZoom) {
            deltaZoom += minZoom - z;
          }
          z = Math.max(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z > maxZoom) {
            deltaZoom += maxZoom - z;
          }
          newZoomX += deltaZoom;
          newZoomY += deltaZoom;
      }
      return [newZoomX, newZoomY];
    }
    // Ignore `zoomAxis`
    // `LinearTransitionInterpolator` does not support interpolation between a number and an array
    // So if zoom is a number (legacy use case), new zoom still has to be a number
    return clamp(startZoom + deltaZoom, minZoom, maxZoom);
  }
}

export default class OrthographicController extends Controller<OrbitState> {
  ControllerState = OrthographicState;
  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator({
      transitionProps: {
        compare: ['target', 'zoom', 'rotationOrbit'],
        required: ['target', 'zoom']
      }
    })
  };
  dragMode: 'pan' | 'rotate' = 'pan';

  private _lastAngle: number | undefined = undefined;
  private _rotationCenter: [number, number] | undefined = undefined;
  private _isRotating = false;
  private _contextMenuHandler: ((e: Event) => void) | null = null;
  private _targetRotation: number | null = null;

  setProps(props: ControllerProps) {
    super.setProps(props);

    if (this.dragRotate && !this._contextMenuHandler) {
      this._contextMenuHandler = (e: Event) => {
        if ((e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey) {
          e.preventDefault();
        }
      };
      // @ts-expect-error accessing eventManager element
      this.eventManager?.element?.addEventListener('contextmenu', this._contextMenuHandler);
    }
  }

  finalize() {
    if (this._contextMenuHandler) {
      // @ts-expect-error accessing eventManager element
      this.eventManager?.element?.removeEventListener('contextmenu', this._contextMenuHandler);
      this._contextMenuHandler = null;
    }
    super.finalize();
  }

  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    const {srcEvent} = event;
    if (srcEvent && (srcEvent.metaKey || srcEvent.ctrlKey)) {
      srcEvent.preventDefault();
      this._isRotating = true;
      const {width, height} = this.controllerState.getViewportProps();
      this._rotationCenter = [width / 2, height / 2];
      this._lastAngle = undefined;
      return true;
    }
    this._isRotating = false;
    return super._onPanStart(event);
  }

  protected _onPan(event: MjolnirGestureEvent): boolean {
    if (this._isRotating) {
      return this._handleRotate(event);
    }
    return super._onPan(event);
  }

  protected _onPanEnd(event: MjolnirGestureEvent): boolean {
    if (this._isRotating) {
      this._lastAngle = undefined;
      this._rotationCenter = undefined;
      this._isRotating = false;

      const newControllerState = this.controllerState._getUpdatedState({});
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
      return true;
    }
    return super._onPanEnd(event);
  }

  private _handleRotate(event: MjolnirGestureEvent): boolean {
    const pos = this.getCenter(event);

    if (!this._rotationCenter) {
      return false;
    }

    const centerX = this._rotationCenter[0];
    const centerY = this._rotationCenter[1];

    const theta = Math.atan2(centerY - pos[1], pos[0] - centerX);

    if (this._lastAngle !== undefined) {
      const delta = theta - this._lastAngle;
      const currentRotation = this.controllerState.getViewportProps().rotationOrbit ?? 0;
      const sensitivity = 1.5;
      const newRotation = currentRotation - (delta * 180 * sensitivity) / Math.PI;

      this._targetRotation = newRotation;

      const newControllerState = this.controllerState._getUpdatedState({
        rotationOrbit: newRotation
      });

      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isRotating: true
      });
    }

    this._lastAngle = theta;
    return true;
  }

  /** Rotate the view by a delta angle in degrees */
  rotate(deltaAngle: number): void {
    const currentRotation = this._targetRotation ?? this.getRotation();
    this.setRotation(currentRotation + deltaAngle, false);
  }

  /** Rotate left by specified degrees (default: 15) */
  rotateLeft(speed: number = 15): void {
    this.rotate(-speed);
  }

  /** Rotate right by specified degrees (default: 15) */
  rotateRight(speed: number = 15): void {
    this.rotate(speed);
  }

  /** Set the rotation to a specific angle in degrees */
  setRotation(angle: number, animate: boolean = true): void {
    this._targetRotation = angle;

    const newControllerState = this.controllerState._getUpdatedState({
      rotationOrbit: angle
    });

    this.updateViewport(newControllerState, animate ? this.transition : NO_TRANSITION_PROPS, {
      isRotating: true
    });
  }

  /** Get current rotation angle in degrees */
  getRotation(): number {
    return this.controllerState.getViewportProps().rotationOrbit ?? 0;
  }
}
