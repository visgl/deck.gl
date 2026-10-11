// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useMemo, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import {useColorMode} from '@docusaurus/theme-common';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {DeckGL} from '@deck.gl/react';
import {PathLayer, ScatterplotLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {ResetViewWidget, DarkGlassTheme, LightGlassTheme} from '@deck.gl/widgets';

const DEMO_STYLE = {position: 'relative', width: '100%', height: '50vh', minHeight: 360};
// The shapes are wide and short
const SHAPES_DEMO_STYLE = {position: 'relative', width: '100%', height: 280};

const CONTROLS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 32px',
  padding: '12px 0',
  fontSize: 13
};

const ROW_STYLE = {display: 'inline-flex', alignItems: 'center', gap: 8};

// Both demos draw in meters around [0, 0] on a blank background
const LAYER_PROPS = {
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [0, 0, 0]
};

function Control({label, children}) {
  return (
    <label style={ROW_STYLE}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Slider({value, min, max, step, onChange}) {
  return (
    <span style={ROW_STYLE}>
      <input
        type="range"
        style={{width: 120}}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span style={{minWidth: 24}}>{value}</span>
    </span>
  );
}

function Select({value, options, onChange}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// Returns a copy of `dashArrays` with one value of the `key` pattern replaced
function setDashValue(dashArrays, key, index, value) {
  const dashArray = [...dashArrays[key]];
  dashArray[index] = value;
  return {...dashArrays, [key]: dashArray};
}

/* Road demo */

// A winding road in meters, with straight stretches and tight curves
const ROAD_PATH = [
  [38.35, 173.65],
  [293.1, -81.1],
  [303.65, -96.2],
  [308.45, -114.05],
  [306.85, -132.45],
  [299, -149.15],
  [285.95, -162.2],
  [269.25, -170.05],
  [250.85, -171.6],
  [233, -166.85],
  [217.9, -156.25],
  [-7.6, 69.25],
  [-22.7, 81.8],
  [-39.9, 91.4],
  [-58.6, 97.6],
  [-78.1, 100.25],
  [-97.75, 99.3],
  [-116.9, 94.75],
  [-134.9, 86.7],
  [-151.05, 75.45],
  [-164.9, 61.45],
  [-175.95, 45.15],
  [-183.8, 27.1],
  [-188.15, 7.9],
  [-188.85, -11.75],
  [-186, -31.25],
  [-179.55, -49.85],
  [-169.75, -66.95],
  [-157, -81.9],
  [-141.7, -94.35],
  [-124.4, -103.7],
  [-105.65, -109.7],
  [-86.1, -112.15],
  [-66.45, -110.95],
  [-47.4, -106.2],
  [-29.5, -97.95],
  [-13.45, -86.5],
  [1.45, -73.9],
  [19.65, -66.55],
  [39.25, -66.35],
  [57.6, -73.25],
  [72.2, -86.3],
  [81.05, -103.8],
  [83, -123.3],
  [77.7, -142.15],
  [65.95, -157.85],
  [49.3, -168.2],
  [30.05, -171.8],
  [-288.85, -171.8]
];

const ROAD_VIEW_STATE = {longitude: 0, latitude: 0, zoom: 16.5, maxZoom: 22};
const ROAD_DASH_UNITS = ['widths', 'meters', 'pixels'];
const ROAD_DASH_ARRAYS = {widths: [4, 3], meters: [4, 3], pixels: [8, 6]};
const ROAD_MAX_DASH = {widths: 20, meters: 20, pixels: 40};

function getRoadCode({dashMode, dashUnits, dashArray, edgeOffset}) {
  return `import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

// \`path\` is the road's centerline, an array of [longitude, latitude] positions
function getRoadLayer(path) {
  return new PathLayer({
    id: 'road',
    data: [
      {path, dashArray: [${dashArray.join(', ')}], offset: 0, color: [60, 100, 160]}, // center line
      {path, dashArray: [0, 0], offset: -${edgeOffset}, color: [0, 0, 0]}, // left edge
      {path, dashArray: [0, 0], offset: ${edgeOffset}, color: [0, 0, 0]} // right edge
    ],
    getPath: d => d.path,
    getColor: d => d.color,
    getWidth: 2,

    // props added by PathStyleExtension
    getDashArray: d => d.dashArray,
    dashUnits: '${dashUnits}',
    getOffset: d => d.offset,

    extensions: [new PathStyleExtension({dashMode: '${dashMode}', offset: true})]
  });
}`;
}

export function PathStyleExtensionDemo() {
  const {colorMode} = useColorMode();
  const [dashMode, setDashMode] = useState('path');
  const [dashUnits, setDashUnits] = useState('widths');
  const [dashArrays, setDashArrays] = useState(ROAD_DASH_ARRAYS);
  const [edgeOffset, setEdgeOffset] = useState(5);

  const dashArray = dashArrays[dashUnits];
  const edgeColor = colorMode === 'dark' ? [220, 220, 220] : [0, 0, 0];
  const extension = useMemo(() => new PathStyleExtension({dashMode, offset: true}), [dashMode]);

  const layers = [
    new PathLayer({
      ...LAYER_PROPS,
      // A new extension instance needs a new layer
      id: `road-${dashMode}`,
      data: [
        {dashArray, offset: 0, color: [60, 100, 160]},
        {dashArray: [0, 0], offset: -edgeOffset, color: edgeColor},
        {dashArray: [0, 0], offset: edgeOffset, color: edgeColor}
      ],
      getPath: () => ROAD_PATH,
      getColor: d => d.color,
      getWidth: 2,
      getDashArray: d => d.dashArray,
      dashUnits,
      getOffset: d => d.offset,
      extensions: [extension]
    })
  ];

  return (
    <>
      <div style={DEMO_STYLE}>
        <DeckGL
          initialViewState={ROAD_VIEW_STATE}
          controller
          layers={layers}
          widgets={[new ResetViewWidget()]}
          style={colorMode === 'dark' ? DarkGlassTheme : LightGlassTheme}
        />
      </div>
      <div style={CONTROLS_STYLE}>
        <Control label="dashMode">
          <Select value={dashMode} options={['path', 'segment']} onChange={setDashMode} />
        </Control>
        <Control label="dashUnits">
          <Select value={dashUnits} options={ROAD_DASH_UNITS} onChange={setDashUnits} />
        </Control>
        <Control label="Dash">
          <Slider
            value={dashArray[0]}
            min={0}
            max={ROAD_MAX_DASH[dashUnits]}
            step={0.5}
            onChange={value => setDashArrays(setDashValue(dashArrays, dashUnits, 0, value))}
          />
        </Control>
        <Control label="Gap">
          <Slider
            value={dashArray[1]}
            min={0}
            max={ROAD_MAX_DASH[dashUnits]}
            step={0.5}
            onChange={value => setDashArrays(setDashValue(dashArrays, dashUnits, 1, value))}
          />
        </Control>
        <Control label="Edge getOffset">
          <Slider value={edgeOffset} min={1} max={10} step={0.5} onChange={setEdgeOffset} />
        </Control>
      </div>
      <CodeBlock language="js">
        {getRoadCode({dashMode, dashUnits, dashArray, edgeOffset})}
      </CodeBlock>
    </>
  );
}

/* Dash mode demo */

// Points along a circle, from `startAngle` to `endAngle` in degrees
function getArc([cx, cy], radius, startAngle, endAngle, count) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const angle = ((startAngle + ((endAngle - startAngle) * i) / count) * Math.PI) / 180;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return points;
}

// Two loops drawn with many short segments, running downward with the loops to the left
function getLoops([x, y], count) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = (i / count) * 4 * Math.PI;
    points.push([x - 50 * (1 - Math.cos(t)), y + 50 - 8 * t - 34 * Math.sin(t)]);
  }
  return points;
}

