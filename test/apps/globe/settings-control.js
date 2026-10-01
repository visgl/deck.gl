// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */

export function createSettingsControl({onZoomAroundChange, onViewChange, onReset}) {
  document.body.style.margin = '0px';

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '8px 12px',
    fontFamily: 'monospace',
    fontSize: '13px',
    borderRadius: '4px',
    zIndex: '1000',
    pointerEvents: 'none',
    lineHeight: '1.6',
    whiteSpace: 'pre'
  });
  document.body.appendChild(overlay);

  const controls = document.createElement('div');
  controls.innerHTML = `
    <div>View</div>
    <div class="button-row" role="group" aria-label="View">
      <button type="button" data-view-type="globe">Globe</button>
      <button type="button" data-view-type="map">Map</button>
    </div>
    <div class="label">Zoom anchor</div>
    <div class="button-row" role="group" aria-label="Zoom anchor">
      <button type="button" data-zoom-around="pointer">Pointer</button>
      <button type="button" data-zoom-around="center">Center</button>
    </div>
    <div class="button-row">
      <button type="button" data-action="reset">Reset</button>
    </div>
  `;
  Object.assign(controls.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.72)',
    color: '#fff',
    padding: '10px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    borderRadius: '4px',
    zIndex: '1000',
    lineHeight: '1.4'
  });
  for (const row of controls.querySelectorAll('.button-row')) {
    Object.assign(row.style, {display: 'flex', gap: '6px', margin: '6px 0 10px'});
  }
  for (const button of controls.querySelectorAll('button')) {
    Object.assign(button.style, {
      padding: '5px 8px',
      border: '1px solid rgba(255,255,255,0.35)',
      borderRadius: '3px',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      cursor: 'pointer'
    });
  }
  document.body.appendChild(controls);

  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.zoomAround) {
      onZoomAroundChange(button.dataset.zoomAround);
    } else if (button?.dataset.viewType) {
      onViewChange(button.dataset.viewType);
    } else if (button?.dataset.action === 'reset') {
      onReset();
    }
  });

  return {
    update({viewState, zoomAround, viewType}) {
      const {longitude = 0, latitude = 0, zoom = 0, bearing = 0, pitch = 0} = viewState;
      overlay.textContent =
        `view: ${viewType}  zoomAround: ${zoomAround}\n` +
        `lat: ${latitude.toFixed(2)}  lng: ${longitude.toFixed(2)}\n` +
        `zoom: ${zoom.toFixed(2)}  bearing: ${bearing.toFixed(2)}  pitch: ${pitch.toFixed(2)}`;

      for (const button of controls.querySelectorAll('button')) {
        if (!button.dataset.zoomAround && !button.dataset.viewType) {
          continue;
        }
        const isSelected =
          button.dataset.zoomAround === zoomAround || button.dataset.viewType === viewType;
        button.setAttribute('aria-pressed', String(isSelected));
        button.style.background = isSelected ? 'rgba(70,120,255,0.85)' : 'rgba(255,255,255,0.12)';
      }
    }
  };
}
