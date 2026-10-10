// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {
  type ArrowPolygonRendererDataBatchUpdate,
  type ArrowPolygonRendererModel,
  type ArrowPolygonRendererProps
} from '@luma.gl/arrow';
import {
  createStreamingPolygonRecordBatchIterator,
  type ArrowPolygonColorKind,
  type ArrowPolygonRowCountKind,
  type ArrowPolygonSourceKind,
  type ArrowPolygonViewState,
  makeArrowPolygonExampleData
} from './arrow-polygon-data';
import {ArrowPolygonControlPanel} from './control-panel';
import {ArrowExamplePanelManager} from '../arrow-example-panels';
import type {ArrowExampleInputMode} from '../arrow-example-input';
import * as arrow from 'apache-arrow';

export type ArrowPolygonDataSourceUpdate = Pick<
  ArrowPolygonRendererProps,
  'data' | 'tessellated' | 'polygons' | 'colors' | 'model' | 'center' | 'scale'
> & {
  viewState: ArrowPolygonViewState;
  layerProps: Pick<ArrowPolygonRendererProps, 'onDataBatch'>;
};

export type ArrowPolygonDataSourceProps = {
  onDataUpdated: (update: ArrowPolygonDataSourceUpdate) => void;
  onRendererPropsUpdated: (props: Pick<ArrowPolygonRendererProps, 'model'>) => void;
  preferStorage?: boolean;
  inputMode?: ArrowExampleInputMode;
  showInputModeControl?: boolean;
};

/** Owns polygon data generation, controls, and Arrow table inspection. */
export class ArrowPolygonDataSource {
  panels!: ArrowExamplePanelManager;
  controlPanel!: ArrowPolygonControlPanel;
  inputMode: ArrowExampleInputMode = 'stream';
  rowCountKind: ArrowPolygonRowCountKind = '10k-stream';
  sourceKind: ArrowPolygonSourceKind = 'polygon';
  colorKind: ArrowPolygonColorKind = 'row-colors';
  modelKind: ArrowPolygonRendererModel = 'attribute';
  private isFinalized = false;
  private readonly preferStorage: boolean;
  private readonly showInputModeControl: boolean;
  private readonly onDataUpdated: ArrowPolygonDataSourceProps['onDataUpdated'];
  private readonly onRendererPropsUpdated: ArrowPolygonDataSourceProps['onRendererPropsUpdated'];

  constructor({
    onDataUpdated,
    onRendererPropsUpdated,
    preferStorage = false,
    inputMode = 'stream',
    showInputModeControl = true
  }: ArrowPolygonDataSourceProps) {
    this.onDataUpdated = onDataUpdated;
    this.onRendererPropsUpdated = onRendererPropsUpdated;
    this.preferStorage = preferStorage;
    this.inputMode = inputMode;
    this.showInputModeControl = showInputModeControl;
  }

  initialize(device: Device): void {
    const supportedModelKinds: readonly ArrowPolygonRendererModel[] =
      device.type === 'webgpu' ? ['storage', 'attribute'] : ['attribute'];
    if (this.preferStorage && supportedModelKinds.includes('storage')) {
      this.modelKind = 'storage';
    }
    this.panels = new ArrowExamplePanelManager({
      descriptionPanel: () => this.controlPanel.makeDescriptionPanel(),
      settingsPanel: () => this.controlPanel.makeSettingsPanel()
    });
    this.controlPanel = new ArrowPolygonControlPanel({
      device,
      initialState: this.getControlState(),
      handlers: {
        onInputModeChange: inputMode =>
          this.setPolygonInput(inputMode, this.rowCountKind, this.sourceKind, this.colorKind),
        onRowCountKindChange: rowCountKind =>
          this.setPolygonInput(this.inputMode, rowCountKind, this.sourceKind, this.colorKind),
        onSourceKindChange: sourceKind =>
          this.setPolygonInput(this.inputMode, this.rowCountKind, sourceKind, this.colorKind),
        onColorKindChange: colorKind =>
          this.setPolygonInput(this.inputMode, this.rowCountKind, this.sourceKind, colorKind),
        onModelKindChange: this.handleModelKindChange
      },
      supportedModelKinds,
      showInputModeControl: this.showInputModeControl,
      onRefresh: () => this.panels.refresh()
    });
    this.panels.mount();
    this.controlPanel.initialize();
    this.setPolygonInput(this.inputMode, this.rowCountKind, this.sourceKind, this.colorKind);
  }

