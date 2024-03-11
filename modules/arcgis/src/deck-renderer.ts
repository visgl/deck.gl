/* eslint-disable no-invalid-this */
import {WebGLDevice} from '@luma.gl/webgl';
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

    constructor(view: SceneView, props: DeckProps) {
      this.view = view;
      this.deck = new DeckProps(props);
    }

    setup(context) {
      const gl = context.gl;
      const device = WebGLDevice.attach(gl);
      const resources = initializeResources.call(this, device);

      this.deck.on('change', props => resources.deck.setProps(props));

      resources.deck.setProps(this.deck.toJSON());
      this.resources = resources;
    }

    dispose() {
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
