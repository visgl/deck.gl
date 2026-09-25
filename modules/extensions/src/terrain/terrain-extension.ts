// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension, UpdateParameters} from '@deck.gl/core';
import {TerrainEffect} from './terrain-effect';
import {terrainModule} from './shader-module';
import {terrainModuleWGSL} from './shader-module.wgsl';

import type {Layer} from '@deck.gl/core';

const defaultProps = {
  terrainDrawMode: undefined
};

export type TerrainExtensionProps = {
  /**
   * controls whether an object is drawn over the terrain surface by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer. WebGPU supports `offset` only.
   */
  terrainDrawMode?: 'offset' | 'drape';
};

type TerrainExtensionState = {
  /** Resolved fitting mode */
  terrainDrawMode: 'offset' | 'drape';
  /** Set when a layer is flagged as needs redraw */
  terrainCoverNeedsRedraw: boolean;
};

/** Fits layer anchors or geometry to terrain. WebGPU currently supports offset mode. */
export default class TerrainExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'TerrainExtension';

  getShaders(this: Layer<TerrainExtensionProps>): any {
    return {
      modules: [this.context.device.type === 'webgpu' ? terrainModuleWGSL : terrainModule]
    };
  }

  initializeState(this: Layer<TerrainExtensionProps>) {
    this.context.deck?._addDefaultEffect(new TerrainEffect());
  }

  updateState(
    this: Layer<TerrainExtensionProps>,
    params: UpdateParameters<Layer<TerrainExtensionProps>>
  ) {
    const {props, oldProps} = params;

    if (
      this.state.terrainDrawMode &&
      props.terrainDrawMode === oldProps.terrainDrawMode &&
      // @ts-ignore `extruded` may not exist in props
      props.extruded === oldProps.extruded
    ) {
      return;
    }

    let {terrainDrawMode} = props;
    if (!terrainDrawMode) {
      // props.extruded is used as an indication that the layer is 2.5D
      // @ts-ignore `extruded` may not exist in props
      const is3d = this.props.extruded as boolean;
      const attributes = this.getAttributeManager()?.attributes;
      const hasAnchor = attributes && 'instancePositions' in attributes;
      terrainDrawMode = is3d || hasAnchor ? 'offset' : 'drape';
    }
    if (this.context.device.type === 'webgpu' && terrainDrawMode === 'drape') {
      throw new Error('TerrainExtension: WebGPU supports terrainDrawMode: "offset" only');
    }
    this.setState({terrainDrawMode});
  }

  onNeedsRedraw(this: Layer<{}>): void {
    const state = this.state as TerrainExtensionState;
    if (state.terrainDrawMode === 'drape') {
      state.terrainCoverNeedsRedraw = true;
    }
  }
}
