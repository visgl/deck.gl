// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import MapController from './map-controller';
import {MapState, MapStateProps} from './map-controller';
import type {ControllerProps, InteractionState} from './controller';
import type {MjolnirGestureEvent, MjolnirWheelEvent} from 'mjolnir.js';

/**
 * Controller that extends MapController with terrain-aware behavior.
 * The camera smoothly follows terrain elevation during pan/zoom.
 */
export default class TerrainController extends MapController {
  /** Cached terrain altitude from depth picking at viewport center (smoothed) */
  private _terrainAltitude?: number = undefined;
  /** Raw (unsmoothed) terrain altitude from latest pick */
  private _terrainAltitudeTarget?: number = undefined;
  /** rAF handle for periodic terrain altitude picking */
  private _pickFrameId: number | null = null;
  /** Timestamp of last pick */
  private _lastPickTime: number = 0;

  setProps(
    props: ControllerProps &
      MapStateProps & {
        rotationPivot?: 'center' | '2d' | '3d';
        getAltitude?: (pos: [number, number]) => number | undefined;
      }
  ) {
    super.setProps({rotationPivot: '3d', ...props});

    // Periodically pick terrain altitude at the viewport center using rAF.
    // This keeps the altitude cache warm so interactions (zoom, pan)
    // don't need expensive synchronous GPU readbacks.
    // rAF naturally pauses when the tab is backgrounded.
    if (this._pickFrameId === null) {
      const loop = () => {
        const now = Date.now();
        if (now - this._lastPickTime > 500 && !this.isDragging()) {
          this._lastPickTime = now;
          this._pickTerrainCenterAltitude();
        }
        this._pickFrameId = requestAnimationFrame(loop);
      };
      this._pickFrameId = requestAnimationFrame(loop);
    }
  }

  finalize() {
    if (this._pickFrameId !== null) {
      cancelAnimationFrame(this._pickFrameId);
      this._pickFrameId = null;
    }
    super.finalize();
  }

  protected updateViewport(
    newControllerState: MapState,
    extraProps: Record<string, any> | null = null,
    interactionState: InteractionState = {}
  ): void {
    const SMOOTHING = 0.05;

    // No interactions yet, do not update
    if (this._terrainAltitudeTarget === undefined) return;

    if (this._terrainAltitude === undefined) {
      // First interaction, rebase to avoid jump
      this._terrainAltitude = this._terrainAltitudeTarget;
      extraProps = this._rebaseViewport(
        this._terrainAltitudeTarget,
        newControllerState,
        extraProps
      );
    } else {
      // Standard interaction, smoothly blend target into actual altitude
      this._terrainAltitude += (this._terrainAltitudeTarget - this._terrainAltitude) * SMOOTHING;
    }

    const viewportProps = newControllerState.getViewportProps();
    const pos = viewportProps.position || [0, 0, 0];
    extraProps = {
      ...extraProps,
      position: [pos[0], pos[1], this._terrainAltitude]
    };

    super.updateViewport(newControllerState, extraProps, interactionState);
  }

  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    this._pickTerrainCenterAltitude();
    return super._onPanStart(event);
  }

  protected _onWheel(event: MjolnirWheelEvent): boolean {
    return super._onWheel(event);
  }

  protected _onDoubleClick(event: MjolnirGestureEvent): boolean {
    return super._onDoubleClick(event);
  }

  private _pickTerrainCenterAltitude(): void {
    if (!this.pickPosition) {
      return;
    }
    const {x, y, width, height} = this.props;
    const pickResult = this.pickPosition(x + width / 2, y + height / 2);
    if (pickResult?.coordinate && pickResult.coordinate.length >= 3) {
      this._terrainAltitudeTarget = pickResult.coordinate[2];
    }
  }

  /**
   * Utility function to return viewport that looks the same, but with
   * a position shifted to [0, 0, altitude]
   */
  private _rebaseViewport(
    altitude: number,
    newControllerState: MapState,
    extraProps: Record<string, any> | null
  ): Record<string, any> | null {
    const viewportProps = newControllerState.getViewportProps();
    const oldViewport = this.makeViewport({...viewportProps, position: [0, 0, 0]});
    const oldCameraPos = oldViewport.cameraPosition;

    const centerZOffset = altitude * oldViewport.distanceScales.unitsPerMeter[2];
    const cameraHeightAboveOldCenter = oldCameraPos[2];
    const newCameraHeightAboveCenter = cameraHeightAboveOldCenter - centerZOffset;
    if (newCameraHeightAboveCenter <= 0) {
      return extraProps;
    }

    const zoomDelta = Math.log2(cameraHeightAboveOldCenter / newCameraHeightAboveCenter);
    const newZoom = viewportProps.zoom + zoomDelta;

    const newViewport = this.makeViewport({
      ...viewportProps,
      zoom: newZoom,
      position: [0, 0, altitude]
    });
    const {width, height} = viewportProps;
    const screenCenter: [number, number] = [width / 2, height / 2];
    const worldPoint = oldViewport.unproject(screenCenter, {targetZ: altitude});
    if (
      worldPoint &&
      'panByPosition3D' in newViewport &&
      typeof newViewport.panByPosition3D === 'function'
    ) {
      const adjusted = newViewport.panByPosition3D(worldPoint, screenCenter);
      return {...extraProps, position: [0, 0, altitude], zoom: newZoom, ...adjusted};
    }
    return extraProps;
  }
}
