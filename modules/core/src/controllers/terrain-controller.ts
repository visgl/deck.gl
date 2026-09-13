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
    // Keeps the altitude cache warm so interactions don't need expensive
    // synchronous GPU readbacks. rAF naturally pauses when tab is backgrounded.
    if (this._pickFrameId === null) {
      const loop = () => {
        const now = Date.now();
        if (now - this._lastPickTime > 500 && !this.isDragging()) {
          this._lastPickTime = now;
          this._pickTerrainCenterAltitude();
          // On first successful pick, rebase viewport to terrain altitude.
          // Runs from rAF (outside React render) so onViewStateChange won't loop.
          if (this._terrainAltitude === undefined && this._terrainAltitudeTarget !== undefined) {
            this._terrainAltitude = this._terrainAltitudeTarget;
            const controllerState = new this.ControllerState({
              makeViewport: this.makeViewport,
              ...this.props,
              ...this.state
            } as any);
            const rebaseProps = this._rebaseViewport(this._terrainAltitudeTarget, controllerState);
            if (rebaseProps) {
              // Build a controllerState that includes the rebase adjustments so
              // internal state matches the rebased viewState after React round-trip.
              const rebasedState = new this.ControllerState({
                makeViewport: this.makeViewport,
                ...this.props,
                ...this.state,
                ...rebaseProps
              } as any);
              super.updateViewport(rebasedState);
            }
          }
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
    // Not initialized yet — pass through to MapController
    if (this._terrainAltitude === undefined) {
      super.updateViewport(newControllerState, extraProps, interactionState);
      return;
    }

    // Smoothly blend toward target altitude
    const SMOOTHING = 0.05;
    this._terrainAltitude += (this._terrainAltitudeTarget! - this._terrainAltitude) * SMOOTHING;

    const viewportProps = newControllerState.getViewportProps();
    const pos = viewportProps.position || [0, 0, 0];
    extraProps = {
      ...extraProps,
      position: [pos[0], pos[1], this._terrainAltitude]
    };

    super.updateViewport(newControllerState, extraProps, interactionState);
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
   * Compute viewport adjustments to keep the view visually the same
   * when shifting position to [0, 0, altitude].
   */
  private _rebaseViewport(
    altitude: number,
    newControllerState: MapState
  ): Record<string, any> | null {
    const viewportProps = newControllerState.getViewportProps();
    const oldViewport = this.makeViewport({...viewportProps, position: [0, 0, 0]});
    const oldCameraPos = oldViewport.cameraPosition;

    const centerZOffset = altitude * oldViewport.distanceScales.unitsPerMeter[2];
    const cameraHeightAboveOldCenter = oldCameraPos[2];
    const newCameraHeightAboveCenter = cameraHeightAboveOldCenter - centerZOffset;
    if (newCameraHeightAboveCenter <= 0) {
      return null;
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
      return {position: [0, 0, altitude], zoom: newZoom, ...adjusted};
    }
    return null;
  }
}
