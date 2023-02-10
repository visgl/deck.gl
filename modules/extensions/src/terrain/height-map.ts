import {Framebuffer} from '@luma.gl/core';
import {joinLayerBounds, getRenderBounds, makeViewport, Bounds} from '../common/projection-utils';
import {createRenderTarget} from './utils';

import type {Viewport, Layer} from '@deck.gl/core';

export class HeightMap {
  /** Viewport used to draw into the texture */
  renderViewport: Viewport | null = null;
  /** Bounds of the height map texture, in cartesian space */
  bounds: Bounds | null = null;

  private fbo?: Framebuffer;
  private gl: WebGLRenderingContext;
  /** Last rendered layers */
  private layers: Layer[] = [];
  /** Last layer.getBounds() */
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
      layers.length !== this.layers.length ||
      layers.some(
        (layer, i) =>
          // Layer instance is updated
          // Layer props might have changed
          // Undetermined props could have an effect on the output geometry of a terrain source,
          // for example getElevation+updateTriggers, elevationScale, modelMatrix
          layer !== this.layers[i] ||
          // Some prop is in transition
          layer.props.transitions ||
          // Layer's geometry bounds have changed
          layer.getBounds() !== this.layersBounds[i]
      );

    if (layersChanged) {
      // Recalculate cached bounds
      this.layers = layers;
      this.layersBounds = layers.map(layer => layer.getBounds());
      this.layersBoundsCommon = joinLayerBounds(layers, viewport);
    }

    const viewportChanged = !this.renderViewport || !viewport.equals(this.renderViewport);

    if (!this.layersBoundsCommon) {
      this.renderViewport = null;
    } else if (layersChanged || viewportChanged) {
      const bounds = getRenderBounds(this.layersBoundsCommon, viewport);
      const halfWidth = (bounds[2] - bounds[0]) / 2;
      const halfHeight = (bounds[3] - bounds[1]) / 2;
      this.bounds = bounds;
      this.renderViewport = makeViewport({
        // It's not important whether the geometry is visible in this viewport, because
        // vertices will not use the standard project_to_clipspace in the DRAW_TO_HEIGHT_MAP shader
        // However the viewport must have the same center and zoom as the screen viewport
        // So that projection uniforms used for calculating z are the same
        bounds: [
          viewport.center[0] - halfWidth,
          viewport.center[1] - halfHeight,
          viewport.center[0] + halfWidth,
          viewport.center[1] + halfHeight
        ],
        zoom: viewport.zoom,
        viewport
      });
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
