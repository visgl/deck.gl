import {withParameters} from '@luma.gl/core';
import {Layer, Viewport, _LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';
import type {HeightMapBuilder} from './height-map-builder';
import type {TerrainCover} from './terrain-cover';

import GL from '@luma.gl/constants';

export type TerrainPassRenderOptions = LayersPassRenderOptions;

/** Renders textures used by the TerrainEffect render pass */
export class TerrainPass extends LayersPass {
  getRenderableLayers(viewport: Viewport, opts: TerrainPassRenderOptions): Layer[] {
    const {layers} = opts;
    const result: Layer[] = [];
    const drawParamsByIndex = this._getDrawLayerParams(viewport, opts, true);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isComposite && drawParamsByIndex[i].shouldDrawLayer) {
        result.push(layer);
      }
    }

    return result;
  }

  renderHeightMap(heightMap: HeightMapBuilder, opts: Partial<TerrainPassRenderOptions>) {
    // console.log('Updating height map')
    const target = heightMap.getRenderFramebuffer();
    const viewport = heightMap.renderViewport;

    if (!target || !viewport) {
      return;
    }

    target.resize(viewport);

    withParameters(
      this.gl,
      {
        clearColor: [0, 0, 0, 0],
        blend: true,
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: GL.MAX,
        depthTest: false
      },
      () =>
        this.render({
          ...opts,
          target,
          pass: 'terrain-height-map',
          layers: opts.layers!,
          viewports: [viewport],
          effects: []
        })
    );
  }

  renderTerrainCover(terrainCover: TerrainCover, opts: Partial<TerrainPassRenderOptions>) {
    // console.log('Updating terrain cover ' + terrainCover.id)
    const target = terrainCover.getRenderFramebuffer();
    const viewport = terrainCover.renderViewport;

    if (!target || !viewport) {
      return;
    }

    const layers = terrainCover.filterLayers(opts.layers!);
    target.resize(viewport);

    withParameters(
      this.gl,
      {
        clearColor: [0, 0, 0, 0],
        depthTest: false
      },
      () =>
        this.render({
          ...opts,
          target,
          pass: `terrain-cover-${terrainCover.id}`,
          layers,
          effects: [],
          viewports: [viewport]
        })
    );
  }
}
