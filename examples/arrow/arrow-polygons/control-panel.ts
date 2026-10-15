// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {
  type Panel,
  type SettingsChangeDescriptor,
  type SettingsSchema
} from '@deck.gl-community/panels';
import {
  ExampleSettingsPanelManager,
  getChangedSetting,
  makeHtmlCustomPanel
} from '../../example-panels';
import {
  POLYGON_DATASETS,
  type ArrowPolygonColorKind,
  type ArrowPolygonRowCountKind,
  type ArrowPolygonSourceKind
} from './arrow-polygon-data';
import {type ArrowPolygonRendererMetrics, type ArrowPolygonRendererModel} from '@luma.gl/arrow';
import {supportsVertexStorageBuffers} from '../utils/device-limits';
import {
  ARROW_EXAMPLE_INPUT_MODE_OPTIONS,
  isArrowExampleInputMode,
  type ArrowExampleInputMode
} from '../arrow-example-input';

const PICKED_ROW_ID = 'arrow-polygon-picked-row';
const ROW_COUNT_ID = 'arrow-polygon-row-count';
const POLYGON_COUNT_ID = 'arrow-polygon-polygon-count';
const DIMENSION_ID = 'arrow-polygon-dimension';
const TOTAL_ARROW_BYTES_ID = 'arrow-polygon-total-arrow-bytes';
const TOTAL_GPU_BYTES_ID = 'arrow-polygon-total-gpu-bytes';
const TOTAL_GPU_EXPANSION_ID = 'arrow-polygon-total-gpu-expansion';
const TOTAL_BUILD_TIME_ID = 'arrow-polygon-total-build-time';
const POLYGON_ARROW_BYTES_ID = 'arrow-polygon-polygon-arrow-bytes';
const GENERATED_GEOMETRY_GPU_BYTES_ID = 'arrow-polygon-generated-geometry-gpu-bytes';
const POLYGON_GPU_EXPANSION_ID = 'arrow-polygon-gpu-expansion';
const POLYGON_BUILD_TIME_ID = 'arrow-polygon-build-time';
const STYLING_ARROW_BYTES_ID = 'arrow-polygon-styling-arrow-bytes';
const STYLING_GPU_BYTES_ID = 'arrow-polygon-styling-gpu-bytes';
const STYLING_GPU_EXPANSION_ID = 'arrow-polygon-styling-gpu-expansion';
const STREAMING_BATCH_STATUS_ROW_ID = 'arrow-polygon-streaming-batch-status-row';
const STREAMING_BATCH_FILL_ID = 'arrow-polygon-streaming-batch-fill';
const STREAMING_BATCH_STATUS_LABEL_ID = 'arrow-polygon-streaming-batch-status-label';
const POLYGON_VERTEX_STORAGE_BUFFER_COUNT = 3;

export type ArrowPolygonControlPanelState = {
  inputMode: ArrowExampleInputMode;
  rowCountKind: ArrowPolygonRowCountKind;
  sourceKind: ArrowPolygonSourceKind;
  colorKind: ArrowPolygonColorKind;
  modelKind: ArrowPolygonRendererModel;
};

export type ArrowPolygonControlPanelProps = {
  device: Device;
  initialState: ArrowPolygonControlPanelState;
  handlers: {
    onInputModeChange: (inputMode: ArrowExampleInputMode) => void;
    onRowCountKindChange: (rowCountKind: ArrowPolygonRowCountKind) => void | Promise<void>;
    onSourceKindChange: (sourceKind: ArrowPolygonSourceKind) => void;
    onColorKindChange: (colorKind: ArrowPolygonColorKind) => void;
    onModelKindChange: (modelKind: ArrowPolygonRendererModel) => void;
  };
  supportedModelKinds?: readonly ArrowPolygonRendererModel[];
  showInputModeControl?: boolean;
  onRefresh: () => void;
};

