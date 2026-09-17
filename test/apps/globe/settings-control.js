// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */

export function createSettingsControl({
  onZoomAroundChange,
  onViewChange,
  onRubberBandChange,
  onConstraintChange,
  onDragModeChange,
  onInertiaChange,
  onDataChange,
  onReset
}) {
  const style = document.createElement('style');
  style.textContent = `
    .globe-controls, .globe-readout {
      position: fixed; z-index: 1000; box-sizing: border-box;
      background: rgba(24, 27, 29, .94); color: #f5f5f5;
      font: 12px/1.5 system-ui, sans-serif; border: 1px solid #53585b;
      border-radius: 4px; padding: 12px; max-width: calc(100vw - 24px);
    }
    .globe-controls {top: 12px; right: 12px; width: 256px;}
    .globe-controls h1 {font-size: 16px; margin: 0 0 10px;}
    .globe-controls .label {display: block; margin-top: 10px; color: #c5c9ca;}
    .globe-controls .button-row {display: flex; gap: 4px; margin-top: 4px;}
    .globe-controls button, .globe-controls select {
      font: inherit; color: inherit; background: #34383b; border: 1px solid #62696d;
      border-radius: 3px; min-height: 34px; padding: 5px 8px; cursor: pointer;
    }
    .globe-controls .button-row button {flex: 1;}
    .globe-controls button[aria-pressed=true] {background: #165d72; border-color: #73c8de;}
    .globe-controls select {width: 100%; margin-top: 4px;}
    .globe-controls footer {display: flex; align-items: center; justify-content: space-between; margin-top: 12px;}
    .globe-controls details {margin-top: 10px;}
    .globe-controls summary {cursor: pointer; color: #c5c9ca;}
    .globe-readout {left: 12px; bottom: 12px; width: 330px; pointer-events: none;}
    .globe-readout header {display: flex; justify-content: space-between; margin-bottom: 8px;}
    .globe-readout table {width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums;}
    .globe-readout th {font-weight: 400; text-align: right; color: #b5bbbd; font-size: 11px;}
    .globe-readout td {text-align: right; padding: 4px 0; border-top: 1px solid #454a4d;}
    .globe-readout th:first-child, .globe-readout td:first-child {text-align: left;}
    .globe-readout [data-overshoot=true] {color: #ffc75e;}
    .globe-readout [data-bounds] {margin-top: 8px; color: #ffc75e;}
    @media (max-width: 600px) {
      .globe-controls {width: 230px; padding: 10px;}
      .globe-controls button, .globe-controls select {min-height: 38px;}
      .globe-controls .label {margin-top: 6px;}
      .globe-readout {width: calc(100vw - 24px); padding: 10px;}
      .globe-readout td {padding: 3px 0;}
    }
  `;
  document.head.appendChild(style);

  const controls = document.createElement('section');
  controls.className = 'globe-controls';
  controls.setAttribute('aria-label', 'Globe constraints');
  controls.innerHTML = `
    <h1>Globe constraints</h1>
    <div class="button-row" role="group" aria-label="Boundary response">
      <button type="button" data-rubber-band="false">Hard stop</button>
      <button type="button" data-rubber-band="true">Rubber band</button>
    </div>
    <label class="label" for="constraint-preset">Limits</label>
    <select id="constraint-preset">
      <option value="none">Default limits</option>
      <option value="pan">Pan + zoom</option>
      <option value="rotation">Bearing + tilt + zoom</option>
      <option value="all">All limits</option>
    </select>
    <span class="label">Drag</span>
    <div class="button-row" role="group" aria-label="Drag action">
      <button type="button" data-drag-mode="pan">Pan</button>
      <button type="button" data-drag-mode="rotate">Bearing + tilt</button>
    </div>
    <details>
      <summary>View / zoom anchor</summary>
      <div class="button-row" role="group" aria-label="View">
        <button type="button" data-view-type="globe">Globe</button>
        <button type="button" data-view-type="map">Map</button>
      </div>
      <div class="button-row" role="group" aria-label="Zoom anchor">
        <button type="button" data-zoom-around="pointer">Pointer</button>
        <button type="button" data-zoom-around="center">Center</button>
      </div>
      <label><input type="checkbox" data-option="data" /> Airports + routes</label>
    </details>
    <footer>
      <label><input type="checkbox" data-option="inertia" /> Momentum</label>
      <button type="button" data-action="reset">Reset view</button>
    </footer>
  `;
  document.body.appendChild(controls);

  const readout = document.createElement('section');
  readout.className = 'globe-readout';
  readout.setAttribute('aria-label', 'Live constraints');
  readout.innerHTML = `
    <header><strong>Live camera</strong><span data-status>Within limits</span></header>
    <table>
      <thead><tr><th>Axis / limits</th><th>Current</th><th>On release</th></tr></thead>
      <tbody>${['longitude', 'latitude', 'zoom', 'bearing', 'pitch']
        .map(key => `<tr data-axis="${key}"><td></td><td></td><td></td></tr>`)
        .join('')}</tbody>
    </table>
    <div data-bounds></div>
  `;
  document.body.appendChild(readout);

  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const {zoomAround, viewType, rubberBand, dragMode, action} = button.dataset;
    if (zoomAround) onZoomAroundChange(zoomAround);
    else if (viewType) onViewChange(viewType);
    else if (rubberBand) onRubberBandChange(rubberBand === 'true');
    else if (dragMode) onDragModeChange(dragMode);
    else if (action === 'reset') onReset();
  });
  controls.addEventListener('change', event => {
    if (event.target.dataset.option === 'inertia') onInertiaChange(event.target.checked);
    else if (event.target.dataset.option === 'data') onDataChange(event.target.checked);
    else if (event.target.id === 'constraint-preset') onConstraintChange(event.target.value);
  });

  return {
    update({viewState, settledViewState, interactionState, maxBounds, ...settings}) {
      controls.querySelector('[data-option="inertia"]').checked = settings.inertia;
      controls.querySelector('[data-option="data"]').checked = settings.showData;
      controls.querySelector('#constraint-preset').value = settings.constraintPreset;
      for (const button of controls.querySelectorAll('button')) {
        const key = Object.keys(button.dataset)[0];
        if (key !== 'action') {
          button.setAttribute(
            'aria-pressed',
            String(String(settings[key]) === button.dataset[key])
          );
        }
      }
      const format = value => (Number.isFinite(value) ? value.toFixed(1) : 'free');
      const labels = {
        longitude: 'Longitude',
        latitude: 'Latitude',
        zoom: `Zoom ${viewState.minZoom} to ${viewState.maxZoom}`,
        bearing:
          settings.viewType === 'map' || !Number.isFinite(viewState.minBearing)
            ? 'Bearing (free)'
            : `Bearing ${viewState.minBearing} to ${viewState.maxBearing}`,
        pitch: `Tilt ${viewState.minPitch} to ${viewState.maxPitch}`
      };
      let overshoot = false;
      for (const row of readout.querySelectorAll('[data-axis]')) {
        const key = row.dataset.axis;
        const current = viewState[key] || 0;
        const settled = settledViewState[key] || 0;
        const outside = Math.abs(current - settled) > 0.01;
        overshoot ||= outside;
        row.dataset.overshoot = String(outside);
        row.children[0].textContent = labels[key];
        row.children[1].textContent = format(current);
        row.children[2].textContent = outside ? format(settled) : '-';
      }
      const status = readout.querySelector('[data-status]');
      status.textContent = overshoot
        ? interactionState.isDragging
          ? 'Stretched'
          : 'Returning'
        : 'Within limits';
      status.dataset.overshoot = String(overshoot);
      readout.querySelector('[data-bounds]').textContent = maxBounds
        ? `Region: longitude ${maxBounds[0][0]} to ${maxBounds[1][0]}, latitude ${maxBounds[0][1]} to ${maxBounds[1][1]}`
        : 'Pan: no regional bounds';
    }
  };
}
