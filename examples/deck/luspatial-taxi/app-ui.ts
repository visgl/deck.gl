// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import {
  LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS,
  LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS,
  type LuSpatialGeographicPointQueryStats
} from '@deck.gl-community/gpu-layers/query';
import {GPUCommandGraphInspectorPanel} from '../../gpu-command-graph-inspector-panel';
import {
  getTaxiPoint,
  TAXI_CORPUS_POINT_COUNT,
  type LuSpatialTaxiData,
  type TaxiZonePreset
} from './taxi-data';

export function createStandaloneContainer(): HTMLDivElement {
  document.body.style.margin = '0';
  document.body.style.background = '#020609';
  const container = document.createElement('div');
  Object.assign(container.style, {position: 'fixed', inset: '0', overflow: 'hidden'});
  document.body.appendChild(container);
  return container;
}

export function getTooltip(data: LuSpatialTaxiData, info: PickingInfo): {html: string} | null {
  const point = getTaxiPoint(data, info.index);
  if (!point) return null;
  return {
    html: `<div style="font:12px/1.5 ui-monospace,monospace;min-width:190px">
      <div style="color:#64e9ff;font-weight:700">TRIP ROW ${point.sourceRowIndex.toLocaleString()}</div>
      <div>longitude&nbsp; ${point.longitude.toFixed(6)}</div>
      <div>latitude&nbsp;&nbsp; ${point.latitude.toFixed(6)}</div>
      <div style="margin-top:4px;color:#91a4b7">${data.sourceLabel}</div>
    </div>`
  };
}

export type ControlPanelCallbacks = {
  onRadiusChange: (radiusKilometres: number) => void;
  onZoneChange: (zone: TaxiZonePreset) => void;
};

export type TaxiControlPanel = {
  destroy: () => void;
  setBasemapStatus: (status: string) => void;
  setCoordinate: (coordinate: readonly [number, number], label: string) => void;
  setCustomZone: () => void;
  setLoadingProgress: (processedPointCount: number, totalPointCount: number) => void;
  updateSourceStatus: (status: {corpusPointCount?: number; message: string}) => void;
  updateStats: (stats: LuSpatialGeographicPointQueryStats) => void;
};

export type TaxiLoadingIndicator = {
  destroy: () => void;
  setBasemapStatus: (status: string) => void;
  setProgress: (processedPointCount: number, totalPointCount: number) => void;
  setStatus: (status: string) => void;
};

export function createLoadingIndicator(container: HTMLElement): TaxiLoadingIndicator {
  const root = document.createElement('section');
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.setAttribute('aria-label', 'Loading GPU taxi data');
  Object.assign(root.style, {
    position: 'absolute',
    inset: '0',
    zIndex: '8',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse at center, rgba(3, 12, 19, .82), rgba(2, 6, 9, .48))'
  });
  root.innerHTML = `<div style="width:min(340px,100%);padding:20px 22px;border:1px solid rgba(84,221,243,.25);border-radius:12px;background:rgba(4,11,17,.94);box-shadow:0 18px 54px rgba(0,0,0,.36);color:#e6f6ff;font:12px/1.55 Inter,system-ui,sans-serif">
    <div style="color:#63eaff;font:700 10px ui-monospace,monospace;letter-spacing:.12em">GPU PROJECT + LUSPATIAL</div>
    <div data-taxi-loading-status style="margin-top:9px;font-size:14px;font-weight:650">Preparing WebGPU taxi explorer…</div>
    <div data-taxi-loading-progress role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="height:5px;margin-top:13px;overflow:hidden;border-radius:999px;background:rgba(108,154,177,.22)">
      <div data-taxi-loading-bar style="width:0%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2fc9dd,#6aeeff);transition:width 120ms linear"></div>
    </div>
    <div data-taxi-loading-count style="margin-top:8px;color:#adc4d2;font:10px ui-monospace,monospace">Waiting for the GPU…</div>
    <div data-taxi-basemap-status style="margin-top:8px;color:#8296a5;font-size:10px">Basemap tiles stream separately and never block GPU data.</div>
  </div>`;
  container.appendChild(root);

  const statusElement = root.querySelector<HTMLElement>('[data-taxi-loading-status]')!;
  const progressElement = root.querySelector<HTMLElement>('[data-taxi-loading-progress]')!;
  const progressBar = root.querySelector<HTMLElement>('[data-taxi-loading-bar]')!;
  const countElement = root.querySelector<HTMLElement>('[data-taxi-loading-count]')!;
  const basemapStatusElement = root.querySelector<HTMLElement>('[data-taxi-basemap-status]')!;

  return {
    destroy: () => root.remove(),
    setBasemapStatus: status => {
      basemapStatusElement.textContent = status;
    },
    setProgress: (processedPointCount, totalPointCount) => {
      const percentage = Math.round((processedPointCount / Math.max(1, totalPointCount)) * 100);
      statusElement.textContent = 'Generating taxi rows without blocking the page…';
      progressElement.setAttribute('aria-valuenow', String(percentage));
      progressBar.style.width = `${percentage}%`;
      countElement.textContent = `${formatCount(processedPointCount)} / ${formatCount(totalPointCount)} points prepared`;
    },
    setStatus: status => {
      statusElement.textContent = status;
    }
  };
}