export class ArrowPolygonControlPanel {
  private readonly device: Device;
  private readonly handlers: ArrowPolygonControlPanelProps['handlers'];
  private readonly onRefresh: () => void;
  private readonly supportedModelKinds: readonly ArrowPolygonRendererModel[];
  private readonly showInputModeControl: boolean;
  private readonly settingsPanel: ExampleSettingsPanelManager;
  private state: ArrowPolygonControlPanelState;
  private metrics: ArrowPolygonRendererMetrics | null = null;
  private pickedLabel = 'Hover polygon';
  private loadedBatchCount: number | null = null;
  private batchCount = 0;
  private rootElement: HTMLElement | null = null;

  constructor({
    device,
    initialState,
    handlers,
    supportedModelKinds = ['attribute', 'storage'],
    showInputModeControl = true,
    onRefresh
  }: ArrowPolygonControlPanelProps) {
    this.device = device;
    this.state = initialState;
    this.handlers = handlers;
    this.supportedModelKinds = supportedModelKinds;
    this.showInputModeControl = showInputModeControl;
    this.onRefresh = onRefresh;
    this.settingsPanel = new ExampleSettingsPanelManager({
      id: 'arrow-polygons-settings',
      schema: makeArrowPolygonSettingsSchema(
        device,
        initialState,
        supportedModelKinds,
        showInputModeControl
      ),
      settings: initialState,
      onSettingsChange: this.handleSettingsChange
    });
  }

  makeDescriptionPanel(): Panel {
    return makeHtmlCustomPanel({
      id: 'arrow-polygons-description',
      title: 'Description',
      html: makeArrowPolygonControlPanelHtml(),
      onRender: rootElement => {
        this.rootElement = rootElement;
        this.render();
        return () => {
          if (this.rootElement === rootElement) {
            this.rootElement = null;
          }
        };
      }
    });
  }

  makeSettingsPanel(): Panel {
    return this.settingsPanel.makePanel();
  }

  initialize(): void {}

  destroy(): void {
    this.settingsPanel.finalize();
    this.rootElement = null;
  }

  syncControls(state: Partial<ArrowPolygonControlPanelState>): void {
    this.state = {...this.state, ...state};
    this.settingsPanel.setSchemaAndSettings(
      makeArrowPolygonSettingsSchema(
        this.device,
        this.state,
        this.supportedModelKinds,
        this.showInputModeControl
      ),
      this.state
    );
    this.onRefresh();
  }

  setMetrics(metrics: ArrowPolygonRendererMetrics): void {
    this.metrics = metrics;
    this.renderMetrics();
  }

  setPickedLabel(label: string): void {
    this.pickedLabel = label;
    setLabel(this.rootElement, PICKED_ROW_ID, label);
  }

  setStreamingBatchStatus(loadedBatchCount: number, batchCount: number): void {
    this.loadedBatchCount = loadedBatchCount;
    this.batchCount = batchCount;
    renderStreamingBatchStatus(this.rootElement, loadedBatchCount, batchCount);
  }

  private readonly handleSettingsChange = (
    settings: Record<string, unknown>,
    changedSettings?: SettingsChangeDescriptor[]
  ): void => {
    this.state = settings as ArrowPolygonControlPanelState;
    const inputMode = getChangedSetting(changedSettings, 'inputMode')?.nextValue;
    if (isArrowExampleInputMode(inputMode)) {
      this.handlers.onInputModeChange(inputMode);
    }
    const rowCountKind = getChangedSetting(changedSettings, 'rowCountKind')?.nextValue;
    if (isRowCountKind(rowCountKind)) {
      void this.handlers.onRowCountKindChange(rowCountKind);
    }
    const sourceKind = getChangedSetting(changedSettings, 'sourceKind')?.nextValue;
    if (isSourceKind(sourceKind)) {
      this.handlers.onSourceKindChange(sourceKind);
    }
    const colorKind = getChangedSetting(changedSettings, 'colorKind')?.nextValue;
    if (isColorKind(colorKind)) {
      this.handlers.onColorKindChange(colorKind);
    }
    const modelKind = getChangedSetting(changedSettings, 'modelKind')?.nextValue;
    if (isArrowPolygonRendererModel(modelKind)) {
      this.handlers.onModelKindChange(modelKind);
    }
  };

