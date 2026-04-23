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

    constructor(view: SceneView, props: DeckProps) {
      this.view = view;
      this.deck = new DeckProps(props);

      // Guard against concurrent initialization attempts (e.g. if render fires
      // multiple times before the async init completes).
      let isInitializing = false;

      // Alias outer `this` for use inside the RenderNode.createSubclass()
      // callbacks below, where `this` refers to the RenderNode instance.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const DeckRenderNode = RenderNode.createSubclass({
        consumes: {required: ['composite-color']},
        produces: 'composite-color',

        initialize() {},

        render(inputs: Array<{name: string}>) {
          // `this` here is the RenderNode instance, typed loosely because
          // ArcGIS's RenderNode.createSubclass() does not surface types.
          // biome-ignore lint/complexity/noThisInStatic: RenderNode render is an instance method
          // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
          const renderNode: any = this;
          const passthrough = inputs.find(i => i.name === 'composite-color');

          // Lazy init: the first render() call is the earliest point at which
          // `gl` is guaranteed to be available on the RenderNode.
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

          // bindRenderTarget() must be called BEFORE render() so that the
          // FRAMEBUFFER_BINDING captured inside commons.render() points at the
          // OUTPUT framebuffer rather than the composite-color INPUT.
          const output = renderNode.bindRenderTarget();

          // Use gl drawing buffer rather than view.size, which can include
          // non-GL chrome pixels.
          const gl = renderNode.gl as WebGL2RenderingContext;

          const dpr = window.devicePixelRatio || 1;
          const width = gl.drawingBufferWidth / dpr;
          const height = gl.drawingBufferHeight / dpr;

          // deck.gl's 512-px tile convention: at zoom z / latitude φ,
          // ground-meters-per-pixel = 78271.5 * cos(φ) / 2^z. ArcGIS's
          // `view.scale` is related to ArcGIS's `view.resolution` by
          // `resolution = scale / 3779.527559` (96 DPI), where resolution
          // is *projected* Web-Mercator meters-per-pixel. Ground mpp at
          // latitude is `resolution * cos(φ)` — the cos(φ) stretch is
          // baked into both sides, so it cancels when equating deck ground
          // mpp to ArcGIS ground mpp. The zoom formula is therefore:
          //   zoom = log2(591657550.5 / view.scale) - 1
          // (the `-1` converts the 256-px constant to deck's 512-px
          // convention.) Earlier revisions included a `* cos(lat)` factor
          // here; that was wrong — it was inadvertently matching
          // *projected* Mercator mpp instead of ground mpp, and caused
          // the deck layer to render ~26% smaller than the basemap at SF
          // latitudes.
          // deck.gl's `altitude` is the camera distance above the focal
          // plane, measured in viewport-height units. In deck.gl,
          // `altitude` couples camera distance with projection FOV:
          //   verticalFOV = 2 * atan(0.5 / altitude)
          // and the camera sits at slant distance = altitude from the
          // focal point regardless of pitch.
          //
          // ArcGIS behaves differently: it uses a fixed 55° *diagonal*
          // FOV and moves the camera closer to the focal point as tilt
          // increases (keeping the focal point at screen center). Using
          // the FOV-only formula (altitude = 0.5 / tan(verticalFOV/2))
          // works at tilt=0 but diverges at high tilt because ArcGIS's
          // actual camera is closer.
          //
          // We match ArcGIS by deriving altitude from the *actual*
          // slant distance between `camera.position` and the focal
          // point on the ground, expressed in viewport-height units.
          const cameraPos = self.view.camera.position;
          const focalPoint = self.view.toMap({x: width / 2, y: height / 2} as any);
          const latitude = focalPoint ? focalPoint.latitude : self.view.center.latitude;
          const longitude = focalPoint ? focalPoint.longitude : self.view.center.longitude;

          // Horizontal ground distance from camera to focal point (meters).
          // Use a flat-earth approximation; viewingMode='local' in the
          // SceneView makes this exact.
          const midLatRad = (((latitude + cameraPos.latitude) / 2) * Math.PI) / 180;
          const dLatM = (cameraPos.latitude - latitude) * METERS_PER_DEG_LAT;
          const dLngM =
            (cameraPos.longitude - longitude) * METERS_PER_DEG_LAT * Math.cos(midLatRad);
          const horizM = Math.sqrt(dLatM * dLatM + dLngM * dLngM);
          const slantM = Math.sqrt(horizM * horizM + cameraPos.z * cameraPos.z);

          const zoom = getZoom(self.view, longitude, latitude, width, height);

          // Viewport height in meters at the focal plane. ArcGIS's
          // `view.resolution` is meters-per-pixel at the focal point.
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

    // Kept for API compatibility. Resource initialization now happens lazily
    // inside the RenderNode's render() callback on the first frame.
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
