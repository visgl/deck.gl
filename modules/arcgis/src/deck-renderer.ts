// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-invalid-this */
import {initializeResources, render, finalizeResources, RenderResources} from './commons';

import SceneView from '@arcgis/core/views/SceneView';
import type {DeckProps} from '@deck.gl/core';
import MapView from '../../core/src/views/map-view';

// Web Mercator scale at zoom 0 for 256 px tiles; deck.gl uses 512 px tiles,
// so the final zoom is shifted by -1.
const ARCGIS_WEB_MERCATOR_SCALE_AT_ZOOM_0 = 591657550.5;
const DECK_GROUND_MPP_AT_ZOOM_0 = 78271.484;
const METERS_PER_DEG_LAT = 111320;
const ARCGIS_DIAGONAL_FOV_RADIANS = (55 * Math.PI) / 180;
const ALTITUDE_BLEND_START_TILT = 65;
const ALTITUDE_BLEND_END_TILT = 80;

function getDistanceMeters(a, b) {
  const midLatRad = (((a.latitude + b.latitude) / 2) * Math.PI) / 180;
  const dLatM = (a.latitude - b.latitude) * METERS_PER_DEG_LAT;
  const dLngM = (a.longitude - b.longitude) * METERS_PER_DEG_LAT * Math.cos(midLatRad);

  return Math.sqrt(dLatM * dLatM + dLngM * dLngM);
}