  finalize(): void {
    if (this.isFinalized) return;
    this.isFinalized = true;
    this.controlPanel?.destroy();
    this.panels?.finalize();
  }

  setPickedRow(batchIndex: number | null, rowIndex: number | null): void {
    this.controlPanel.setPickedLabel(
      batchIndex === null || rowIndex === null
        ? 'Hover polygon'
        : `row ${rowIndex.toLocaleString()} / batch ${(batchIndex + 1).toLocaleString()}`
    );
  }

  private getControlState() {
    return {
      inputMode: this.inputMode,
      rowCountKind: this.rowCountKind,
      sourceKind: this.sourceKind,
      colorKind: this.colorKind,
      modelKind: this.modelKind
    };
  }

  private setPolygonInput(
    inputMode: ArrowExampleInputMode,
    rowCountKind: ArrowPolygonRowCountKind,
    sourceKind: ArrowPolygonSourceKind,
    colorKind: ArrowPolygonColorKind
  ): void {
    const effectiveColorKind =
      sourceKind === 'dense-union' && colorKind === 'vertex-colors' ? 'row-colors' : colorKind;
    this.inputMode = inputMode;
    this.rowCountKind = rowCountKind;
    this.sourceKind = sourceKind;
    this.colorKind = effectiveColorKind;
    const sourceData = makeArrowPolygonExampleData(rowCountKind, sourceKind, effectiveColorKind);
    this.controlPanel.syncControls({
      inputMode,
      rowCountKind,
      sourceKind,
      colorKind: effectiveColorKind
    });
    this.controlPanel.setPickedLabel('Hover polygon');
    this.controlPanel.setStreamingBatchStatus(0, sourceData.batchCount);
    const tableStream = this.panels.beginLoadedTableStream({
      id: 'polygons-source',
      label: 'Loaded polygon source',
      kind: 'source',
      recordBatches: sourceData.recordBatches
    });
    const sourceTable = new arrow.Table(sourceData.recordBatches);
    const polygonVector = sourceTable.getChild('polygons');
    if (!polygonVector) {
      throw new Error('Arrow polygon example requires a polygons column');
    }
    const colorVector = sourceTable.getChild('colors');
    const commonUpdate = {
      viewState: sourceData.viewState,
      tessellated: sourceData.tessellated,
      model: this.modelKind,
      center: sourceData.viewState.startCenter,
      scale: sourceData.viewState.scale,
      layerProps: {
        onDataBatch: ({loadedBatchCount, metrics}: ArrowPolygonRendererDataBatchUpdate) => {
          if (this.isFinalized) return;
          tableStream.setLoadedBatchCount(loadedBatchCount);
          this.controlPanel.setStreamingBatchStatus(loadedBatchCount, sourceData.batchCount);
          this.controlPanel.setMetrics(metrics);
        }
      }
    };
    if (inputMode === 'vectors') {
      this.onDataUpdated({
        ...commonUpdate,
        polygons: polygonVector,
        colors: effectiveColorKind === 'constant' ? null : (colorVector ?? undefined)
      });
      return;
    }
    this.onDataUpdated({
      ...commonUpdate,
      data:
        inputMode === 'stream'
          ? createStreamingPolygonRecordBatchIterator(sourceData.recordBatches)[
              Symbol.asyncIterator
            ]()
          : sourceTable,
      polygons: 'polygons',
      colors: effectiveColorKind === 'constant' ? null : 'colors'
    });
  }

  private readonly handleModelKindChange = (modelKind: ArrowPolygonRendererModel): void => {
    if (modelKind === this.modelKind) return;
    this.modelKind = modelKind;
    this.controlPanel.syncControls({modelKind});
    this.onRendererPropsUpdated({model: modelKind});
  };
}