  private render(): void {
    setLabel(this.rootElement, PICKED_ROW_ID, this.pickedLabel);
    if (this.loadedBatchCount !== null) {
      renderStreamingBatchStatus(this.rootElement, this.loadedBatchCount, this.batchCount);
    }
    this.renderMetrics();
  }

  private renderMetrics(): void {
    if (!this.metrics) {
      return;
    }
    const totalArrowByteLength =
      this.metrics.polygonArrowByteLength + this.metrics.stylingArrowByteLength;
    const totalGpuByteLength =
      this.metrics.generatedGeometryGpuByteLength + this.metrics.stylingGpuByteLength;
    setLabel(this.rootElement, ROW_COUNT_ID, formatInteger(this.metrics.rowCount));
    setLabel(this.rootElement, POLYGON_COUNT_ID, formatInteger(this.metrics.polygonCount));
    setLabel(this.rootElement, DIMENSION_ID, `${this.metrics.sourceDimension}D`);
    setLabel(this.rootElement, TOTAL_ARROW_BYTES_ID, formatByteLength(totalArrowByteLength));
    setLabel(this.rootElement, TOTAL_GPU_BYTES_ID, formatByteLength(totalGpuByteLength));
    setLabel(
      this.rootElement,
      TOTAL_GPU_EXPANSION_ID,
      formatExpansionRatio(totalGpuByteLength, totalArrowByteLength)
    );
    setLabel(this.rootElement, TOTAL_BUILD_TIME_ID, formatTimeMs(this.metrics.tessellationTimeMs));
    setLabel(
      this.rootElement,
      POLYGON_ARROW_BYTES_ID,
      formatByteLength(this.metrics.polygonArrowByteLength)
    );
    setLabel(
      this.rootElement,
      GENERATED_GEOMETRY_GPU_BYTES_ID,
      formatByteLength(this.metrics.generatedGeometryGpuByteLength)
    );
    setLabel(
      this.rootElement,
      POLYGON_GPU_EXPANSION_ID,
      formatExpansionRatio(
        this.metrics.generatedGeometryGpuByteLength,
        this.metrics.polygonArrowByteLength
      )
    );
    setLabel(
      this.rootElement,
      POLYGON_BUILD_TIME_ID,
      formatTimeMs(this.metrics.tessellationTimeMs)
    );
    setLabel(
      this.rootElement,
      STYLING_ARROW_BYTES_ID,
      formatByteLength(this.metrics.stylingArrowByteLength)
    );
    setLabel(
      this.rootElement,
      STYLING_GPU_BYTES_ID,
      formatByteLength(this.metrics.stylingGpuByteLength)
    );
    setLabel(
      this.rootElement,
      STYLING_GPU_EXPANSION_ID,
      formatExpansionRatio(this.metrics.stylingGpuByteLength, this.metrics.stylingArrowByteLength)
    );
  }
}

