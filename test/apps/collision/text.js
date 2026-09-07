// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {TextLayer, GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';

const extensions = [new CollisionFilterExtension()];
const initialViewState = {target: [0, 0, 0], zoom: 0};
const settings = {
  scene: 'pairs',
  geojson: false,
  collisionEnabled: true,
  reversePriority: false,
  anchor: 'middle',
  baseline: 'center',
  offsetX: 0,
  offsetY: 0,
  angle: 0,
  size: 24,
  collisionScale: 1,
  background: false,
  billboard: true,
  sdf: false,
  zoom: 0,
  devicePixels: 1
};

function createData(scene) {
  const count = scene === 'stress' ? 10000 : 12;
  return Array.from({length: count}, (_, index) => {
    const pair = Math.floor(index / 2);
    const high = index % 2 === 0;
    const columns = scene === 'stress' ? 100 : 2;
    return {
      position: [
        150 + (pair % columns) * 220 + (high ? 0 : 20),
        Math.floor(pair / columns) * 90 - 180
      ],
      text:
        scene === 'multiline'
          ? 'Label\nsecond line'
          : scene === 'whitespace'
            ? '  Label  '
            : `Label ${pair}`,
      high,
      index
    };
  });
}
let data = createData(settings.scene);
let geojson;
function updateData() {
  data = createData(settings.scene);
  geojson = {
    type: 'FeatureCollection',
    features: data.map(d => ({
      type: 'Feature',
      properties: d,
      geometry: {type: 'Point', coordinates: d.position}
    }))
  };
}
updateData();
const getPriority = d => (d.high !== settings.reversePriority ? 100 : -100);
const getColor = d => (d.high ? [0, 145, 85] : [215, 55, 45]);

function getLayers() {
  const textProps = {
    getText: d => d.text,
    getPosition: d => d.position,
    getColor,
    getSize: settings.size,
    getTextAnchor: settings.anchor,
    getAlignmentBaseline: settings.baseline,
    getPixelOffset: [settings.offsetX, settings.offsetY],
    getAngle: settings.angle,
    billboard: settings.billboard,
    background: settings.background,
    getBackgroundColor: [210, 220, 230],
    fontFamily: 'Arial',
    fontSettings: {sdf: settings.sdf},
    extensions,
    getCollisionPriority: getPriority,
    collisionEnabled: settings.collisionEnabled,
    collisionTestProps: {sizeScale: settings.collisionScale},
    updateTriggers: {getCollisionPriority: settings.reversePriority},
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  };
  return [
    new ScatterplotLayer({
      id: 'anchors',
      data,
      getPosition: d => d.position,
      getRadius: 3,
      radiusUnits: 'pixels',
      getFillColor: [80, 90, 100]
    }),
    settings.geojson
      ? new GeoJsonLayer({
          ...textProps,
          id: 'labels',
          data: geojson,
          pointType: 'text',
          getText: f => f.properties.text,
          getTextColor: f => getColor(f.properties),
          getTextSize: settings.size,
          getTextAnchor: settings.anchor,
          getTextAlignmentBaseline: settings.baseline,
          getTextPixelOffset: [settings.offsetX, settings.offsetY],
          getTextAngle: settings.angle,
          textBillboard: settings.billboard,
          textBackground: settings.background,
          textFontFamily: 'Arial',
          textFontSettings: {sdf: settings.sdf},
          getCollisionPriority: f => getPriority(f.properties)
        })
      : new TextLayer({...textProps, id: 'labels', data})
  ];
}

const deck = new Deck({
  canvas: 'deck',
  views: new OrthographicView({id: 'main'}),
  initialViewState,
  controller: true,
  useDevicePixels: settings.devicePixels,
  layers: getLayers(),
  getTooltip: ({object}) =>
    object &&
    `${(object.properties || object).text}: priority ${getPriority(object.properties || object)}`
});

function update() {
  deck.setProps({layers: getLayers(), useDevicePixels: settings.devicePixels});
}

const controls = document.getElementById('controls');
function addControl(key, title, options) {
  const label = document.createElement('label');
  const caption = document.createElement('span');
  caption.textContent = typeof settings[key] === 'number' ? `${title}: ${settings[key]}` : title;
  label.append(caption);
  const input = document.createElement(Array.isArray(options) ? 'select' : 'input');
  input.id = key;
  input.setAttribute('aria-label', title);
  if (Array.isArray(options)) {
    for (const value of options) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    }
    input.value = settings[key];
  } else if (typeof settings[key] === 'boolean') {
    input.type = 'checkbox';
    input.checked = settings[key];
  } else {
    input.type = 'range';
    Object.assign(input, options, {value: settings[key]});
  }
  input.oninput = () => {
    settings[key] =
      input.type === 'checkbox'
        ? input.checked
        : typeof settings[key] === 'number'
          ? Number(input.value)
          : input.value;
    if (typeof settings[key] === 'number') caption.textContent = `${title}: ${settings[key]}`;
    if (key === 'scene') updateData();
    if (key === 'zoom')
      deck.setProps({initialViewState: {...initialViewState, zoom: settings.zoom}});
    update();
  };
  label.append(input);
  controls.append(label);
}
addControl('scene', 'Scene', ['pairs', 'multiline', 'whitespace', 'stress']);
addControl('geojson', 'GeoJSON text');
addControl('collisionEnabled', 'Collisions');
addControl('reversePriority', 'Reverse priority');
addControl('anchor', 'Anchor', ['start', 'middle', 'end']);
addControl('baseline', 'Baseline', ['top', 'center', 'bottom']);
addControl('offsetX', 'Offset X', {min: -200, max: 200, step: 1});
addControl('offsetY', 'Offset Y', {min: -200, max: 200, step: 1});
addControl('angle', 'Angle', {min: -180, max: 180, step: 15});
addControl('size', 'Size', {min: 8, max: 64, step: 1});
addControl('collisionScale', 'Collision scale', {min: 1, max: 3, step: 0.25});
addControl('zoom', 'Zoom', {min: -2, max: 3, step: 0.1});
addControl('devicePixels', 'Device pixel ratio', {min: 1, max: 2, step: 1});
addControl('background', 'Background');
addControl('billboard', 'Billboard');
addControl('sdf', 'SDF');
document.getElementById('reset').onclick = () => deck.setProps({initialViewState});

async function benchmark() {
  const samples = [];
  const start = performance.now();
  let previous = start;
  for (let frame = 0; frame < 180; frame++) {
    await new Promise(requestAnimationFrame);
    const now = performance.now();
    if (frame >= 30) samples.push(now - previous);
    previous = now;
    deck.setProps({
      viewState: {target: [frame * 0.5, 0, 0], zoom: settings.zoom + Math.sin(frame / 30) * 0.2}
    });
  }
  deck.setProps({viewState: null, initialViewState});
  samples.sort((a, b) => a - b);
  const result = {
    labels: data.length,
    medianMs: samples[Math.floor(samples.length / 2)],
    p95Ms: samples[Math.floor(samples.length * 0.95)]
  };
  document.getElementById('metrics').textContent =
    `${result.labels} labels: median ${result.medianMs.toFixed(1)} ms, p95 ${result.p95Ms.toFixed(1)} ms`;
  return result;
}
document.getElementById('benchmark').onclick = benchmark;
// Development/automation API: stable data, explicit updates, and repeatable camera motion.
window.collisionTest = {deck, settings, update, benchmark};
