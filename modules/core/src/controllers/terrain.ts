// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Controller from './controller';
import type {ControllerProps, InteractionState} from './controller';

/* A TypeScript mixin cannot see a base class's `protected` members through the
 * generic constructor, so the few protected Controller members this mixin reads
 * (`props`, `state`, `makeViewport`, `pickPosition`, `ControllerState`) are cast.
 * Runtime behavior is identical to a direct subclass. */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type TerrainControllerProps = {
  /** Pivot for rotation: `'center'` | `'2d'` | `'3d'`. Terrain defaults to `'3d'`. */
  rotationPivot?: 'center' | '2d' | '3d';
  getAltitude?: (pos: [number, number]) => number | undefined;
};

type Constructor<T> = abstract new (...args: any[]) => T;

/**
 * Mixin that adds terrain-following to any `Controller`: the camera smoothly
 * follows terrain elevation (depth-picked at the viewport center) during
 * interaction, and rotation defaults to pivoting around the 3D point under the
 * pointer.
 *
 * Composed into `TerrainController` (= `withTerrain(MapController)`) and
 * `GlobeController` (= `withTerrain(Controller<GlobeState>)`) so neither view's
 * controller inherits the other — the globe gets terrain-awareness without
 * pulling in MapController's Web-Mercator semantics.
 */
export function withTerrain<TBase extends Constructor<Controller<any>>>(
  Base: TBase
): Constructor<InstanceType<TBase>> {
  abstract class TerrainAware extends Base {
    /** Cached terrain altitude from depth picking at viewport center (smoothed) */
    private _terrainAltitude?: number = undefined;
    /** Raw (unsmoothed) terrain altitude from latest pick */
    private _terrainAltitudeTarget?: number = undefined;
    /** rAF handle for periodic terrain altitude picking */
    private _pickFrameId: number | null = null;
    /** Timestamp of last pick */
    private _lastPickTime: number = 0;

    setProps(props: ControllerProps & TerrainControllerProps & Record<string, any>) {
      // Terrain interaction rotates around the 3D point under the pointer.
      super.setProps({rotationPivot: '3d', ...props} as any);

      // Periodically pick terrain altitude at the viewport center using rAF, so
      // interactions don't need expensive synchronous GPU readbacks. rAF
      // naturally pauses when the tab is backgrounded.
      if (this._pickFrameId === null) {
        const loop = () => {
          const now = Date.now();
          if (now - this._lastPickTime > 500 && !this.isDragging()) {
            this._lastPickTime = now;
            this._pickTerrainCenterAltitude();
            // On first successful pick, rebase the viewport to terrain altitude.
            // Runs from rAF (outside React render) so onViewStateChange won't loop.
            if (this._terrainAltitude === undefined && this._terrainAltitudeTarget !== undefined) {
              this._terrainAltitude = this._terrainAltitudeTarget;
              const ControllerState = (this as any).ControllerState;
              const controllerState = new ControllerState({
                makeViewport: (this as any).makeViewport,
                ...(this as any).props,
                ...(this as any).state
              });
              const rebaseProps = this._rebaseViewport(
                this._terrainAltitudeTarget,
                controllerState
              );
              if (rebaseProps) {
                // Include the rebase adjustments so internal state matches the
                // rebased viewState after the React round-trip.
                const rebasedState = new ControllerState({
                  makeViewport: (this as any).makeViewport,
                  ...(this as any).props,
                  ...(this as any).state,
                  ...rebaseProps
                });
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
      newControllerState: any,
      extraProps: Record<string, any> | null = null,
      interactionState: InteractionState = {}
    ): void {
      // Not initialized yet — pass through.
      if (this._terrainAltitude === undefined) {
        super.updateViewport(newControllerState, extraProps, interactionState);
        return;
      }

      // Smoothly blend toward the target altitude.
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
      const pickPosition = (this as any).pickPosition;
      if (!pickPosition) {
        return;
      }
      const {x, y, width, height} = (this as any).props;
      const pickResult = pickPosition(x + width / 2, y + height / 2);
      if (pickResult?.coordinate && pickResult.coordinate.length >= 3) {
        this._terrainAltitudeTarget = pickResult.coordinate[2];
      }
    }

    /**
     * Compute viewport adjustments to keep the view visually the same when
     * shifting position to `[0, 0, altitude]`.
     */
    private _rebaseViewport(altitude: number, newControllerState: any): Record<string, any> | null {
      const viewportProps = newControllerState.getViewportProps();
      const makeViewport = (this as any).makeViewport;
      const oldViewport = makeViewport({...viewportProps, position: [0, 0, 0]});
      const oldCameraPos = oldViewport.cameraPosition;

      const centerZOffset = altitude * oldViewport.distanceScales.unitsPerMeter[2];
      const cameraHeightAboveOldCenter = oldCameraPos[2];
      const newCameraHeightAboveCenter = cameraHeightAboveOldCenter - centerZOffset;
      if (newCameraHeightAboveCenter <= 0) {
        return null;
      }

      const zoomDelta = Math.log2(cameraHeightAboveOldCenter / newCameraHeightAboveCenter);
      const newZoom = viewportProps.zoom + zoomDelta;

      const newViewport = makeViewport({
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
  // The mixin overrides only existing members (setProps/finalize/updateViewport),
  // so the public surface is unchanged from the base. Returning a *named* constructor
  // type — not the inferred anonymous class — lets declaration emit name the base;
  // without it, exported subclasses hit TS4094 on every inherited private/protected
  // member. InstanceType<TBase> keeps the base's bound generic (e.g. the globe's
  // Controller<GlobeState> members) visible to subclasses.
  return TerrainAware as unknown as Constructor<InstanceType<TBase>>;
}
