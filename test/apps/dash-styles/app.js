// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */

import {Deck, MapView} from '@deck.gl/core';
import {PathLayer, TextLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

// The point of this app is to watch dashes *while* zooming. Golden images can only sample
// discrete zoom levels; the failures this extension has historically had - dashes that
// appear only past a zoom threshold, patterns that shift as segments change, billboard and
// flat lines drifting apart - are all motion artifacts. Every row below draws the same
// stroke, so any visible difference between rows is a bug.

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.78,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

const ROW_SPACING = 0.004;
const LONGITUDE_SPAN = 0.16;

/** A straight horizontal line at `latitude`, split into `segments` equal collinear pieces. */
function createStraightPath(segments, latitude) {
  const path = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    path.push([-122.48 + (LONGITUDE_SPAN * pointIndex) / segments, latitude]);
  }
  return path;
}

/** A line that climbs in Z, so 2D and 3D arclength disagree. */
function createClimbingPath(segments, latitude, height) {
  const path = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    const fraction = pointIndex / segments;
    path.push([-122.48 + LONGITUDE_SPAN * fraction, latitude, height * fraction]);
  }
  return path;
}

/** A circle of short chords - the dense-polyline case that renders solid today. */
function createCirclePath(segments, center, radius) {
  const path = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    const angle = (pointIndex / segments) * 2 * Math.PI;
    path.push([center[0] + radius * Math.cos(angle) * 1.27, center[1] + radius * Math.sin(angle)]);
  }
  return path;
}

// Rows are stacked top to bottom; each entry is [label, path builder].
const ROWS = [
  ['1 segment', latitude => createStraightPath(1, latitude)],
  ['4 segments', latitude => createStraightPath(4, latitude)],
  ['20 segments', latitude => createStraightPath(20, latitude)],
  ['120 segments', latitude => createStraightPath(120, latitude)],
  ['3D climb', latitude => createClimbingPath(40, latitude, 1500)]
];

const state = {
  dashSize: 4,
  gapSize: 5,
  dashMode: 'segment',
  dashJustified: false,
  capRounded: false,
  widthUnits: 'pixels',
  width: 8,
  billboard: 'both',
  showCircle: true
};

const CONTROLS = [
  {key: 'dashSize', type: 'range', label: 'dash size', min: 0.25, max: 16, step: 0.25},
  {key: 'gapSize', type: 'range', label: 'gap size', min: 0.25, max: 16, step: 0.25},
  {key: 'width', type: 'range', label: 'stroke width', min: 1, max: 40, step: 1},
  {key: 'dashMode', type: 'select', label: 'dash mode', options: ['segment', 'path']},
  {key: 'widthUnits', type: 'select', label: 'width units', options: ['pixels', 'meters']},
  {key: 'billboard', type: 'select', label: 'billboard', options: ['both', 'off', 'on']},
  {key: 'dashJustified', type: 'checkbox', label: 'justified'},
  {key: 'capRounded', type: 'checkbox', label: 'rounded caps'},
  {key: 'showCircle', type: 'checkbox', label: 'dense circle'}
];

function buildControls(onChange) {
  const container = document.getElementById('controls');
  container.innerHTML = '<h1>PathStyleExtension dashes</h1>';

  for (const control of CONTROLS) {
    const label = document.createElement('label');
    const name = document.createElement('span');
    name.textContent = control.label;
    label.appendChild(name);

    let input;
    if (control.type === 'select') {
      input = document.createElement('select');
      for (const option of control.options) {
        const element = document.createElement('option');
        element.value = option;
        element.textContent = option;
        input.appendChild(element);
      }
      input.value = state[control.key];
    } else if (control.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = state[control.key];
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = control.min;
      input.max = control.max;
      input.step = control.step;
      input.value = state[control.key];
    }

    const readout = document.createElement('span');
    readout.className = 'value';
    readout.textContent = control.type === 'range' ? state[control.key] : '';

    input.addEventListener('input', () => {
      state[control.key] =
        control.type === 'checkbox'
          ? input.checked
          : control.type === 'range'
            ? Number(input.value)
            : input.value;
      if (control.type === 'range') {
        readout.textContent = state[control.key];
      }
      onChange();
    });

    label.appendChild(input);
    label.appendChild(readout);
    container.appendChild(label);
  }

  const legend = document.createElement('div');
  legend.id = 'legend';
  legend.innerHTML =
    '<span><i style="background:#c80000"></i>flat</span>' +
    '<span><i style="background:#005ac8"></i>billboard</span>';
  container.appendChild(legend);
}