// The three shapes where the dash modes differ most, in meters
const SHAPES = [
  // Long, separate lines
  [
    [-175, -50],
    [-115, 50]
  ],
  [
    [-115, 50],
    [-115, -50]
  ],
  [
    [-150, -10],
    [-115, -10]
  ],
  // A polyline with sharp corners
  getArc([-23, 0], 52, 180, -180, 6),
  // A smooth curve made of many short segments
  getLoops([169, 0], 72)
];

const DASH_MODE_VIEW_STATE = {longitude: 0, latitude: 0, zoom: 17, maxZoom: 22};

function getDashModeCode({dashMode, dashArray, dashJustified}) {
  return `new PathLayer({
  // ...
  getDashArray: [${dashArray.join(', ')}],
  dashJustified: ${dashJustified},
  extensions: [new PathStyleExtension({dashMode: '${dashMode}'})]
});`;
}

export function PathStyleDashModeDemo() {
  const {colorMode} = useColorMode();
  const [dashMode, setDashMode] = useState('path');
  const [dashJustified, setDashJustified] = useState(false);
  const [dashArray, setDashArray] = useState([3, 2]);

  const data = useMemo(() => SHAPES.map(path => ({path})), []);
  const extension = useMemo(() => new PathStyleExtension({dashMode}), [dashMode]);

  const layers = [
    new PathLayer({
      ...LAYER_PROPS,
      id: 'centerline',
      data,
      getPath: d => d.path,
      getColor: [128, 128, 128, 160],
      getWidth: 1,
      widthUnits: 'pixels'
    }),
    new ScatterplotLayer({
      ...LAYER_PROPS,
      // Vertices, where 'segment' mode restarts the pattern
      id: 'vertices',
      data: SHAPES.flat(),
      getPosition: d => d,
      getRadius: 2,
      radiusUnits: 'pixels',
      getFillColor: [128, 128, 128]
    }),
    new PathLayer({
      ...LAYER_PROPS,
      // A new extension instance needs a new layer
      id: `shapes-${dashMode}`,
      data,
      getPath: d => d.path,
      getColor: [0, 120, 255],
      getWidth: 8,
      widthUnits: 'pixels',
      getDashArray: dashArray,
      dashJustified,
      extensions: [extension],
      updateTriggers: {getDashArray: dashArray}
    })
  ];

  return (
    <>
      <div style={SHAPES_DEMO_STYLE}>
        <DeckGL
          initialViewState={DASH_MODE_VIEW_STATE}
          controller
          layers={layers}
          widgets={[new ResetViewWidget()]}
          style={colorMode === 'dark' ? DarkGlassTheme : LightGlassTheme}
        />
      </div>
      <div style={CONTROLS_STYLE}>
        <Control label="dashMode">
          <Select value={dashMode} options={['path', 'segment']} onChange={setDashMode} />
        </Control>
        <Control label="dashJustified">
          <input
            type="checkbox"
            checked={dashJustified}
            onChange={e => setDashJustified(e.target.checked)}
          />
        </Control>
        <Control label="Dash">
          <Slider
            value={dashArray[0]}
            min={0}
            max={10}
            step={0.5}
            onChange={value => setDashArray([value, dashArray[1]])}
          />
        </Control>
        <Control label="Gap">
          <Slider
            value={dashArray[1]}
            min={0}
            max={10}
            step={0.5}
            onChange={value => setDashArray([dashArray[0], value])}
          />
        </Control>
      </div>
      <CodeBlock language="js">{getDashModeCode({dashMode, dashArray, dashJustified})}</CodeBlock>
    </>
  );
}
