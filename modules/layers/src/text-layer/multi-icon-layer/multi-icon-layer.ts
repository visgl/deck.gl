// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, createIterable} from '@deck.gl/core';
import IconLayer from '../../icon-layer/icon-layer';

import {SdfProps, sdfUniforms} from './sdf-uniforms';
import fs from './multi-icon-layer-fragment.glsl';

import type {IconLayerProps} from '../../icon-layer/icon-layer';
import type {
  Attribute,
  AccessorFunction,
  Color,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';

// TODO expose as layer properties
const DEFAULT_BUFFER = 192.0 / 256;
const EMPTY_ARRAY = [];

type _MultiIconLayerProps<DataT> = {
  getIconOffsets?: AccessorFunction<DataT, number[]>;
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
    const instanceIconDefs = attributeManager!.attributes.instanceIconDefs;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    instanceIconDefs.settings.update = this.calculateInstanceIconDefs;
    attributeManager!.addInstanced({
      instancePickingColors: {
        type: 'uint8',
        size: 4,
        accessor: (object, {index, target: value}) => this.encodePickingColor(index, value)
      }
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps, changeFlags} = params;
    const {outlineColor} = props;

    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.getIcon ||
        changeFlags.updateTriggersChanged.getIconOffsets)
    ) {
      this.getAttributeManager()!.invalidate('instanceIconDefs');
    }
    if (outlineColor !== oldProps.outlineColor) {
      const normalizedOutlineColor = [
        outlineColor[0] / 255,
        outlineColor[1] / 255,
        outlineColor[2] / 255,
        (outlineColor[3] ?? 255) / 255
      ];

      this.setState({
        outlineColor: normalizedOutlineColor
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

  protected calculateInstanceIconDefs(
    attribute: Attribute,
    {startRow, endRow}: {startRow: number; endRow: number}
  ) {
    const {data, getIcon, getIconOffsets} = this.props;
    let i = attribute.getVertexOffset(startRow);
    const output = attribute.value as Float32Array;
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const text = getIcon(object, objectInfo) as string; // forwarded getText
      const offsets = getIconOffsets(object, objectInfo); // text length x 2
      if (text) {
        let j = 0;
        for (const char of Array.from(text)) {
          const def = super.getInstanceIconDef(char);
          def[0] = offsets[j * 2];
          def[1] = offsets[j * 2 + 1];
          def[6] = 1; // mask
          output.set(def, i);
          i += attribute.size;
          j++;
        }
      }
    }
  }
}