/** Which billboard variants to draw, per the `billboard` control. */
function billboardVariants() {
  if (state.billboard === 'off') return [false];
  if (state.billboard === 'on') return [true];
  return [false, true];
}

function dashExtension() {
  return new PathStyleExtension({dash: true, dashMode: state.dashMode});
}

function buildLayers() {
  const layers = [];
  const extensions = [dashExtension()];
  const variants = billboardVariants();
  const topLatitude = INITIAL_VIEW_STATE.latitude + ROW_SPACING * 2.5;

  ROWS.forEach(([label, buildPath], rowIndex) => {
    variants.forEach((billboard, variantIndex) => {
      // When both variants are shown, offset them slightly so both stay visible.
      const offset = variants.length > 1 ? (variantIndex - 0.5) * ROW_SPACING * 0.32 : 0;
      const latitude = topLatitude - rowIndex * ROW_SPACING + offset;

      layers.push(
        new PathLayer({
          id: `row-${rowIndex}-${billboard ? 'billboard' : 'flat'}-${state.dashMode}`,
          data: [buildPath(latitude)],
          getPath: path => path,
          billboard,
          widthUnits: state.widthUnits,
          getWidth: state.widthUnits === 'meters' ? state.width * 8 : state.width,
          widthMinPixels: 1,
          getColor: billboard ? [0, 90, 200] : [200, 0, 0],
          getDashArray: [state.dashSize, state.gapSize],
          dashJustified: state.dashJustified,
          capRounded: state.capRounded,
          jointRounded: state.capRounded,
          extensions
        })
      );
    });

    layers.push(
      new TextLayer({
        id: `label-${rowIndex}`,
        data: [{position: [-122.49, topLatitude - rowIndex * ROW_SPACING], text: label}],
        getPosition: datum => datum.position,
        getText: datum => datum.text,
        getSize: 11,
        getColor: [60, 60, 60],
        getTextAnchor: 'end',
        getAlignmentBaseline: 'center',
        fontFamily: 'Monaco, monospace',
        outlineWidth: 2,
        outlineColor: [255, 255, 255]
      })
    );
  });

  if (state.showCircle) {
    const center = [-122.4, topLatitude - ROWS.length * ROW_SPACING - ROW_SPACING * 1.6];
    billboardVariants().forEach((billboard, variantIndex) => {
      layers.push(
        new PathLayer({
          id: `circle-${billboard ? 'billboard' : 'flat'}-${state.dashMode}`,
          data: [
            createCirclePath(
              120,
              [center[0] + (variantIndex - 0.5) * 0.03, center[1]],
              ROW_SPACING * 1.3
            )
          ],
          getPath: path => path,
          billboard,
          widthUnits: state.widthUnits,
          getWidth: state.widthUnits === 'meters' ? state.width * 8 : state.width,
          widthMinPixels: 1,
          getColor: billboard ? [0, 90, 200] : [200, 0, 0],
          getDashArray: [state.dashSize, state.gapSize],
          dashJustified: state.dashJustified,
          capRounded: state.capRounded,
          jointRounded: state.capRounded,
          extensions
        })
      );
    });
  }

  return layers;
}

const readout = document.getElementById('readout');

function updateReadout(viewState) {
  const period = state.dashSize + state.gapSize;
  // One dash unit is half the stroke width - see the extension docs.
  const halfWidthPixels = state.widthUnits === 'pixels' ? state.width / 2 : null;
  const periodPixels = halfWidthPixels === null ? null : (period * halfWidthPixels).toFixed(1);
  readout.textContent =
    `zoom ${viewState.zoom.toFixed(2)}  |  dash period ${period} half-widths` +
    (periodPixels === null ? '' : ` (~${periodPixels}px)`);
}

const deck = new Deck({
  views: new MapView({}),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: buildLayers(),
  onViewStateChange: ({viewState}) => updateReadout(viewState)
});

buildControls(() => deck.setProps({layers: buildLayers()}));
updateReadout(INITIAL_VIEW_STATE);