export function makeArrowPolygonSettingsSchema(
  device: Device,
  state: ArrowPolygonControlPanelState,
  supportedModelKinds: readonly ArrowPolygonRendererModel[] = ['attribute', 'storage'],
  showInputModeControl = true
): SettingsSchema {
  const supportsStorage = supportsVertexStorageBuffers(device, POLYGON_VERTEX_STORAGE_BUFFER_COUNT);
  return {
    title: 'Settings',
    sections: [
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
              ...(supportedModelKinds.includes('attribute')
                ? [{label: 'Attribute', value: 'attribute'}]
                : []),
              ...(supportsStorage && supportedModelKinds.includes('storage')
                ? [{label: 'Storage', value: 'storage'}]
                : [])
            ]
          }
        ]
      },
      {
        id: 'data',
        name: 'Data',
        initiallyCollapsed: false,
        settings: [
          ...(showInputModeControl
            ? [
                {
                  name: 'inputMode',
                  label: 'Input',
                  type: 'select' as const,
                  persist: 'none' as const,
                  options: [...ARROW_EXAMPLE_INPUT_MODE_OPTIONS]
                }
              ]
            : []),
          {
            name: 'rowCountKind',
            label: 'Rows',
            type: 'select',
            persist: 'none',
            options: [
              {label: POLYGON_DATASETS['10k-stream'].label, value: '10k-stream'},
              {label: POLYGON_DATASETS['100k-stream'].label, value: '100k-stream'}
            ]
          },
          {
            name: 'sourceKind',
            label: 'Polygons',
            type: 'select',
            persist: 'none',
            options: [
              {
                label: 'Polygon - List<List<FixedSizeList<Float32, 2>>>',
                value: 'polygon'
              },
              {
                label: 'MultiPolygon - List<List<List<FixedSizeList<Float32, 2>>>>',
                value: 'multipolygon'
              },
              {label: 'Tessellated - List<FixedSizeList<Float32, 2>>', value: 'tessellated'},
              {label: 'DenseUnion - geoarrow.geometry Polygon/MultiPolygon', value: 'dense-union'}
            ]
          },
          {
            name: 'colorKind',
            label: 'Colors',
            type: 'select',
            persist: 'none',
            options: [
              {label: 'Constant', value: 'constant'},
              {label: 'Row - FixedSizeList<Uint8, 4>', value: 'row-colors'},
              ...(state.sourceKind === 'dense-union'
                ? []
                : [{label: 'Vertex - nested FixedSizeList<Uint8, 4>', value: 'vertex-colors'}])
            ]
          }
        ]
      }
    ]
  };
}

export function makeArrowPolygonControlPanelHtml(): string {
  return `\
  <p>Earcuts Arrow polygon rows with holes, multipolygons, geoarrow.geometry DenseUnion batches, or pre-tessellated triangle rows.</p>
  ${makeStatusRow('Batches', makeProgressBar())}
  ${makeStatusRow('Hover', `<strong id="${PICKED_ROW_ID}">Hover polygon</strong>`)}
  <table style="width: 100%; margin-top: 12px; border-collapse: collapse; font-size: 12px;">
    <tbody>
      ${makeMetricTableRow('total', TOTAL_ARROW_BYTES_ID, TOTAL_GPU_BYTES_ID, TOTAL_GPU_EXPANSION_ID, TOTAL_BUILD_TIME_ID)}
      ${makeMetricTableRow('polygons', POLYGON_ARROW_BYTES_ID, GENERATED_GEOMETRY_GPU_BYTES_ID, POLYGON_GPU_EXPANSION_ID, POLYGON_BUILD_TIME_ID)}
      ${makeMetricTableRow('styles', STYLING_ARROW_BYTES_ID, STYLING_GPU_BYTES_ID, STYLING_GPU_EXPANSION_ID, null)}
    </tbody>
  </table>
  <p style="margin-bottom: 0; color: #64748b; font-size: 12px;">Rows <strong id="${ROW_COUNT_ID}">0</strong> · primitive polygons <strong id="${POLYGON_COUNT_ID}">0</strong> · source dimension <strong id="${DIMENSION_ID}">0D</strong></p>
  `;
}

function makeProgressBar(): string {
  return `<div id="${STREAMING_BATCH_STATUS_ROW_ID}" role="progressbar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0" style="display: none; position: relative; height: 24px; overflow: hidden; border: 1px solid #bfdbfe; border-radius: 6px; background: #dbeafe;"><span id="${STREAMING_BATCH_FILL_ID}" aria-hidden="true" style="position: absolute; inset: 0 auto 0 0; width: 0%; background: #2563eb;"></span><span id="${STREAMING_BATCH_STATUS_LABEL_ID}" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700;">Loaded 0 batches</span></div>`;
}

