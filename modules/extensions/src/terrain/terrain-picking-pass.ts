// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  Viewport,
  LayersPassRenderOptions,
  _PickLayersPass as PickLayersPass
} from '@deck.gl/core';
import type {TerrainCover} from './terrain-cover';
import {Parameters} from '@luma.gl/core';

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
  drawParameters: Record<string, any> = {};

  getRenderableLayers(viewport: Viewport, opts: TerrainPickingPassRenderOptions): Layer[] {
    const {layers} = opts;
    const result: Layer[] = [];
    this.drawParameters = {};
    this._resetColorEncoder(opts.pickZ);
    const drawParamsByIndex = this._getDrawLayerParams(viewport, opts);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isComposite && drawParamsByIndex[i].shouldDrawLayer) {
        result.push(layer);
        this.drawParameters[layer.id] = drawParamsByIndex[i].layerParameters;
      }
    }

    return result;
  }

  renderTerrainCover(terrainCover: TerrainCover, opts: Partial<TerrainPickingPassRenderOptions>) {
    // console.log('Updating terrain cover for picking ' + terrainCover.id)
    const target = terrainCover.getPickingFramebuffer();
    const viewport = terrainCover.renderViewport;

    if (!target || !viewport) {
      return;
    }

    const layers = terrainCover.filterLayers(opts.layers!);
    const terrainLayer = terrainCover.targetLayer;
    if (terrainLayer.props.pickable) {
      layers.unshift(terrainLayer);
    }
    target.resize(viewport);

    // Use the terrain layer's encoded alpha as the cover clear color.
    // At pixels where no layer renders in the cover (e.g. mesh gaps at tile edges),
    // this ensures the pixel still maps to the terrain layer instead of MISS.
    const terrainParams = this.drawParameters[terrainLayer.id];
    const terrainAlpha = terrainParams?.blendColor?.[3] ?? 0;

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
      pickZ: false,
      clearColor: [0, 0, 0, terrainAlpha]
    });
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): Parameters {
    let parameters: any;
    if (this.drawParameters[layer.id]) {
      parameters = this.drawParameters[layer.id];
    } else {
      parameters = super.getLayerParameters(layer, layerIndex, viewport);
      parameters.blend = true;
    }
    // Cover rendering must use 'constant' blend factor to correctly encode layer indices
    // in the alpha channel. The main picking pass uses 'one' for terrain+draw layers to
    // pass through the cover alpha, but the cover itself needs proper encoding.
    return {...parameters, depthCompare: 'always', blendAlphaSrcFactor: 'constant'};
  }

  getShaderModuleProps(layer: Layer, effects: any, otherShaderModuleProps: Record<string, any>) {
    const base = super.getShaderModuleProps(layer, effects, otherShaderModuleProps);
    return {
      ...base,
      terrain: {
        project: otherShaderModuleProps.project
      }
    };
  }
}
