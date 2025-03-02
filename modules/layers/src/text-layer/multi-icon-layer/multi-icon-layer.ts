// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log} from '@deck.gl/core';
import IconLayer from '../../icon-layer/icon-layer';

import {SdfProps, sdfUniforms} from './sdf-uniforms';
import fs from './multi-icon-layer-fragment.glsl';

import type {IconLayerProps} from '../../icon-layer/icon-layer';
import type {Accessor, Color, UpdateParameters, DefaultProps} from '@deck.gl/core';

// TODO expose as layer properties
const DEFAULT_BUFFER = 192.0 / 256;
const EMPTY_ARRAY = [];

type _MultiIconLayerProps<DataT> = {
  getIconOffsets?: Accessor<DataT, number[]>;
  sdf?: boolean;
  smoothing?: number;
  outlineWidth?: number;
  outlineColor?: Color;
};

export type MultiIconLayerProps<DataT = unknown> = _MultiIconLayerProps<DataT> &
  IconLayerProps<DataT>;

const defaultProps: DefaultProps<MultiIconLayerProps> = {
  getIconOffsets: {type: 'accessor', value: (x: any) => x.offsets},
  alphaCutoff: 0.001,
  smoothing: 0.1,
  outlineWidth: 0,
  outlineColor: {type: 'color', value: [0, 0, 0, 255]}
};

export default class MultiIconLayer<DataT, ExtraPropsT extends {} = {}> extends IconLayer<
  DataT,
  ExtraPropsT & Required<_MultiIconLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'MultiIconLayer';

  state!: IconLayer['state'] & {
    outlineColor: [number, number, number, number];
  };

  getShaders() {
    const shaders = super.getShaders();
    return {...shaders, modules: [...shaders.modules, sdfUniforms], fs};
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager!.addInstanced({
      instanceOffsets: {
        size: 2,
        accessor: 'getIconOffsets'
      },
      instancePickingColors: {
        type: 'uint8',
        size: 3,
        accessor: (object, {index, target: value}) => this.encodePickingColor(index, value)
      }
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps} = params;
    let {outlineColor} = props;

    if (outlineColor !== oldProps.outlineColor) {
      outlineColor = outlineColor.map(x => x / 255) as Color;
      outlineColor[3] = Number.isFinite(outlineColor[3]) ? outlineColor[3] : 1;

      this.setState({
        outlineColor
      });
    }
    if (!props.sdf && props.outlineWidth) {
      log.warn(`${this.id}: fontSettings.sdf is required to render outline`)();
    }
  }

  draw(params) {
    const {sdf, smoothing, outlineWidth} = this.props;
    const {outlineColor} = this.state;
    const outlineBuffer = outlineWidth
      ? Math.max(smoothing, DEFAULT_BUFFER * (1 - outlineWidth))
      : -1;

    const model = this.state.model!;
    const sdfProps: SdfProps = {
      buffer: DEFAULT_BUFFER,
      outlineBuffer,
      gamma: smoothing,
      enabled: Boolean(sdf),
      outlineColor
    };
    model.shaderInputs.setProps({sdf: sdfProps});
    super.draw(params);

    // draw text without outline on top to ensure a thick outline won't occlude other characters
    if (sdf && outlineWidth) {
      const {iconManager} = this.state;
      const iconsTexture = iconManager.getTexture();

      if (iconsTexture) {
        model.shaderInputs.setProps({sdf: {...sdfProps, outlineBuffer: DEFAULT_BUFFER}});
        model.draw(this.context.renderPass);
      }
    }
  }

  protected getInstanceOffset(icons: string): number[] {
    return icons ? Array.from(icons).flatMap(icon => super.getInstanceOffset(icon)) : EMPTY_ARRAY;
  }

  getInstanceColorMode(icons: string): number {
    return 1; // mask
  }

  getInstanceIconFrame(icons: string): number[] {
    return icons
      ? Array.from(icons).flatMap(icon => super.getInstanceIconFrame(icon))
      : EMPTY_ARRAY;
  }
}
