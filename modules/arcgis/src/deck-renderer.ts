// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-invalid-this */
import {initializeResources, render, finalizeResources, RenderResources} from './commons';

import SceneView from '@arcgis/core/views/SceneView';
import type {DeckProps} from '@deck.gl/core';

/** Convert ArcGIS FOV to WebMercatorViewport altitude */
function arcgisFOVToDeckAltitude(fov: number, aspectRatio: number): number {
  // ArcGIS fov is corner-to-corner
  const D = Math.sqrt(1 + aspectRatio ** 2);
  const halfFOV = (fov / 2 / 180) * Math.PI;
  return D / 2 / Math.tan(halfFOV);
}

export default function createDeckRenderer(DeckProps, externalRenderers) {
  class DeckRenderer {
    view: SceneView;
    deck: any;
    resources: RenderResources | null = null;
    cancelInitialization: (() => void) | null = null;

    constructor(view: SceneView, props: DeckProps) {
      this.view = view;
      this.deck = new DeckProps(props);
    }

    async setup(context) {
      const gl = context.gl;

      let cancelled = false;
      this.cancelInitialization = () => (cancelled = true);
      const resources = await initializeResources.call(this, gl);
      // If the renderer got disposed while awaiting, do not proceed
      if (cancelled) {
        finalizeResources(resources);
        return;
      }

      this.deck.on('change', props => resources.deck.setProps(props));

      resources.deck.setProps(this.deck.toJSON());
      this.resources = resources;
    }

    dispose() {
      this.cancelInitialization?.();
      if (this.resources) {
        finalizeResources(this.resources);
      }
    }

    redraw() {
      externalRenderers.requestRender(this.view);
    }

    render() {
      const [width, height] = this.view.size;

      render(this.resources!, {
        width,
        height,
        latitude: this.view.center.latitude,
        longitude: this.view.center.longitude,
        altitude: arcgisFOVToDeckAltitude(this.view.camera.fov, width / height),
        zoom: this.view.zoom,
        bearing: this.view.camera.heading,
        pitch: this.view.camera.tilt
      });
    }
  }

  return DeckRenderer;
}
