import {LayerExtension} from '@deck.gl/core';
import TerrainEffect from './terrain-effect';
import shaderModule from './shader-module';

import type {Layer} from '@deck.gl/core';

const defaultProps = {
  fittingMode: undefined
};

export type TerrainExtensionProps = {
  /**
   * controls whether an object is drawn over the terrain surface by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  fittingMode?: 'offset' | 'drape';
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
    let {fittingMode} = this.props;

    // Infer by geometry if 'fittingMode' option isn't explictly set
    if (!fittingMode) {
      // @ts-ignore `extruded` may not exist in props
      const is3d = this.props.extruded as boolean;
      const isInstanced = 'instancePositions' in this.getAttributeManager()!.attributes;
      fittingMode = is3d || isInstanced ? 'offset' : 'drape';
    }

    (this.state as TerrainExtensionState).terrainFittingMode = fittingMode;

    return {
      modules: [shaderModule]
    };
  }

  initializeState(this: Layer<TerrainExtensionProps>) {
    this.context.deck?._addDefaultEffect(new TerrainEffect());
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
