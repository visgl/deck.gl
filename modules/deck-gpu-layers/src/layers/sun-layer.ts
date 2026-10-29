// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {_GlobeViewport, type DefaultProps} from '@deck.gl/core';
import type {NumberArray3} from '@math.gl/core';
import {getSunPosition, getSkyDirection, getSunLight} from '@math.gl/sun';
import {SkyBodyLayer, type SkyBodyLayerProps} from './sky-body-layer';

export type SunLayerProps = SkyBodyLayerProps & {
  haloIntensity?: number;
  /** Linear radiance multiplier. Values above one require an HDR target to retain highlights. */
  radiance?: number;
};

/** Astronomy-positioned HDR solar disk, automatically projected in map and globe views. */
export class SunLayer extends SkyBodyLayer<SunLayerProps> {
  static override layerName = 'SunLayer';
  static override defaultProps: DefaultProps<SunLayerProps> = {
    ...SkyBodyLayer.defaultProps,
    color: {type: 'color', value: null, optional: true},
    radiance: {type: 'number', value: 8, min: 0},
    haloIntensity: {type: 'number', value: 0.3, min: 0}
  };
  protected override getBodyDirection(): Readonly<NumberArray3> {
    if (this.props.direction) return this.props.direction;
    const observer = this.getObserver();
    const position = getSunPosition(
      this.props.timestamp ?? Date.now(),
      observer.latitude,
      observer.longitude
    );
    return getSkyDirection(position.altitude, position.azimuth);
  }
  protected override getBodyColor(): NumberArray3 {
    const altitude =
      this.context.viewport instanceof _GlobeViewport
        ? Math.PI / 2
        : Math.asin(this.getBodyDirection()[2]);
    const light = getSunLight(altitude);
    const color = this.props.direction || this.props.color ? super.getBodyColor() : light.color;
    const intensity = this.props.radiance! * (this.props.direction ? 1 : light.intensity);
    return [color[0] * intensity, color[1] * intensity, color[2] * intensity];
  }
  protected override getBodySettings() {
    return {moon: 0, phase: 0.5, limbAngle: 0, halo: this.props.haloIntensity!};
  }
}
