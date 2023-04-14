import {Framebuffer} from '@luma.gl/core';
import {joinLayerBounds, getRenderBounds, makeViewport, Bounds} from '../utils/projection-utils';
import {createRenderTarget} from './utils';

import type {Viewport, Layer} from '@deck.gl/core';

const MAP_MAX_SIZE = 2048;

/**
 * Manages the lifecycle of the height map (a framebuffer that encodes elevation).
 * One instance of height map is is shared across all layers. It is updated when the viewport changes
 * or when some terrain source layer's data changes.
 * During the draw call of any terrainDrawMode:offset layers,
 * the vertex shader reads from this framebuffer to retrieve its z offset.
 */
export class HeightMapBuilder {
  /** Viewport used to draw into the texture */
  renderViewport: Viewport | null = null;
  /** Bounds of the height map texture, in cartesian space */
  bounds: Bounds | null = null;

  protected fbo?: Framebuffer;
  protected gl: WebGLRenderingContext;
  /** Last rendered layers */
  private layers: Layer[] = [];
  /** Last layer.getBounds() */
  private layersBounds: ([number[], number[]] | null)[] = [];
  /** The union of layersBounds in cartesian space */
  private layersBoundsCommon: Bounds | null = null;
  private lastViewport: Viewport | null = null;

  static isSupported(gl: WebGLRenderingContext): boolean {
    return Framebuffer.isSupported(gl, {colorBufferFloat: true});
  }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /** Returns the height map framebuffer for read/write access.
   * Returns null when the texture is invalid.
   */
  getRenderFramebuffer(): Framebuffer | null {
    if (!this.renderViewport) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.gl, {id: 'height-map', float: true});
    }
    return this.fbo;
  }

  /** Called every render cycle to check if the framebuffer needs update */
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

    const viewportChanged = !this.lastViewport || !viewport.equals(this.lastViewport);

    if (!this.layersBoundsCommon) {
      this.renderViewport = null;
    } else if (layersChanged || viewportChanged) {
      const bounds = getRenderBounds(this.layersBoundsCommon, viewport);
      if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
        this.renderViewport = null;
        return false;
      }

      this.bounds = bounds;
      this.lastViewport = viewport;

      const scale = viewport.scale;
      const pixelWidth = (bounds[2] - bounds[0]) * scale;
      const pixelHeight = (bounds[3] - bounds[1]) * scale;

      this.renderViewport =
        pixelWidth > 0 || pixelHeight > 0
          ? makeViewport({
              // It's not important whether the geometry is visible in this viewport, because
              // vertices will not use the standard project_to_clipspace in the DRAW_TO_HEIGHT_MAP shader
              // However the viewport must have the same center and zoom as the screen viewport
              // So that projection uniforms used for calculating z are the same
              bounds: [
                viewport.center[0] - 1,
                viewport.center[1] - 1,
                viewport.center[0] + 1,
                viewport.center[1] + 1
              ],
              zoom: viewport.zoom,
              width: Math.min(pixelWidth, MAP_MAX_SIZE),
              height: Math.min(pixelHeight, MAP_MAX_SIZE),
              viewport
            })
          : null;
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