function getZoom(
  view: SceneView,
  longitude: number,
  latitude: number,
  width: number,
  height: number
) {
  const focalPoint = view.toMap({x: width / 2, y: height / 2} as any);
  const focalPointRight = view.toMap({x: width / 2 + 1, y: height / 2} as any);

  if (focalPoint && focalPointRight) {
    const horizontalMetersPerPixel = getDistanceMeters(focalPoint, focalPointRight);

    if (horizontalMetersPerPixel > 0) {
      const latitudeRad = (latitude * Math.PI) / 180;
      return Math.log2(
        (DECK_GROUND_MPP_AT_ZOOM_0 * Math.cos(latitudeRad)) / horizontalMetersPerPixel
      );
    }
  }

  return Math.log2(ARCGIS_WEB_MERCATOR_SCALE_AT_ZOOM_0 / view.scale) - 1;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getFovMatchedAltitude(width: number, height: number) {
  const aspect = width / height;
  const verticalTan = Math.tan(ARCGIS_DIAGONAL_FOV_RADIANS / 2) / Math.sqrt(1 + aspect * aspect);

  return 0.5 / verticalTan;
}

function getAltitude(tilt: number, slantAltitude: number, width: number, height: number) {
  const fovAltitude = getFovMatchedAltitude(width, height);
  const blend = smoothstep(ALTITUDE_BLEND_START_TILT, ALTITUDE_BLEND_END_TILT, tilt);

  return slantAltitude * (1 - blend) + fovAltitude * blend;
}

function getArcGISMatrixViewState(
  view: SceneView,
  longitude: number,
  latitude: number,
  zoom: number,
  resolution: number,
  altitude: number
) {
  return {
    views: new MapView({id: 'arcgis-scene'}),
    viewState: {
      'arcgis-scene': {
        id: 'arcgis-scene',
        longitude,
        latitude,
        zoom,
        pitch: view.camera.tilt,
        bearing: view.camera.heading,
        altitude,
        position: [0, 0, 0],
        resolution
      }
    }
  };
}

export default function createDeckRenderer(DeckProps, RenderNode) {
  class DeckRenderer {
    view: SceneView;
    deck: any;
    resources: RenderResources | null = null;
    cancelInitialization: (() => void) | null = null;
    renderNode: any = null;

    constructor(viewOrProps: SceneView | ({view: SceneView} & DeckProps), props?: DeckProps) {
      if (viewOrProps && typeof viewOrProps === 'object' && 'view' in viewOrProps) {
        const {view, ...deckProps} = viewOrProps;
        this.view = view;
        this.deck = new DeckProps(deckProps);
      } else {
        this.view = viewOrProps;
        this.deck = new DeckProps(props);
      }

      let isInitializing = false;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const DeckRenderNode = RenderNode.createSubclass({
        consumes: {required: ['composite-color']},
        produces: 'composite-color',

        initialize() {},

        render(inputs: Array<{name: string}>) {
          // biome-ignore lint/complexity/noThisInStatic: RenderNode render is an instance method
          // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
          const renderNode: any = this;
          const passthrough = inputs.find(i => i.name === 'composite-color');

          if (!self.resources && !isInitializing) {
            const gl = renderNode.gl;
            if (gl) {
              isInitializing = true;
              let cancelled = false;
              self.cancelInitialization = () => {
                cancelled = true;
              };
              initializeResources
                .call(self, gl)
                .then(resources => {
                  isInitializing = false;
                  if (cancelled) {
                    finalizeResources(resources);
                    return;
                  }
                  self.deck.on('change', deckProps => resources.deck.setProps(deckProps));
                  resources.deck.setProps(self.deck.toJSON());
                  self.resources = resources;
                  renderNode.requestRender();
                })
                .catch(err => {
                  isInitializing = false;
                  // eslint-disable-next-line no-console
                  console.error('DeckRenderer: failed to initialize resources', err);
                });
            }
            return passthrough;
          }
          if (!self.resources) {
            return passthrough;
          }

          const output = renderNode.bindRenderTarget();
          const gl = renderNode.gl as WebGL2RenderingContext;

          const dpr = window.devicePixelRatio || 1;
          const width = gl.drawingBufferWidth / dpr;
          const height = gl.drawingBufferHeight / dpr;

          // Keep deck.gl's SceneView approximation anchored at the ArcGIS
          // focal point every frame. Zoom comes from the actual horizontal
          // ground meters-per-pixel at screen center (`toMap(center)` and
          // `toMap(center + 1px)`), which stays stable under tilt in local
          // SceneView. We keep the older `view.scale` formula only as a
          // fallback when focal-point sampling is unavailable.
          //
          // deck.gl's `altitude` still couples camera distance and FOV, while
          // ArcGIS keeps them separate. We therefore compute a slant-distance
          // altitude from the live camera position and focal point, then only
          // at high tilt blend toward the ArcGIS fixed-FOV altitude. That
          // preserves the better mid-tilt camera match while reducing the
          // remaining extreme-angle drift.
          const cameraPos = self.view.camera.position;
          const focalPoint = self.view.toMap({x: width / 2, y: height / 2} as any);
          const latitude = focalPoint ? focalPoint.latitude : self.view.center.latitude;
          const longitude = focalPoint ? focalPoint.longitude : self.view.center.longitude;

          const midLatRad = (((latitude + cameraPos.latitude) / 2) * Math.PI) / 180;
          const dLatM = (cameraPos.latitude - latitude) * METERS_PER_DEG_LAT;
          const dLngM =
            (cameraPos.longitude - longitude) * METERS_PER_DEG_LAT * Math.cos(midLatRad);
          const horizM = Math.sqrt(dLatM * dLatM + dLngM * dLngM);
          const slantM = Math.sqrt(horizM * horizM + cameraPos.z * cameraPos.z);

          const zoom = getZoom(self.view, longitude, latitude, width, height);

          const viewportHeightM = height * self.view.resolution;
          const slantAltitude = slantM / viewportHeightM;
          const altitude = getAltitude(self.view.camera.tilt, slantAltitude, width, height);
          const arcgisMatrixView = getArcGISMatrixViewState(
            self.view,
            longitude,
            latitude,
            zoom,
            self.view.resolution,
            altitude
          );

          try {
            if (arcgisMatrixView) {
              render(self.resources, {
                width,
                height,
                latitude,
                longitude,
                altitude,
                zoom,
                bearing: self.view.camera.heading,
                pitch: self.view.camera.tilt,
                ...arcgisMatrixView
              });
            } else {
              render(self.resources, {
                width,
                height,
                latitude,
                longitude,
                altitude,
                zoom,
                bearing: self.view.camera.heading,
                pitch: self.view.camera.tilt
              });
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('DeckRenderer: render error', e);
          }

          return output;
        }
      });

      this.renderNode = new DeckRenderNode({view: this.view});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async setup(_context?: unknown) {}

    dispose() {
      this.cancelInitialization?.();
      if (this.resources) {
        finalizeResources(this.resources);
        this.resources = null;
      }
      this.renderNode = null;
    }

    redraw() {
      this.renderNode?.requestRender();
    }

    render() {
      this.renderNode?.requestRender();
    }
  }

  return DeckRenderer;
}