export function createControlPanel(
  container: HTMLElement,
  zones: readonly TaxiZonePreset[],
  initialZoneId: number,
  callbacks: ControlPanelCallbacks
): TaxiControlPanel {
  const root = document.createElement('section');
  root.setAttribute('aria-label', 'luSpatial taxi controls');
  Object.assign(root.style, {
    position: 'absolute',
    zIndex: '12',
    left: '16px',
    top: '88px',
    width: 'min(292px, calc(100% - 32px))',
    maxHeight: 'calc(100% - 104px)',
    overflowY: 'auto',
    boxSizing: 'border-box',
    border: '1px solid rgba(113, 226, 255, .22)',
    borderRadius: '10px',
    padding: '12px',
    color: '#e9f6ff',
    background: 'rgba(3, 8, 13, .91)',
    boxShadow: '0 14px 38px rgba(0,0,0,.38)',
    backdropFilter: 'blur(14px)',
    font: '11px/1.35 Inter, ui-sans-serif, system-ui, sans-serif',
    pointerEvents: 'auto'
  });
  root.innerHTML = `<style>
    [data-luspatial-card] input {
      width:100%;box-sizing:border-box;color:#e9f6ff;background:#08131c;
      border:1px solid rgba(126,183,211,.26);border-radius:6px;font:11px ui-monospace,monospace;
    }
    [data-zone-picker] {position:relative;margin-top:3px}
    [data-zone-trigger] {
      position:relative;width:100%;height:21px;padding:0 25px 0 10px;overflow:hidden;
      border:1px solid rgba(81,191,215,.28);border-radius:0;color:#ccebf3;
      clip-path:polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px);
      box-shadow:inset 2px 0 #2adcf5;background-color:rgba(5,16,23,.88);
      background-image:
        linear-gradient(45deg,transparent 46%,#56e7f8 48%,#56e7f8 61%,transparent 63%),
        linear-gradient(135deg,#56e7f8 37%,#56e7f8 50%,transparent 52%),
        linear-gradient(rgba(126,183,211,.18),rgba(126,183,211,.18));
      background-position:calc(100% - 10px) 7px,calc(100% - 7px) 7px,calc(100% - 19px) 50%;
      background-repeat:no-repeat;background-size:4px 4px,4px 4px,1px 11px;
      font:700 8px/1 ui-monospace,monospace;letter-spacing:.08em;text-align:left;text-transform:uppercase;
      cursor:pointer;
    }
    [data-zone-trigger-label] {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    [data-zone-trigger]:hover,[data-zone-trigger][aria-expanded="true"] {border-color:rgba(75,225,247,.58);color:#e8fbff;background-color:rgba(7,25,33,.96)}
    [data-zone-trigger]:focus-visible,[data-zone-option]:focus-visible {outline:1px solid #54e8fa;outline-offset:1px}
    [data-zone-list] {
      display:grid;gap:1px;max-height:184px;margin-top:2px;padding:2px;overflow:auto;
      border:1px solid rgba(71,207,230,.34);background:rgba(2,10,15,.98);
      clip-path:polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px);
      box-shadow:0 10px 24px rgba(0,0,0,.5);
    }
    [data-zone-list][hidden] {display:none}
    [data-zone-option] {
      display:grid;grid-template-columns:54px minmax(0,1fr);align-items:center;gap:5px;width:100%;height:22px;padding:0 7px;
      border:0;border-left:2px solid transparent;color:#9bb4c1;background:rgba(11,24,31,.54);
      font:700 8px/1 ui-monospace,monospace;letter-spacing:.055em;text-align:left;text-transform:uppercase;cursor:pointer;
    }
    [data-zone-option] span:first-child {color:#536d7c;font-size:7px;letter-spacing:.09em}
    [data-zone-option] span:last-child {overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    [data-zone-option]:hover,[data-zone-option]:focus-visible {border-left-color:#5ee9f8;color:#e1f9fd;background:rgba(30,91,104,.34)}
    [data-zone-option][aria-selected="true"] {border-left-color:#2adcf5;color:#6cecff;background:linear-gradient(90deg,rgba(25,187,211,.2),rgba(8,35,43,.56) 42%,rgba(8,24,30,.62))}
    [data-zone-option][aria-selected="true"] span:first-child {color:#4ca6b5}
    [data-zone-list]::-webkit-scrollbar {width:4px}
    [data-zone-list]::-webkit-scrollbar-thumb {background:#235b67}
    [data-zone-list]::-webkit-scrollbar-track {background:#071218}
    [data-luspatial-card] input {accent-color:#36dfff}
    [data-luspatial-label] {color:#71889c;font:600 9px/1.2 ui-monospace,monospace;letter-spacing:.12em}
    [data-luspatial-value] {font:600 11px/1.3 ui-monospace,monospace;color:#dff8ff;font-variant-numeric:tabular-nums}
  </style>
  <div data-luspatial-card>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(125,180,206,.16)">
      <div><div style="font:700 16px/1.1 ui-sans-serif,system-ui">luProj + luSpatial</div><div style="margin-top:3px;color:#7890a4">NYC taxi query explorer</div></div>
      <div style="padding:4px 6px;border:1px solid rgba(54,223,255,.28);border-radius:5px;color:#4be4ff;font:700 9px ui-monospace,monospace">DECK.GL · WEBGPU</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
      <div><div data-luspatial-label>CORPUS</div><div data-luspatial-value data-corpus>${formatCount(TAXI_CORPUS_POINT_COUNT)}</div></div>
      <div><div data-luspatial-label>GPU RESIDENT</div><div data-luspatial-value data-resident>—</div></div>
      <div><div data-luspatial-label>IN VIEW</div><div data-luspatial-value data-visible>—</div></div>
      <div><div data-luspatial-label>SELECTED</div><div data-luspatial-value data-selected style="color:#49e3ff">—</div></div>
    </div>
    <div data-basemap-warning hidden style="margin-top:9px;color:#e9ba7d;font:9px/1.45 ui-monospace,monospace"></div>
    <div style="margin-top:12px"><div data-luspatial-label>TAXI ZONE PRESET</div>
      <div data-zone-picker>
        <button data-zone-trigger type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="luspatial-zone-list" aria-label="Taxi zone preset: Manhattan, Midtown Center"><span data-zone-trigger-label>MANHATTAN · MIDTOWN CENTER</span></button>
        <div data-zone-list id="luspatial-zone-list" role="listbox" aria-label="Taxi zone presets" hidden>
          ${zones.map(zone => `<button data-zone-option="${zone.id}" type="button" role="option" tabindex="-1" aria-selected="${zone.id === initialZoneId}"><span>${zone.borough}</span><span>${zone.name}</span></button>`).join('')}
        </div>
      </div>
    </div>
    <label style="display:block;margin-top:10px"><span style="display:flex;justify-content:space-between"><span data-luspatial-label>QUERY RADIUS</span><strong data-radius-value style="color:#49e3ff;font:600 10px ui-monospace,monospace">0.35 km</strong></span>
      <input data-radius aria-label="Query radius in kilometres" type="range" min="0.1" max="3" step="0.05" value="0.35" />
    </label>
    <div style="margin-top:9px;padding:8px;border-radius:6px;background:rgba(32,210,242,.07);border:1px solid rgba(42,218,249,.13)">
      <div data-luspatial-label>QUERY CENTER</div><div data-coordinate style="margin-top:3px;color:#cdebf4;font:10px/1.4 ui-monospace,monospace">—</div>
    </div>
    <div data-source-status style="margin-top:7px;color:#6f8598;font:9px/1.35 ui-monospace,monospace">DETERMINISTIC GENERATED FIXTURE · NO NETWORK REQUEST</div>
    <div style="display:flex;justify-content:space-between;gap:10px;margin-top:9px;color:#6f8598;font:9px/1.35 ui-monospace,monospace">
      <span>CLICK TO MOVE QUERY<br/>DRAG / SCROLL TO NAVIGATE</span>
      <span style="text-align:right"><span data-query-time>—</span> CPU ENCODE<br/>GPU COUNT → INDIRECT DRAW</span>
    </div>
    <details style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(125,180,206,.16)">
      <summary style="cursor:pointer;color:#829bb1;font:700 9px/1.4 ui-monospace,monospace;letter-spacing:.08em">COMMAND GRAPH INSPECTOR</summary>
      <div data-graph-inspector style="margin-top:8px"></div>
    </details>
  </div>`;
  container.appendChild(root);

  const zonePicker = root.querySelector<HTMLElement>('[data-zone-picker]')!;
  const zoneTrigger = root.querySelector<HTMLButtonElement>('[data-zone-trigger]')!;
  const zoneTriggerLabel = root.querySelector<HTMLElement>('[data-zone-trigger-label]')!;
  const zoneList = root.querySelector<HTMLElement>('[data-zone-list]')!;
  const zoneOptions = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-zone-option]'));
  const radiusInput = root.querySelector<HTMLInputElement>('[data-radius]')!;
  const radiusValue = root.querySelector<HTMLElement>('[data-radius-value]')!;
  const coordinateElement = root.querySelector<HTMLElement>('[data-coordinate]')!;
  const corpusElement = root.querySelector<HTMLElement>('[data-corpus]')!;
  const sourceStatusElement = root.querySelector<HTMLElement>('[data-source-status]')!;
  const residentElement = root.querySelector<HTMLElement>('[data-resident]')!;
  const basemapWarningElement = root.querySelector<HTMLElement>('[data-basemap-warning]')!;
  const visibleElement = root.querySelector<HTMLElement>('[data-visible]')!;
  const selectedElement = root.querySelector<HTMLElement>('[data-selected]')!;
  const queryTimeElement = root.querySelector<HTMLElement>('[data-query-time]')!;
  const graphInspectorElement = root.querySelector<HTMLElement>('[data-graph-inspector]')!;
  const graphInspectorPanel = new GPUCommandGraphInspectorPanel(graphInspectorElement, {
    graphLabels: {
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.build]: 'luProj projection + grid build',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.query]: 'Viewport + radius queries'
    },
    counterLabels: {
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportIntersectedCells]: 'Viewport cells',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportCandidates]: 'Viewport candidates',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportMatches]: 'Viewport matches',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionIntersectedCells]: 'Selection cells',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionCandidates]: 'Selection candidates',
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionMatches]: 'Selection matches'
    }
  });

  const closeZonePicker = (restoreFocus = false) => {
    zoneList.hidden = true;
    zoneTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) zoneTrigger.focus();
  };
  const openZonePicker = (focusIndex?: number) => {
    zoneList.hidden = false;
    zoneTrigger.setAttribute('aria-expanded', 'true');
    const selectedIndex = zoneOptions.findIndex(
      option => option.getAttribute('aria-selected') === 'true'
    );
    zoneOptions[focusIndex ?? Math.max(selectedIndex, 0)]?.focus();
  };
  const selectZoneOption = (option: HTMLButtonElement) => {
    const zone = zones.find(candidate => String(candidate.id) === option.dataset.zoneOption);
    if (!zone) return;
    for (const candidate of zoneOptions) {
      candidate.setAttribute('aria-selected', String(candidate === option));
    }
    zoneTriggerLabel.textContent = `${zone.borough} · ${zone.name}`;
    zoneTrigger.setAttribute('aria-label', `Taxi zone preset: ${zone.borough}, ${zone.name}`);
    closeZonePicker(true);
    callbacks.onZoneChange(zone);
  };
  const onZoneTriggerClick = () => {
    if (zoneList.hidden) openZonePicker();
    else closeZonePicker();
  };
  const onZoneTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openZonePicker(event.key === 'ArrowUp' ? zoneOptions.length - 1 : undefined);
    } else if (event.key === 'Escape') {
      closeZonePicker();
    }
  };
  const onZoneOptionClick = (event: Event) => {
    selectZoneOption(event.currentTarget as HTMLButtonElement);
  };
  const onZoneOptionKeyDown = (event: KeyboardEvent) => {
    const option = event.currentTarget as HTMLButtonElement;
    const optionIndex = zoneOptions.indexOf(option);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (optionIndex + 1) % zoneOptions.length;
    else if (event.key === 'ArrowUp')
      nextIndex = (optionIndex - 1 + zoneOptions.length) % zoneOptions.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = zoneOptions.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectZoneOption(option);
      return;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeZonePicker(true);
      return;
    } else if (event.key === 'Tab') {
      closeZonePicker();
      return;
    } else if (event.key.length === 1) {
      const search = event.key.toLocaleLowerCase();
      nextIndex = zoneOptions.findIndex(candidate =>
        candidate.textContent?.trim().toLocaleLowerCase().startsWith(search)
      );
    }
    if (nextIndex !== null && nextIndex >= 0) {
      event.preventDefault();
      zoneOptions[nextIndex]?.focus();
    }
  };
  const onDocumentPointerDown = (event: PointerEvent) => {
    if (event.target instanceof Node && !zonePicker.contains(event.target)) closeZonePicker();
  };
  const onRadiusInput = () => {
    const radius = Number(radiusInput.value);
    radiusValue.textContent = `${radius.toFixed(2)} km`;
    callbacks.onRadiusChange(radius);
  };
  zoneTrigger.addEventListener('click', onZoneTriggerClick);
  zoneTrigger.addEventListener('keydown', onZoneTriggerKeyDown);
  for (const option of zoneOptions) {
    option.addEventListener('click', onZoneOptionClick);
    option.addEventListener('keydown', onZoneOptionKeyDown);
  }
  document.addEventListener('pointerdown', onDocumentPointerDown);
  radiusInput.addEventListener('input', onRadiusInput);

  return {
    destroy: () => {
      zoneTrigger.removeEventListener('click', onZoneTriggerClick);
      zoneTrigger.removeEventListener('keydown', onZoneTriggerKeyDown);
      for (const option of zoneOptions) {
        option.removeEventListener('click', onZoneOptionClick);
        option.removeEventListener('keydown', onZoneOptionKeyDown);
      }
      document.removeEventListener('pointerdown', onDocumentPointerDown);
      radiusInput.removeEventListener('input', onRadiusInput);
      graphInspectorPanel.destroy();
      root.remove();
    },
    setBasemapStatus: status => {
      basemapWarningElement.hidden = !status;
      basemapWarningElement.textContent = status;
    },
    setCoordinate: (coordinate, label) => {
      coordinateElement.textContent = `${label} · ${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`;
    },
    setCustomZone: () => {
      for (const option of zoneOptions) option.setAttribute('aria-selected', 'false');
      zoneTriggerLabel.textContent = 'CUSTOM MAP QUERY';
      zoneTrigger.setAttribute('aria-label', 'Taxi zone preset: custom map query');
      closeZonePicker();
    },
    setLoadingProgress: (processedPointCount, totalPointCount) => {
      const percentage = Math.round((processedPointCount / Math.max(1, totalPointCount)) * 100);
      residentElement.textContent = `${percentage}% loading`;
    },
    updateSourceStatus: status => {
      if (status.corpusPointCount !== undefined) {
        corpusElement.textContent = formatCount(status.corpusPointCount);
      }
      sourceStatusElement.textContent = status.message;
    },
    updateStats: stats => {
      residentElement.textContent = formatCount(stats.residentPointCount);
      visibleElement.textContent = formatCount(stats.visiblePointCount);
      selectedElement.textContent = formatCount(stats.selectedPointCount);
      queryTimeElement.textContent = `${stats.queryEncodingMilliseconds.toFixed(2)} ms`;
      graphInspectorPanel.update(
        stats.inspectorSnapshot,
        LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.query
      );
    }
  };
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export function formatByteCount(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`;
}

export function createBasemapContainer(container: HTMLElement): HTMLDivElement {
  const basemapContainer = document.createElement('div');
  Object.assign(basemapContainer.style, {
    position: 'absolute',
    inset: '0',
    zIndex: '0',
    pointerEvents: 'none'
  });
  container.prepend(basemapContainer);
  return basemapContainer;
}
