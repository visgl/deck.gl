/* global fetch */
import React, {useMemo} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {BrushingExtension} from '@deck.gl/extensions';
import {scaleLinear} from 'd3-scale';

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

export const inFlowColors = [[35, 181, 184]];
export const outFlowColors = [[166, 3, 3]];

// migrate out
const SOURCE_COLOR = [166, 3, 3];
// migrate in
const TARGET_COLOR = [35, 181, 184];

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const brushingExtension = new BrushingExtension();

/* eslint-disable  max-nested-callbacks */
function getLayerData(data) {
  if (!data || !data.length) {
    return {};
  }
  const arcs = [];
  const targets = [];
  const sources = [];
  const pairs = {};

  data.forEach((county, i) => {
    const {flows, centroid: targetCentroid} = county.properties;
    const value = {gain: 0, loss: 0};

    Object.keys(flows).forEach(toId => {
      value[flows[toId] > 0 ? 'gain' : 'loss'] += flows[toId];

      // if number too small, ignore it
      if (Math.abs(flows[toId]) < 50) {
        return;
      }
      const pairKey = [i, Number(toId)].sort((a, b) => a - b).join('-');
      const sourceCentroid = data[toId].properties.centroid;
      const gain = Math.sign(flows[toId]);

      // add point at arc source
      sources.push({
        position: sourceCentroid,
        target: targetCentroid,
        name: data[toId].properties.name,
        radius: 3,
        gain: -gain
      });

      // eliminate duplicates arcs
      if (pairs[pairKey]) {
        return;
      }

      pairs[pairKey] = true;

      arcs.push({
        target: gain > 0 ? targetCentroid : sourceCentroid,
        source: gain > 0 ? sourceCentroid : targetCentroid,
        value: flows[toId]
      });
    });

    // add point at arc target
    targets.push({
      ...value,
      position: [targetCentroid[0], targetCentroid[1], 10],
      net: value.gain + value.loss,
      name: county.properties.name
    });
  });

  // sort targets by radius large -> small
  targets.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const sizeScale = scaleLinear()
    .domain([0, Math.abs(targets[0].net)])
    .range([36, 400]);

  targets.forEach(pt => {
    pt.radius = Math.sqrt(sizeScale(Math.abs(pt.net)));
  });

  return {arcs, targets, sources};
}

function getTooltip({object}) {
  return (
    object &&
    `\
    ${object.name}
    Net gain: ${object.net}`
  );
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  enableBrushing = true,
  brushRadius = 100000,
  strokeWidth = 1,
  opacity = 0.7,
  mapStyle = MAP_STYLE
}) {
  const {arcs, targets, sources} = useMemo(() => getLayerData(data), [data]);

  const layers = arcs &&
    targets && [
      new ScatterplotLayer({
        id: 'sources',
        data: sources,
        brushingRadius: brushRadius,
        brushingEnabled: enableBrushing,
        // only show source points when brushing
        radiusScale: enableBrushing ? 3000 : 0,
        getFillColor: d => (d.gain > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [brushingExtension]
      }),
      new ScatterplotLayer({
        id: 'targets-ring',
        data: targets,
        brushingRadius: brushRadius,
        lineWidthMinPixels: 2,
        stroked: true,
        filled: false,
        brushingEnabled: enableBrushing,
        // only show rings when brushing
        radiusScale: enableBrushing ? 4000 : 0,
        getLineColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [brushingExtension]
      }),
      new ScatterplotLayer({
        id: 'targets',
        data: targets,
        brushingRadius: brushRadius,
        brushingEnabled: enableBrushing,
        pickable: true,
        radiusScale: 3000,
        getFillColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [brushingExtension]
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getWidth: strokeWidth,
        opacity,
        brushingRadius: brushRadius,
        brushingEnabled: enableBrushing,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: SOURCE_COLOR,
        getTargetColor: TARGET_COLOR,
        extensions: [brushingExtension]
      })
    ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      render(<App data={features} />, container);
    });
}