function makeStatusRow(label: string, valueHtml: string): string {
  return `<div style="display: grid; grid-template-columns: 62px 1fr; gap: 8px; align-items: center; margin-top: 8px;"><span>${label}</span>${valueHtml}</div>`;
}

function makeMetricTableRow(
  label: string,
  arrowId: string,
  gpuId: string,
  expansionId: string,
  timeId: string | null
): string {
  return `<tr><th style="text-align: left; padding: 4px 6px 4px 0;">${label}</th><td style="text-align: right;"><strong id="${arrowId}">Measuring...</strong></td><td style="text-align: right;"><strong id="${gpuId}">Measuring...</strong></td><td style="text-align: right;"><strong id="${expansionId}">-</strong></td><td style="text-align: right;">${timeId ? `<strong id="${timeId}">Measuring...</strong>` : '-'}</td></tr>`;
}

function renderStreamingBatchStatus(
  rootElement: HTMLElement | null,
  loadedBatchCount: number,
  batchCount: number
): void {
  const statusRow = getElement(rootElement, STREAMING_BATCH_STATUS_ROW_ID);
  const fill = getElement(rootElement, STREAMING_BATCH_FILL_ID);
  const label = getElement(rootElement, STREAMING_BATCH_STATUS_LABEL_ID);
  if (!statusRow || !fill || !label) {
    return;
  }
  statusRow.style.display = 'block';
  statusRow.setAttribute('aria-valuemax', `${batchCount}`);
  statusRow.setAttribute('aria-valuenow', `${loadedBatchCount}`);
  fill.style.width = `${batchCount > 0 ? (loadedBatchCount / batchCount) * 100 : 0}%`;
  label.textContent = `Loaded ${loadedBatchCount} of ${batchCount} batches`;
}

function setLabel(rootElement: HTMLElement | null, id: string, value: string): void {
  const element = getElement(rootElement, id);
  if (element) {
    element.textContent = value;
  }
}

function getElement(rootElement: HTMLElement | null, id: string): HTMLElement | null {
  return rootElement?.querySelector<HTMLElement>(`#${id}`) ?? null;
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatByteLength(byteLength: number): string {
  if (byteLength < 1000) {
    return `${formatInteger(byteLength)} B`;
  }
  if (byteLength < 1000 ** 2) {
    return `${formatMetricDigits(byteLength / 1000)} kB`;
  }
  if (byteLength < 1000 ** 3) {
    return `${formatMetricDigits(byteLength / 1000 ** 2)} MB`;
  }
  return `${formatMetricDigits(byteLength / 1000 ** 3)} GB`;
}

function formatExpansionRatio(byteLength: number, arrowByteLength: number): string {
  const expansionFactor =
    Number.isFinite(arrowByteLength) && arrowByteLength > 0 ? byteLength / arrowByteLength : null;
  if (expansionFactor === null || !Number.isFinite(expansionFactor)) {
    return '-';
  }
  const precision = expansionFactor < 10 ? 1 : 0;
  return `${expansionFactor.toFixed(precision).replace(/\.0$/, '')}x`;
}

function formatTimeMs(timeMs: number): string {
  return timeMs > 0 ? `${timeMs.toFixed(1)}ms` : '-';
}

function formatMetricDigits(value: number): string {
  return new Intl.NumberFormat('en-US', {maximumSignificantDigits: 2}).format(value);
}

function isSourceKind(value: unknown): value is ArrowPolygonSourceKind {
  return (
    value === 'polygon' ||
    value === 'multipolygon' ||
    value === 'tessellated' ||
    value === 'dense-union'
  );
}

function isRowCountKind(value: unknown): value is ArrowPolygonRowCountKind {
  return value === '10k-stream' || value === '100k-stream';
}

function isColorKind(value: unknown): value is ArrowPolygonColorKind {
  return value === 'constant' || value === 'row-colors' || value === 'vertex-colors';
}

function isArrowPolygonRendererModel(value: unknown): value is ArrowPolygonRendererModel {
  return value === 'attribute' || value === 'storage';
}
