// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {SettingsSchema} from '@deck.gl-community/panels';
import type {ArrowTextLayerProps} from '@deck.gl-community/arrow-layers';
import type {Device} from '@luma.gl/core';
import * as arrow from 'apache-arrow';
import {
  createStreamingRecordBatchIterator,
  LABEL_COLUMN_COUNT,
  LABEL_ROW_SPACING,
  makeStreamingArrowTextSourceAsync,
  STREAMING_TEXT_BATCH_COUNT,
  TEXT_DATASETS,
  type TextColorKind,
  type TextRowCountKind,
  type TextSourceKind
} from '../../arrow/arrow-text-2d/arrow-text-data';
import {DeckArrowSourcePanel} from '../arrow-example-source-panel';

type TextColumnKind = 'constant' | 'column';
type TextClipKind = 'none' | 'column';

type ArrowTextDataSourceState = Record<string, unknown> & {
  rowCountKind: TextRowCountKind;
  sourceKind: TextSourceKind;
  colorKind: TextColorKind;
  sizeKind: TextColumnKind;
  angleKind: TextColumnKind;
  clipKind: TextClipKind;
  animate: boolean;
  modelKind: 'attribute' | 'storage';
};

export type ArrowTextDataSourceUpdate = {
  asyncIterator: AsyncIterable<arrow.RecordBatch>;
  model: ArrowTextLayerProps['model'];
  clipRects: ArrowTextLayerProps['clipRects'];
  colorColumn: boolean;
  angles: ArrowTextLayerProps['angles'];
  sizes: ArrowTextLayerProps['sizes'];
  animate: boolean;
  labelFieldHeight: number;
  layerProps: Pick<ArrowTextLayerProps, 'onDataBatch'>;
};

export type ArrowTextDataSourceProps = {
  onDataUpdated: (update: ArrowTextDataSourceUpdate) => void;
};

/** Owns data selection and the shared Arrow panels for the deck text example. */
export class ArrowTextDataSource {
  private state: ArrowTextDataSourceState = {
    rowCountKind: '10k',
    sourceKind: 'utf8',
    colorKind: 'constant',
    sizeKind: 'constant',
    angleKind: 'constant',
    clipKind: 'column',
    animate: true,
    modelKind: 'storage'
  };
  private panel: DeckArrowSourcePanel<ArrowTextDataSourceState> | null = null;
  private supportsStorage = false;
  private readonly onDataUpdated: ArrowTextDataSourceProps['onDataUpdated'];
  private sourceVersion = 0;
  private isFinalized = false;

  constructor({onDataUpdated}: ArrowTextDataSourceProps) {
    this.onDataUpdated = onDataUpdated;
  }

  initialize(device: Device): void {
    const supportsStorage = device.type === 'webgpu';
    this.supportsStorage = supportsStorage;
    if (!supportsStorage) this.state.modelKind = 'attribute';
    this.panel = new DeckArrowSourcePanel({
      id: 'deck-arrow-text',
      description:
        'Arrow UTF-8 or dictionary strings and style columns stream progressively from an async iterable of RecordBatch values.',
      schema: makeArrowTextDataSourceSchema(supportsStorage, this.state.colorKind),
      initialState: this.state,
      onSettingsChange: state => {
        if (state.colorKind === 'character-colors' && state.modelKind === 'storage') {
          state = {...state, modelKind: 'attribute'};
        }
        this.state = state;
        this.panel?.setSettings(
          makeArrowTextDataSourceSchema(this.supportsStorage, state.colorKind),
          state
        );
        void this.emitDataSource();
      }
    });
    this.panel.initialize();
    void this.emitDataSource();
  }

  finalize(): void {
    if (this.isFinalized) return;
    this.isFinalized = true;
    this.sourceVersion++;
    this.panel?.finalize();
  }

  private async emitDataSource(): Promise<void> {
    const panel = this.panel;
    if (!panel) return;
    const sourceVersion = ++this.sourceVersion;
    const datasetKey = `${this.state.rowCountKind}${
      this.state.sourceKind === 'dictionary' ? '-dict' : ''
    }` as keyof typeof TEXT_DATASETS;
    const dataset = TEXT_DATASETS[datasetKey];
    const styleColumns = {
      clipRects: this.state.clipKind === 'column',
      angles: this.state.angleKind === 'column',
      sizes: this.state.sizeKind === 'column'
    };
    const recordBatches = (
      await makeStreamingArrowTextSourceAsync(dataset, this.state.colorKind, styleColumns)
    ).recordBatches;
    if (this.isFinalized || sourceVersion !== this.sourceVersion) {
      return;
    }

    const tableStream = panel.beginTableStream(recordBatches);
    this.onDataUpdated({
      asyncIterator: createStreamingRecordBatchIterator(recordBatches),
      model: this.state.modelKind,
      colorColumn: this.state.colorKind !== 'constant',
      sizes: this.state.sizeKind === 'constant' ? null : undefined,
      angles: this.state.angleKind === 'constant' ? null : undefined,
      clipRects: this.state.clipKind === 'none' ? null : undefined,
      animate: this.state.animate,
      labelFieldHeight: (dataset.labelCount / LABEL_COLUMN_COUNT) * LABEL_ROW_SPACING,
      layerProps: {
        onDataBatch: update => {
          if (!this.isFinalized) {
            tableStream.setLoadedBatchCount(update.loadedBatchCount);
          }
        }
      }
    });
  }
}

function makeArrowTextDataSourceSchema(
  supportsStorage: boolean,
  colorKind: TextColorKind
): SettingsSchema {
  return {
    title: 'Settings',
    sections: [
      {
        id: 'data',
        name: 'Data',
        initiallyCollapsed: false,
        settings: [
          {
            name: 'rowCountKind',
            label: 'Rows',
            type: 'select',
            persist: 'none',
            options: [
              {label: '10K texts', value: '10k'},
              {label: '100K texts', value: '100k'},
              {label: '1M texts', value: '1m'}
            ]
          },
          {
            name: 'sourceKind',
            label: 'Text',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Utf8 strings', value: 'utf8'},
              {label: 'Dictionary<Utf8>', value: 'dictionary'}
            ]
          },
          {
            name: 'colorKind',
            label: 'Colors',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'constant'},
              {label: 'Row colors', value: 'string-colors'},
              {label: 'Character colors', value: 'character-colors'}
            ]
          },
          {
            name: 'sizeKind',
            label: 'Sizes',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'constant'},
              {label: 'Row size column', value: 'column'}
            ]
          },
          {
            name: 'angleKind',
            label: 'Angles',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'constant'},
              {label: 'Row angle column', value: 'column'}
            ]
          },
          {
            name: 'clipKind',
            label: 'Clip rects',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'None', value: 'none'},
              {label: 'Row clip column', value: 'column'}
            ]
          },
          {
            name: 'animate',
            label: 'Animate',
            type: 'boolean',
            persist: 'none'
          }
        ]
      },
      {
        id: 'renderer',
        name: 'Renderer',
        initiallyCollapsed: false,
        settings: [
          {
            name: 'modelKind',
            label: 'Model',
            type: 'select',
            persist: 'none',
            options: [
              ...(supportsStorage && colorKind !== 'character-colors'
                ? [{label: 'Storage (WebGPU)', value: 'storage'}]
                : []),
              {label: 'Attribute', value: 'attribute'}
            ]
          }
        ]
      }
    ]
  };
}

export const DECK_TEXT_STREAMING_BATCH_COUNT = STREAMING_TEXT_BATCH_COUNT;
