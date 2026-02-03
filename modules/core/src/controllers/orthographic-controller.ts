// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import {OrbitState} from './orbit-controller';
import LinearInterpolator from '../transitions/linear-interpolator';

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

  rotateStart({pos}: {pos: [number, number]}): OrthographicState {
    const {width, height, rotationOrbit = 0} = this.getViewportProps();
    const centerX = width / 2;
    const centerY = height / 2;
    const startAngle = Math.atan2(centerY - pos[1], pos[0] - centerX);

    return this._getUpdatedState({
      startRotatePos: pos,
      startRotationOrbit: rotationOrbit,
      startRotationX: startAngle
    }) as OrthographicState;
  }

  rotate({
    pos,
    deltaAngleX = 0
  }: {
    pos?: [number, number];
    deltaAngleX?: number;
    deltaAngleY?: number;
  }): OrthographicState {
    const {startRotatePos, startRotationOrbit, startRotationX} = this.getState();
    const {width, height, rotationOrbit = 0} = this.getViewportProps();

    if (!startRotatePos || startRotationOrbit === undefined || startRotationX === undefined) {
      return this;
    }

    let newRotationOrbit: number;

    if (pos) {
      const centerX = width / 2;
      const centerY = height / 2;
      const currentAngle = Math.atan2(centerY - pos[1], pos[0] - centerX);
      let deltaAngle = currentAngle - startRotationX;

      if (deltaAngle > Math.PI) {
        deltaAngle -= 2 * Math.PI;
      } else if (deltaAngle < -Math.PI) {
        deltaAngle += 2 * Math.PI;
      }

      const sensitivity = 1.5;
      newRotationOrbit = startRotationOrbit - (deltaAngle * 180 * sensitivity) / Math.PI;
    } else {
      newRotationOrbit = rotationOrbit + deltaAngleX;
    }

    return this._getUpdatedState({
      rotationOrbit: newRotationOrbit
    }) as OrthographicState;
  }

  rotateEnd(): OrthographicState {
    return this._getUpdatedState({
      startRotatePos: null,
      startRotationOrbit: null,
      startRotationX: null
    }) as OrthographicState;
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

  private _contextMenuHandler: ((e: Event) => void) | null = null;

  setProps(props: ControllerProps) {
    super.setProps(props);

    if (this.dragRotate && !this._contextMenuHandler) {
      this._contextMenuHandler = (e: Event) => {
        if ((e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey) {
          e.preventDefault();
        }
      };
      // @ts-ignore accessing eventManager element
      this.eventManager?.element?.addEventListener('contextmenu', this._contextMenuHandler);
    }
  }

  finalize() {
    if (this._contextMenuHandler) {
      // @ts-ignore accessing eventManager element
      this.eventManager?.element?.removeEventListener('contextmenu', this._contextMenuHandler);
      this._contextMenuHandler = null;
    }
    super.finalize();
  }
}
