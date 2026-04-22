// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-invalid-this */
import {initializeResources, render, finalizeResources, RenderResources} from './commons';

import SceneView from '@arcgis/core/views/SceneView';
import type {DeckProps} from '@deck.gl/core';

// Web Mercator scale at zoom 0 for 256 px tiles; deck.gl uses 512 px tiles,
// so the final zoom is shifted by -1.
const ARCGIS_WEB_MERCATOR_SCALE_AT_ZOOM_0 = 591657550.5;

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
                  self.deck.on('change', props => resources.deck.setProps(props));
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
          const zoom = Math.log2(ARCGIS_WEB_MERCATOR_SCALE_AT_ZOOM_0 / self.view.scale) - 1;

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
          const METERS_PER_DEG_LAT = 111320;
          const midLatRad = (((latitude + cameraPos.latitude) / 2) * Math.PI) / 180;
          const dLatM = (cameraPos.latitude - latitude) * METERS_PER_DEG_LAT;
          const dLngM =
            (cameraPos.longitude - longitude) * METERS_PER_DEG_LAT * Math.cos(midLatRad);
          const horizM = Math.sqrt(dLatM * dLatM + dLngM * dLngM);
          const slantM = Math.sqrt(horizM * horizM + cameraPos.z * cameraPos.z);

          // Viewport height in meters at the focal plane. ArcGIS's
          // `view.resolution` is meters-per-pixel at the focal point.
          const viewportHeightM = height * self.view.resolution;
          const altitude = slantM / viewportHeightM;

          try {
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
