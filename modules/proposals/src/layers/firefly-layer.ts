// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {GlowPointLayer} from './glow-point-layer';

/** Fireflies reuse the additive point glow, projection, picking and borrowed-buffer ownership. */
export class FireflyLayer extends GlowPointLayer {
  static override layerName = 'FireflyLayer';
  static override defaultProps = {
    ...GlowPointLayer.defaultProps,
    radiusPixels: {type: 'number', value: 7, min: 0},
    animation: {enabled: 1, radius: 8, speed: 0.6, pulse: 0.85}
  };
}
