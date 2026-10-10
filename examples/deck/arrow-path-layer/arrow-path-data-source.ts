// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {SettingsSchema} from '@deck.gl-community/panels';
import type {ArrowPathLayerProps} from '@deck.gl-community/arrow-layers';
import type {Device} from '@luma.gl/core';
import * as arrow from 'apache-arrow';
import {
  createStreamingPathRecordBatchIterator,
  makeArrowLineRecordBatches,
  makeArrowLineSourceData,
  MEASURE_SWEEP_DURATION,
  PATH_DATASETS,
  STREAMING_PATH_BATCH_COUNT,
  STREAMING_PATH_ROWS_PER_CHUNK,
  TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT,
  TEMPORAL_TRAIL_LENGTH_MILLISECONDS,
  type ArrowLineColorKind,
  type ArrowLineCoordinateKind,
  type ArrowLineRowCountKind,
  type ArrowLineTimeKind
} from '../../arrow/arrow-lines/arrow-line-data';
import {DeckArrowSourcePanel} from '../arrow-example-source-panel';

type PathWidthKind = 'constant' | 'row-widths';

type ArrowPathDataSourceState = Record<string, unknown> & {
  rowCountKind: ArrowLineRowCountKind;
  coordinateKind: Exclude<ArrowLineCoordinateKind, 'dense-union'>;
  colorKind: ArrowLineColorKind;
  widthKind: PathWidthKind;
  timeKind: ArrowLineTimeKind;
  animate: boolean;
  modelKind: 'attribute' | 'storage';
};

export type ArrowPathDataSourceUpdate = {
  asyncIterator: AsyncIterable<arrow.RecordBatch>;
  model: ArrowPathLayerProps['model'];
  colorColumn: boolean;
  widthColumn: boolean;
  currentTime: number;
  trailLength: number;
  temporalEnabled: boolean;
  animate: boolean;
  layerProps: Pick<ArrowPathLayerProps, 'onDataBatch'>;
};

export type ArrowPathDataSourceProps = {
  onDataUpdated: (update: ArrowPathDataSourceUpdate) => void;
};

/** Owns data selection and the shared Arrow panels for the deck path example. */
export class ArrowPathDataSource {
  private state: ArrowPathDataSourceState = {
    rowCountKind: '240-stream',
    coordinateKind: 'float32',
    colorKind: 'row-colors',
    widthKind: 'row-widths',
    timeKind: 'none',
    animate: true,
    modelKind: 'storage'
  };
  private panel: DeckArrowSourcePanel<ArrowPathDataSourceState> | null = null;
  private readonly onDataUpdated: ArrowPathDataSourceProps['onDataUpdated'];
  private isFinalized = false;

  constructor({onDataUpdated}: ArrowPathDataSourceProps) {
    this.onDataUpdated = onDataUpdated;
  }

  initialize(device: Device): void {
    const supportsStorage = device.type === 'webgpu';
    if (!supportsStorage) this.state.modelKind = 'attribute';
    this.panel = new DeckArrowSourcePanel({
      id: 'deck-arrow-paths',
      description:
        'Variable-length Arrow paths stream progressively from an async iterable of RecordBatch values while preserving source batch boundaries.',
      schema: makeArrowPathDataSourceSchema(supportsStorage),
      initialState: this.state,
      onSettingsChange: state => {
        this.state = state;
        this.emitDataSource();
      }
    });
    this.panel.initialize();
    this.emitDataSource();
  }

  finalize(): void {
    if (this.isFinalized) return;
    this.isFinalized = true;
    this.panel?.finalize();
  }

  private emitDataSource(): void {
    const panel = this.panel;
    if (!panel) return;
    const datasetKind = this.state.rowCountKind === '240-stream' ? '240' : '2400';
    const sourceData = makeArrowLineSourceData(
      PATH_DATASETS[datasetKind],
      'lines',
      this.state.coordinateKind,
      this.state.colorKind,
      this.state.timeKind,
      STREAMING_PATH_ROWS_PER_CHUNK
    );
    const recordBatches = makeArrowLineRecordBatches(sourceData).slice(
      0,
      STREAMING_PATH_BATCH_COUNT
    );
    const tableStream = panel.beginTableStream(recordBatches);
    this.onDataUpdated({
      asyncIterator: createStreamingPathRecordBatchIterator(recordBatches),
      model: this.state.modelKind,
      currentTime: MEASURE_SWEEP_DURATION,
      trailLength: TEMPORAL_TRAIL_LENGTH_MILLISECONDS / TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT,
      temporalEnabled: this.state.timeKind === 'xyzm',
      animate: this.state.animate,
      colorColumn: this.state.colorKind !== 'none',
      widthColumn: this.state.widthKind !== 'constant',
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

function makeArrowPathDataSourceSchema(supportsStorage: boolean): SettingsSchema {
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
              {label: PATH_DATASETS['240'].label, value: '240-stream'},
              {label: PATH_DATASETS['2400'].label, value: '2400-stream'}
            ]
          },
          {
            name: 'coordinateKind',
            label: 'Coordinates',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Float32 XY(ZM)', value: 'float32'},
              {label: 'Float64 XY(ZM)', value: 'float64'}
            ]
          },
          {
            name: 'colorKind',
            label: 'Colors',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'none'},
              {label: 'Row colors', value: 'row-colors'},
              {label: 'Vertex colors', value: 'vertex-colors'}
            ]
          },
          {
            name: 'widthKind',
            label: 'Widths',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'constant'},
              {label: 'Row widths', value: 'row-widths'}
            ]
          },
          {
            name: 'timeKind',
            label: 'Time',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'None', value: 'none'},
              {label: 'XYZM coordinate', value: 'xyzm'}
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
              ...(supportsStorage ? [{label: 'Storage (WebGPU)', value: 'storage'}] : []),
              {label: 'Attribute', value: 'attribute'}
            ]
          }
        ]
      }
    ]
  };
}
