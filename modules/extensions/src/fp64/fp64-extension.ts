// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension, COORDINATE_SYSTEM} from '@deck.gl/core';
import project64 from './project64';

import type {Layer} from '@deck.gl/core';

/** @deprecated Adds the legacy 64-bit precision to geospatial layers. */
export default class Fp64Extension extends LayerExtension {
  static extensionName = 'Fp64Extension';

  getShaders(this: Layer): any {
    const {coordinateSystem} = this.props;
    if (
      coordinateSystem !== COORDINATE_SYSTEM.LNGLAT &&
      coordinateSystem !== COORDINATE_SYSTEM.DEFAULT
    ) {
      throw new Error('fp64: coordinateSystem must be LNGLAT');
    }

    return {
      modules: [project64]
    };
  }

  draw(this: Layer, params: any, extension: this): void {
    const {viewport} = params.context;
    this.setShaderModuleProps({project64: {viewport}});
  }
}
