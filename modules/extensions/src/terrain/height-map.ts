import {Framebuffer} from '@luma.gl/core';
import {joinLayerBounds, getRenderBounds, Bounds} from '../common/projection-utils';
import {createRenderTarget} from './utils';

import type {Viewport, Layer} from '@deck.gl/core';

export class HeightMap {
  /** Viewport used to draw into the texture */
  renderViewport: Viewport | null = null;
  /** Bounds of the height map texture, in cartesian space */
  bounds: Bounds | null = null;

  private fbo?: Framebuffer;
  private gl: WebGLRenderingContext;
  /** Cached version of layer.getBounds() */
  private layersBounds: ([number[], number[]] | null)[] = [];
  /** The union of layersBounds in cartesian space */
  private layersBoundsCommon: Bounds | null = null;

  static isSupported(gl: WebGLRenderingContext): boolean {
    return Framebuffer.isSupported(gl, {colorBufferFloat: true});
  }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  getRenderFramebuffer(): Framebuffer | null {
    if (!this.renderViewport) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.gl, {id: 'height-map', float: true});
    }
    return this.fbo;
  }

  shouldUpdate({layers, viewport}: {layers: Layer[]; viewport: Viewport}): boolean {
    const layersChanged =
      this.layersBounds.length !== layers.length ||
      layers.some((layer, i) => {
        return layer.getBounds() !== this.layersBounds[i];
      });
    if (layersChanged) {
      this.layersBounds = layers.map(layer => layer.getBounds());
      this.layersBoundsCommon = joinLayerBounds(layers, viewport);
    }
    const viewportChanged = this.renderViewport !== viewport;

    if (!this.layersBoundsCommon) {
      this.renderViewport = null;
    } else if (layersChanged || viewportChanged) {
      this.bounds = getRenderBounds(this.layersBoundsCommon, viewport);
      this.renderViewport = viewport;
      return true;
    }
    return false;
  }

  delete() {
    if (this.fbo) {
      this.fbo.color.delete();
      this.fbo.delete();
    }
  }
}
