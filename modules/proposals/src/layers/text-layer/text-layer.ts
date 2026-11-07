// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import type {RenderPass} from '@luma.gl/core';
import type {Model, ModelProps} from '@luma.gl/engine';
import {TextRenderer, type GPUTextData} from '@luma.gl/engine/text';
import {getTextRendererModel} from '@luma.gl/engine/text-experimental';
import type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

export type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

/** GPU-native prepared text props. Input text batches and atlas resources are borrowed. */
export type StorageTextLayerProps = Omit<LayerProps, 'data'> & {
  textData: GPUTextData | readonly GPUTextData[];
  /** Optional Deck-specific shader overrides applied to the prepared text strategy. */
  modelProps?: ModelProps;
};

type StorageTextLayerState = {
  renderer: TextRenderer | null;
  boundTextData: StorageTextLayerProps['textData'] | null;
  boundModelProps: ModelProps | undefined;
};

/** Deck host for caller-owned GPUTextData produced by any text adapter. */
export class StorageTextLayer extends Layer<StorageTextLayerProps> {
  static override layerName = 'StorageTextLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    this.setState({
      renderer: new TextRenderer(device, {
        data: this.props.textData,
        modelProps: this.props.modelProps
      }),
      boundTextData: this.props.textData,
      boundModelProps: this.props.modelProps
    } satisfies StorageTextLayerState);
  }

  override updateState({props}: UpdateParameters<this>): void {
    const state = this.state as StorageTextLayerState;
    if (props.textData !== state.boundTextData || props.modelProps !== state.boundModelProps) {
      state.renderer?.setProps({data: props.textData, modelProps: props.modelProps});
      this.setState({boundTextData: props.textData, boundModelProps: props.modelProps});
    }
  }

  override getModels(): Model[] {
    const renderer = (this.state as StorageTextLayerState | undefined)?.renderer;
    return renderer ? [getTextRendererModel(renderer)] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    (this.state as StorageTextLayerState).renderer?.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const result = info as GPUVectorLayerPickingInfo;
    const batches = normalizeTextData(this.props.textData);
    const batchIndex = batches.findIndex(
      batch =>
        result.index >= batch.rowIndexBase && result.index < batch.rowIndexBase + batch.rowCount
    );
    const batch = batches[batchIndex];
    result.gpuVector = batch
      ? {
          rowIndex: result.index,
          batchIndex,
          batchRowIndex: result.index - batch.rowIndexBase
        }
      : {rowIndex: result.index, batchIndex: -1, batchRowIndex: -1};
    return result;
  }

  override finalizeState(context: LayerContext): void {
    (this.state as StorageTextLayerState | undefined)?.renderer?.destroy();
    this.setState({renderer: null, boundTextData: null, boundModelProps: undefined});
    super.finalizeState(context);
  }
}

function normalizeTextData(data: GPUTextData | readonly GPUTextData[]): readonly GPUTextData[] {
  return 'strategy' in data ? [data] : data;
}
