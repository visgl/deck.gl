import {LayerExtension, UpdateParameters} from '@deck.gl/core';
import TerrainEffect from './terrain-effect';
import shaderModule from './shader-module';

import type {Layer} from '@deck.gl/core';

const defaultProps = {
  terrainFittingMode: undefined
};

export type TerrainExtensionProps = {
  /**
   * controls whether an object is drawn over the terrain surface by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  terrainFittingMode?: 'offset' | 'drape';
};

type TerrainExtensionState = {
  /** Resolved fitting mode */
  terrainFittingMode: 'offset' | 'drape';
  /** Set when a layer is flagged as needs redraw */
  terrainCoverNeedsRedraw: boolean;
};

/** Allows layers to show/hide objects by a geofence. */
export default class TerrainExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'TerrainExtension';

  getShaders(this: Layer<TerrainExtensionProps>): any {
    return {
      modules: [shaderModule]
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
      this.state.terrainFittingMode &&
      props.terrainFittingMode === oldProps.terrainFittingMode &&
      // @ts-ignore `extruded` may not exist in props
      props.extruded === oldProps.extruded
    ) {
      return;
    }

    let {terrainFittingMode} = props;
    if (!terrainFittingMode) {
      // props.extruded is used as an indication that the layer is 2.5D
      // @ts-ignore `extruded` may not exist in props
      const is3d = this.props.extruded as boolean;
      const attributes = this.getAttributeManager()?.attributes;
      const hasAnchor = attributes && 'instancePositions' in attributes;
      terrainFittingMode = is3d || hasAnchor ? 'offset' : 'drape';
    }
    this.setState({terrainFittingMode});
  }

  getNeedsRedraw(this: Layer<{}>): boolean {
    const state = this.state as TerrainExtensionState;
    if (state.terrainFittingMode === 'drape' && !state.terrainCoverNeedsRedraw) {
      // Save needs redraw flag from the layer
      // This flag will be checked during TerrainEffect.preRender
      const needsRedraw =
        this.internalState!.needsRedraw || this.getAttributeManager()!.needsRedraw;
      state.terrainCoverNeedsRedraw = Boolean(needsRedraw);
    }
    return false;
  }
}
