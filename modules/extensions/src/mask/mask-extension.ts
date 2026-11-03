// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, LayerExtension, log, project, type ProjectUniforms} from '@deck.gl/core';
import mask, {MaskProps} from './shader-module';
import MaskEffect from './mask-effect';
import {
  getFlatCommonOrigin,
  isFlatViewport,
  lngLatToMercatorCommon
} from '../utils/projection-utils';

const defaultProps = {
  maskId: '',
  maskByInstance: undefined,
  maskInverted: false
};

export type MaskExtensionProps = {
  /**
   * Id of the layer that defines the mask. The mask layer must use the prop `operation: 'mask'`.
   * Masking is disabled if `maskId` is empty or no valid mask layer with the specified id is found.
   */
  maskId?: string;
  /**
   * controls whether an object is clipped by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  maskByInstance?: boolean;
  /**
   * Inverts the masking operation
   */
  maskInverted?: boolean;
};

/** Allows layers to show/hide objects by a geofence. */
export default class MaskExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'MaskExtension';

  initializeState(this: Layer<MaskExtensionProps>) {
    this.context.deck?._addDefaultEffect(new MaskEffect());
  }

  getShaders(this: Layer<MaskExtensionProps>): any {
    // Infer by geometry if 'maskByInstance' prop isn't explictly set
    let maskByInstance = 'instancePositions' in this.getAttributeManager()!.attributes;
    // Users can override by setting the `maskByInstance` prop
    if (this.props.maskByInstance !== undefined) {
      maskByInstance = Boolean(this.props.maskByInstance);
    }
    this.state.maskByInstance = maskByInstance;

    return {
      modules: [mask]
    };
  }

  /* eslint-disable camelcase */
  draw(this: Layer<Required<MaskExtensionProps>>, {context, shaderModuleProps}: any) {
    const maskProps = {} as MaskProps;
    maskProps.maskByInstance = Boolean(this.state.maskByInstance);
    const {maskId, maskInverted} = this.props;
    const {maskChannels} = shaderModuleProps.mask || {};
    const {viewport} = context;
    if (maskChannels && maskChannels[maskId]) {
      const {index, bounds} = maskChannels[maskId];
      maskProps.enabled = true;
      maskProps.channel = index;
      maskProps.inverted = maskInverted;

      // Bounds come from the mask viewport, independently of either layer's CRS and transforms:
      // WGS84 on geospatial views. Flatten them like project_common_position_to_flat() does.
      const projectUniforms = project.getUniforms(shaderModuleProps.project) as ProjectUniforms;
      const [originX, originY] = getFlatCommonOrigin(projectUniforms, viewport);
      const toFlat = isFlatViewport(viewport)
        ? (position: number[]) => viewport.projectPosition(position)
        : lngLatToMercatorCommon;
      const bl = toFlat([bounds[0], bounds[1], 0]);
      const tr = toFlat([bounds[2], bounds[3], 0]);
      maskProps.bounds = [bl[0] - originX, bl[1] - originY, tr[0] - originX, tr[1] - originY];
    } else {
      if (maskId) {
        log.warn(`Could not find a mask layer with id: ${maskId}`)();
      }
      maskProps.enabled = false;
    }

    this.setShaderModuleProps({mask: maskProps});
  }
}
