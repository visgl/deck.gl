import {
  Layer,
  Viewport,
  LayersPassRenderOptions,
  _PickLayersPass as PickLayersPass
} from '@deck.gl/core';
import type {TerrainCover} from './terrain-cover';

export type TerrainPickingPassRenderOptions = LayersPassRenderOptions & {
  pickZ: boolean;
};

/** Renders textures used by the TerrainEffect picking pass */
export class TerrainPickingPass extends PickLayersPass {
  /** Save layer index for use when drawing to terrain cover.
   * When a terrain cover's picking buffer is rendered,
   * we need to make sure each layer receives a consistent index (encoded in the alpha channel)
   * so that a picked color can be decoded back to the correct layer.
   * Updated in getRenderableLayers which is called in TerrainEffect.preRender
   */
  drawIndices: Record<string, number> = {};

  getRenderableLayers(viewport: Viewport, opts: TerrainPickingPassRenderOptions): Layer[] {
    const {layers} = opts;
    const result: Layer[] = [];
    this.drawIndices = {};
    this._resetColorEncoder(opts.pickZ);
    const drawParamsByIndex = this._getDrawLayerParams(viewport, opts, true);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isComposite && drawParamsByIndex[i].shouldDrawLayer) {
        result.push(layer);
        this.drawIndices[layer.id] = i;
      }
    }

    return result;
  }

  renderTerrainCover(terrainCover: TerrainCover, opts: Partial<TerrainPickingPassRenderOptions>) {
    const layers = terrainCover.filterLayers(opts.layers!);
    if (layers.length === 0) return;

    // console.log('Updating terrain cover for picking ' + terrainCover.id)
    const target = terrainCover.getPickingFramebuffer();
    const viewport = terrainCover.renderViewport;

    if (!target || !viewport) {
      return;
    }

    target.resize(viewport);

    this.render({
      ...opts,
      pickingFBO: target,
      pass: `terrain-cover-picking-${terrainCover.id}`,
      layers,
      effects: [],
      viewports: [viewport],
      // Disable the default culling because TileLayer would cull sublayers based on the screen viewport,
      // not the viewport of the terrain cover. Culling is already done by `terrainCover.filterLayers`
      cullRect: undefined,
      deviceRect: viewport,
      pickZ: opts.pickZ || false
    });
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any {
    if (this.drawIndices[layer.id]) {
      layerIndex = this.drawIndices[layer.id];
    }
    return super.getLayerParameters(layer, layerIndex, viewport);
  }
}
