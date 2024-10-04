// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Layer, LayerExtension, log} from '@deck.gl/core';
import mask, {MaskProps} from './shader-module';
import MaskEffect from './mask-effect';

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
      const {index, bounds, coordinateOrigin: fromCoordinateOrigin} = maskChannels[maskId];
      let {coordinateSystem: fromCoordinateSystem} = maskChannels[maskId];
      maskProps.enabled = true;
      maskProps.channel = index;
      maskProps.inverted = maskInverted;

      if (fromCoordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
        fromCoordinateSystem = viewport.isGeospatial
          ? COORDINATE_SYSTEM.LNGLAT
          : COORDINATE_SYSTEM.CARTESIAN;
      }
      const opts = {modelMatrix: null, fromCoordinateOrigin, fromCoordinateSystem};
      const bl = this.projectPosition([bounds[0], bounds[1], 0], opts);
      const tr = this.projectPosition([bounds[2], bounds[3], 0], opts);
      maskProps.bounds = [bl[0], bl[1], tr[0], tr[1]];
    } else {
      if (maskId) {
        log.warn(`Could not find a mask layer with id: ${maskId}`)();
      }
      maskProps.enabled = false;
    }

    this.setShaderModuleProps({mask: maskProps});
  }
}
